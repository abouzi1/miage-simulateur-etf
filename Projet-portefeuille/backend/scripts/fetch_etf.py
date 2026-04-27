import os
import yfinance as yf
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# --- CONNEXION À LA BASE DE DONNÉES ---
# On charge le mot de passe caché dans ton fichier .env
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
# SQLAlchemy crée le "moteur" pour parler à PostgreSQL
engine = create_engine(DATABASE_URL)

def run_etl():
    print("Démarrage de l'ETL pour le CW8...")

    # --- 1. EXTRACT (Extraction) ---
    print("Étape 1 : Téléchargement des données depuis Yahoo Finance...")
    # On aspire l'historique du CW8 depuis le 1er janvier 2015
    data = yf.download('CW8.PA', start="2015-01-01")

    # --- 2. TRANSFORM (Transformation) ---
    print("Étape 2 : Nettoyage avec Pandas...")
    # Yahoo Finance change parfois ses noms de colonnes. On s'adapte :
    if 'Adj Close' in data.columns:
        df = data[['Adj Close']].copy()
    elif 'Close' in data.columns:
        df = data[['Close']].copy()
    else:
        # Pour les toutes dernières versions de yfinance (format MultiIndex)
        df = data.iloc[:, [0]].copy()
    
    # On renomme la colonne pour correspondre exactement à notre table PostgreSQL
    df.columns = ['prix_cloture_ajuste']
    
    # Dans Yahoo, la date est cachée dans l'index. On la transforme en vraie colonne.
    df.reset_index(inplace=True)
    df.rename(columns={'Date': 'date'}, inplace=True)

    # --- 3. LOAD (Chargement) ---
    print("Étape 3 : Envoi dans PostgreSQL...")
    with engine.connect() as conn:
        # A. On enregistre la "carte d'identité" de l'ETF dans la table 'etf'
        # Le "ON CONFLICT" empêche de recréer le CW8 si tu lances le script deux fois
        conn.execute(text("""
            INSERT INTO etf (ticker, nom, gestionnaire, ter, eligible_pea) 
            VALUES ('CW8', 'Amundi MSCI World', 'Amundi', 0.38, TRUE) 
            ON CONFLICT (ticker) DO NOTHING;
        """))
        conn.commit()
        
        # On demande à PostgreSQL de nous donner l'ID (le numéro) du CW8 qu'on vient de créer
        result = conn.execute(text("SELECT id FROM etf WHERE ticker = 'CW8';"))
        etf_id = result.fetchone()[0]

    # B. On ajoute ce numéro d'ID à toutes les lignes de prix de notre tableau Pandas
    df['etf_id'] = etf_id

    # C. On insère les milliers de lignes de prix dans la table 'cours_historique' d'un seul coup !
    # 'append' signifie qu'on ajoute les données sans écraser ce qui existe déjà
    try:
        df.to_sql('cours_historique', engine, if_exists='append', index=False)
        print("Succès : Les données historiques ont été insérées !")
    except Exception as e:
        print("Note : Certaines données existent déjà ou une erreur est survenue :", e)

if __name__ == "__main__":
    run_etl()