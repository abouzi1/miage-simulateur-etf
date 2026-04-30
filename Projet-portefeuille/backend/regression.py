# -*- coding: utf-8 -*-
import numpy as np
from scipy import stats
import psycopg2
import os

def get_connexion():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="portefeuille",
        user="postgres",
        password="Olympia1912!"
    )

def calculer_regression(ticker: str, fenetre_annees: int):
    conn = get_connexion()
    cur = conn.cursor()

    cur.execute("""
        SELECT ch.date, ch.prix_cloture_ajuste
        FROM cours_historique ch
        JOIN etf e ON e.id = ch.etf_id
        WHERE e.ticker = %s
        AND ch.date >= NOW() - INTERVAL '%s years'
        ORDER BY ch.date ASC
    """, (ticker, fenetre_annees))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return None

    dates  = [r[0] for r in rows]
    prix   = [r[1] for r in rows]

    X = np.arange(len(prix))
    Y = np.array(prix)

    slope, intercept, r_value, p_value, std_err = stats.linregress(X, Y)

    Y_pred   = intercept + slope * X
    residus  = Y - Y_pred
    r2       = r_value ** 2

    # Pente annualisee en %/an
    prix_debut = Y_pred[0]
    prix_fin   = Y_pred[-1]
    nb_annees  = len(X) / 252
    pente_annuelle = ((prix_fin / prix_debut) ** (1 / nb_annees) - 1) * 100

    # Intervalle de confiance 95%
    n       = len(X)
    t_crit  = stats.t.ppf(0.975, df=n - 2)
    se_line = std_err * np.sqrt(1/n + (X - X.mean())**2 / np.sum((X - X.mean())**2))
    ic_sup  = Y_pred + t_crit * se_line
    ic_inf  = Y_pred - t_crit * se_line

    # Projection 12 mois futurs
    X_futur    = np.arange(len(X), len(X) + 252)
    Y_futur    = intercept + slope * X_futur
    se_futur   = std_err * np.sqrt(1/n + (X_futur - X.mean())**2 / np.sum((X - X.mean())**2))
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
        "historique": [
    {
        "date": str(dates[i]),
        "prix": round(float(Y[i]), 2),
        "tendance": round(float(Y_pred[i]), 2),
        "ic_sup": round(float(ic_sup[i]), 2),
        "ic_inf": round(float(ic_inf[i]), 2),
        "residu": round(float(residus[i]), 2),
    }
    for i in range(0, len(X), 5)  # 1 point sur 5
    ],
        "projection": [
            {
                "date": str(dates[-1]),
                "tendance": round(float(Y_futur[i]), 2),
                "ic_sup": round(float(ic_sup_fut[i]), 2),
                "ic_inf": round(float(ic_inf_fut[i]), 2),
            }
            for i in range(len(X_futur))
        ]
    }