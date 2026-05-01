# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from regression import calculer_regression
import psycopg2
from pathlib import Path
from dotenv import load_dotenv
import os

router = APIRouter(prefix="/regression", tags=["Regression"])

# Charge le .env situé dans le dossier backend/
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env", encoding="utf-8")

# Configuration encodage PostgreSQL
os.environ["LC_MESSAGES"] = "C"
os.environ["LANG"] = "C"
os.environ["PGCLIENTENCODING"] = "UTF8"

class RegressionRequest(BaseModel):
    ticker: str
    fenetre_annees: int = 10

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
    conn = get_db_connection()
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