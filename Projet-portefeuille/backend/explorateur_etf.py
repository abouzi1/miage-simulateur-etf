
import numpy as np
from scipy import stats
import psycopg2
import os
from pathlib import Path
from dotenv import load_dotenv

# Fonction outil : Ouvre la porte de la base de données
def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

# Route de test (la racine)
@app.get("/")
def read_root():
    return {"message": "Le serveur Backend est en ligne et prêt !"}

# --- MODULE A : ROUTES API ---

# Étape 2 : La route "Catalogue" pour récupérer la liste des ETF
@app.get("/api/etfs")
def get_etfs():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # On demande toutes les infos de la table etf
        cur.execute("SELECT id, ticker, nom, indice_replique, gestionnaire, ter, eligible_pea FROM etf ORDER BY id ASC")
        rows = cur.fetchall()
        
        # On transforme les données brutes SQL en une belle liste de dictionnaires (JSON)
        etfs = []
        for row in rows:
            etfs.append({
                "id": row[0],
                "ticker": row[1],
                "nom": row[2],
                "indice_replique": row[3],
                "gestionnaire": row[4],
                "ter": row[5],
                "eligible_pea": row[6]
            })
            
        cur.close()
        conn.close()
        
        return etfs # FastAPI transforme automatiquement ça en JSON pour le site web
        
    except Exception as e:
        # S'il y a un problème (ex: Railway injoignable), on renvoie une erreur propre
        raise HTTPException(status_code=500, detail=str(e))

from datetime import date # Ajoute cette ligne tout en haut du fichier avec les autres "import" si elle n'y est pas

# ... (ton code précédent) ...

# Étape 3 : La route "Historique" pour récupérer les prix d'un ETF précis
@app.get("/api/etfs/{etf_id}/historique")
def get_etf_historique(etf_id: int):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # On va chercher uniquement les dates et les prix pour l'ETF demandé
        # On les trie chronologiquement (ORDER BY date ASC) pour le futur graphique
        cur.execute("""
            SELECT date, prix_cloture_ajuste 
            FROM cours_historique 
            WHERE etf_id = %s 
            ORDER BY date ASC
        """, (etf_id,))
        
        rows = cur.fetchall()
        
        # On prépare les données pour le graphique React (axe X = date, axe Y = prix)
        historique = []
        for row in rows:
            historique.append({
                "date": row[0].strftime("%Y-%m-%d"), # Transforme la date SQL en texte propre
                "prix": row[1]
            })
            
        cur.close()
        conn.close()
        
        return historique
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))