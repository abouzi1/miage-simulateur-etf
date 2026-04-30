# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from regression import calculer_regression
import psycopg2

router = APIRouter(prefix="/regression", tags=["Regression"])

class RegressionRequest(BaseModel):
    ticker: str
    fenetre_annees: int = 10

def get_connexion():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="portefeuille",
        user="postgres",
        password="Olympia1912!"
    )

@router.post("/")
def lancer_regression(req: RegressionRequest):
    """
    Lance une regression lineaire OLS sur un ETF.
    Retourne R2, pente, p-value, residus et intervalle de confiance 95%.
    """
    resultat = calculer_regression(req.ticker, req.fenetre_annees)

    if resultat is None:
        raise HTTPException(status_code=404, detail=f"Aucune donnee trouvee pour {req.ticker}")

    # Sauvegarder en BDD
    conn = get_connexion()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO resultat_regression (etf_id, fenetre_annees, r2, pente_jour, p_value)
        SELECT e.id, %s, %s, %s, %s
        FROM etf e WHERE e.ticker = %s
    """, (
        int(req.fenetre_annees),
        float(resultat["r2"]),
        float(resultat["pente_jour"]),
        float(resultat["p_value"]),
        req.ticker
    ))
    conn.commit()
    cur.close()
    conn.close()

    return resultat

@router.get("/{ticker}")
def get_regression(ticker: str, fenetre_annees: int = 10):
    """
    Retourne les resultats de regression pour un ETF donne.
    """
    resultat = calculer_regression(ticker, fenetre_annees)

    if resultat is None:
        raise HTTPException(status_code=404, detail=f"Aucune donnee trouvee pour {ticker}")

    return resultat