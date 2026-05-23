# -*- coding: utf-8 -*-
import numpy as np
from scipy import stats
import psycopg2
import os
import math
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

# Charge le .env situé dans le dossier backend/
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env", encoding="utf-8")


# Configuration encodage PostgreSQL
os.environ["LC_MESSAGES"] = "C"
os.environ["LANG"] = "C"
os.environ["PGCLIENTENCODING"] = "UTF8"


def get_db_connection():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return psycopg2.connect(database_url, client_encoding="UTF8")
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "portefeuille"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD"),
        client_encoding="UTF8",
    )

# 🛡️ LE BOUCLIER ANTI-CRASH JSON
def safe_round(val, decimals=2):
    """Convertit en float, arrondit, et transforme les NaN/Inf en None (null en JSON)."""
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return None
        return round(f, decimals)
    except (ValueError, TypeError):
        return None


def calculer_regression(ticker: str, fenetre_annees: int):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
    SELECT ch.date, ch.prix_cloture_ajuste
    FROM cours_historique ch
    JOIN etf e ON e.id = ch.etf_id
    WHERE e.ticker = %s
    AND ch.date >= NOW() - (%s * INTERVAL '1 year')
    ORDER BY ch.date ASC
    """, (ticker, fenetre_annees))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    # 🎯 SECURITÉ 1 : Filtrage drastique des données entrantes
    lignes_valides = []
    for r in rows:
        prix_brut = r[1]
        if prix_brut is not None:
            try:
                p = float(prix_brut)
                if not (math.isnan(p) or math.isinf(p)):
                    lignes_valides.append((r[0], p))
            except (ValueError, TypeError):
                pass

    if len(lignes_valides) < 2:
        return None

    dates = [r[0] for r in lignes_valides]
    prix = [r[1] for r in lignes_valides]

    # Variables de régression
    X = np.arange(len(prix))
    Y = np.array(prix, dtype=float)

    # Calcul OLS (Ordinary Least Squares)
    slope, intercept, r_value, p_value, std_err = stats.linregress(X, Y)

    # Valeurs prédites par la droite
    Y_pred = intercept + slope * X
    residus = Y - Y_pred
    r2 = r_value ** 2

    # Pente annualisée en %/an
    prix_debut = Y_pred[0]
    prix_fin = Y_pred[-1]
    nb_annees = len(X) / 252
    
    # Sécurité sur la division par zéro pour la pente annuelle
    if prix_debut > 0 and nb_annees > 0:
        pente_annuelle = ((prix_fin / prix_debut) ** (1 / nb_annees) - 1) * 100
    else:
        pente_annuelle = 0.0

    # Intervalle de confiance 95%
    n = len(X)
    t_crit = stats.t.ppf(0.975, df=n - 2) if n > 2 else 0
    se_line = std_err * np.sqrt(1/n + (X - X.mean())**2 / np.sum((X - X.mean())**2)) if n > 2 else np.zeros(n)
    ic_sup = Y_pred + t_crit * se_line
    ic_inf = Y_pred - t_crit * se_line

    # Projection 12 mois futurs (252 jours de trading)
    X_futur = np.arange(len(X), len(X) + 252)
    Y_futur = intercept + slope * X_futur
    se_futur = std_err * np.sqrt(1/n + (X_futur - X.mean())**2 / np.sum((X - X.mean())**2)) if n > 2 else np.zeros(len(X_futur))
    ic_sup_fut = Y_futur + t_crit * se_futur
    ic_inf_fut = Y_futur - t_crit * se_futur

    # 🎯 SECURITÉ 2 : On emballe TOUT avec le bouclier `safe_round` avant envoi
    return {
        "ticker": ticker,
        "fenetre_annees": fenetre_annees,
        "r2": safe_round(r2, 4),
        "pente_jour": safe_round(slope, 4),
        "pente_annuelle_pct": safe_round(pente_annuelle, 2),
        "p_value": safe_round(p_value, 6),
        "intercept": safe_round(intercept, 4),
        "nb_points": len(X),
        
        "historique": [
            {
                "date": str(dates[i]),
                "prix": safe_round(Y[i], 2),
                "tendance": safe_round(Y_pred[i], 2),
                "ic_sup": safe_round(ic_sup[i], 2),
                "ic_inf": safe_round(ic_inf[i], 2),
                "residu": safe_round(residus[i], 2),
            }
            for i in range(len(X))
        ],
        
        "projection": [
            {
                "date": str(dates[-1] + timedelta(days=i)),
                "tendance": safe_round(Y_futur[i], 2),
                "ic_sup": safe_round(ic_sup_fut[i], 2),
                "ic_inf": safe_round(ic_inf_fut[i], 2),
            }
            for i in range(len(X_futur))
        ]
    }