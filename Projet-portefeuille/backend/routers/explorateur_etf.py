# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from pathlib import Path
from dotenv import load_dotenv

# Charge le .env situé dans le dossier backend/
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env", encoding="utf-8")

# Configuration encodage PostgreSQL
os.environ["LC_MESSAGES"] = "C"
os.environ["LANG"] = "C"
os.environ["PGCLIENTENCODING"] = "UTF8"

router = APIRouter(
    prefix="/etfs",
    tags=["Explorateur ETF"]
)


def get_db_connection():
    """
    Connexion PostgreSQL.
    Utilise DATABASE_URL si disponible (Railway), sinon la configuration locale.
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


# 🎯 Étape 1 : Récupérer la liste complète des ETF (pour alimenter le select)
@router.get("/")
def get_all_etfs():
    try:
        conn = get_db_connection()
        # RealDictCursor permet de retourner directement des dictionnaires configurés JSON
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id, ticker, nom, ter, eligible_pea, indice_replique 
                FROM etf 
                ORDER BY nom ASC
            """)
            etfs = cur.fetchall()
        
        conn.close()
        return etfs
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erreur lors de la récupération des ETF : {str(e)}"
        )


# 🎯 Étape 2 : Récupérer l'historique des prix sécurisé (pour alimenter le graphique)
@router.get("/{etf_id}/historique")
def get_etf_historique(etf_id: int):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT date, prix_cloture_ajuste 
            FROM cours_historique 
            WHERE etf_id = %s 
            ORDER BY date ASC
        """, (etf_id,))
        
        rows = cur.fetchall()
        
        historique = []
        for row in rows:
            # 🎯 SÉCURISATION 1 : Traitement de la date
            date_brute = row[0]
            # Si c'est déjà une chaîne de caractères, on la garde, sinon on applique le formatage ISO
            date_propre = date_brute if isinstance(date_brute, str) else date_brute.strftime("%Y-%m-%d")
            
            # 🎯 SÉCURISATION 2 : Conversion explicite en float (neutralise les crashs de sérialisation des types Decimal)
            prix_propre = float(row[1]) if row[1] is not None else 0.0
            
            historique.append({
                "date": date_propre,
                "prix": prix_propre
            })
            
        cur.close()
        conn.close()
        
        return historique
        
    except Exception as e:
        # Affiche le détail du crash dans l'onglet "Logs" de Railway pour faciliter le suivi
        print(f"Erreur sur l'historique de l'ETF {etf_id} : {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))