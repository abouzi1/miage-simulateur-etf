# -*- coding: utf-8 -*-
import numpy as np
from scipy import stats
import psycopg2
import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta  # Ajout de l'import pour les dates de projection

# Charge le .env situé dans le dossier backend/
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env", encoding="utf-8")


# Configuration encodage PostgreSQL
os.environ["LC_MESSAGES"] = "C"
os.environ["LANG"] = "C"
os.environ["PGCLIENTENCODING"] = "UTF8"


def get_db_connection():
    """
    Connexion PostgreSQL.
    Utilise DATABASE_URL si disponible, sinon les variables DB_HOST, DB_PORT, etc.
    """
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        return psycopg2.connect(
            database_url,
            client_encoding="UTF8",
        )

    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME", "portefeuille"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD"),
        client_encoding="UTF8",
    )


def calculer_regression(ticker: str, fenetre_annees: int):
    """
    Calcule la régression linéaire pour un ETF.
    
    Args:
        ticker: Code de l'ETF (ex: "CW8.PA")
        fenetre_annees: Nombre d'années d'historique à analyser
        
    Returns:
        Dict avec tous les résultats de régression
    """
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

    # 🎯 CORRECTION DÉFINITIVE : On filtre les jours sans prix (None)
    lignes_valides = [r for r in rows if r[1] is not None]

    # 🎯 SECURITÉ : Il faut au moins 2 points pour tracer une droite
    if not lignes_valides or len(lignes_valides) < 2:
        return None

    dates = [r[0] for r in lignes_valides]
    prix = [r[1] for r in lignes_valides]

    # Variables de régression
    X = np.arange(len(prix))  # Jour de trading (0, 1, 2, ...)
    
    # 🎯 CORRECTION DÉFINITIVE : On force le type 'float' pour éviter le crash de SciPy
    Y = np.array(prix, dtype=float)  

    # Calcul OLS (Ordinary Least Squares)
    slope, intercept, r_value, p_value, std_err = stats.linregress(X, Y)

    # Valeurs prédites par la droite (PARFAITEMENT AFFINE)
    Y_pred = intercept + slope * X
    
    # Résidus
    residus = Y - Y_pred
    
    # R² (coefficient de détermination)
    r2 = r_value ** 2

    # Pente annualisée en %/an
    prix_debut = Y_pred[0]
    prix_fin = Y_pred[-1]
    nb_annees = len(X) / 252  # 252 = jours de trading par an
    pente_annuelle = ((prix_fin / prix_debut) ** (1 / nb_annees) - 1) * 100

    # Intervalle de confiance 95%
    n = len(X)
    t_crit = stats.t.ppf(0.975, df=n - 2)  # Valeur critique de Student
    se_line = std_err * np.sqrt(1/n + (X - X.mean())**2 / np.sum((X - X.mean())**2))
    ic_sup = Y_pred + t_crit * se_line
    ic_inf = Y_pred - t_crit * se_line

    # Projection 12 mois futurs (252 jours de trading)
    X_futur = np.arange(len(X), len(X) + 252)
    Y_futur = intercept + slope * X_futur
    se_futur = std_err * np.sqrt(1/n + (X_futur - X.mean())**2 / np.sum((X - X.mean())**2))
    ic_sup_fut = Y_futur + t_crit * se_futur
    ic_inf_fut = Y_futur - t_crit * se_futur

    return {
        "ticker": ticker,
        "fenetre_annees": fenetre_annees,
        "r2": round(r2, 4),
        "pente_jour": round(float(slope), 4),
        "pente_annuelle_pct": round(pente_annuelle, 2),
        "p_value": round(float(p_value), 6),
        "intercept": round(float(intercept), 4),
        "nb_points": len(X),
        
        # ⭐ HISTORIQUE : TOUS LES POINTS
        "historique": [
            {
                "date": str(dates[i]),
                "prix": round(float(Y[i]), 2),
                "tendance": round(float(Y_pred[i]), 2),
                "ic_sup": round(float(ic_sup[i]), 2),
                "ic_inf": round(float(ic_inf[i]), 2),
                "residu": round(float(residus[i]), 2),
            }
            for i in range(len(X))
        ],
        
        # Projection future : ~252 points pour 12 mois
        "projection": [
            {
                # 🎯 CORRECTION DATES : On ajoute 'i' jours à la dernière date
                "date": str(dates[-1] + timedelta(days=i)),
                "tendance": round(float(Y_futur[i]), 2),
                "ic_sup": round(float(ic_sup_fut[i]), 2),
                "ic_inf": round(float(ic_inf_fut[i]), 2),
            }
            for i in range(len(X_futur))
        ]
    }