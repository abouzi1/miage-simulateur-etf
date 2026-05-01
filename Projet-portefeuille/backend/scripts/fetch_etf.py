import yfinance as yf
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

ETF_LIST = [
    {"ticker": "CW8.PA", "nom": "Amundi MSCI World", "indice": "MSCI World", "gestionnaire": "Amundi", "ter": 0.0038, "pea": True},
    {"ticker": "500.PA", "nom": "Amundi S&P 500", "indice": "S&P 500", "gestionnaire": "Amundi", "ter": 0.0015, "pea": True},
    {"ticker": "ESE.PA", "nom": "iShares MSCI Europe", "indice": "MSCI Europe", "gestionnaire": "iShares", "ter": 0.0012, "pea": False},
    {"ticker": "OBLI.PA", "nom": "Lyxor Obligations État Euro", "indice": "MTS Italy", "gestionnaire": "Lyxor", "ter": 0.0017, "pea": False},
]

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

for etf in ETF_LIST:
    # 1. Insertion de l'ETF
    cur.execute("""
        INSERT INTO etf (ticker, nom, indice_replique, gestionnaire, ter, eligible_pea)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (ticker) DO NOTHING
        RETURNING id
    """, (etf["ticker"], etf["nom"], etf["indice"], etf["gestionnaire"], etf["ter"], etf["pea"]))
    
    row = cur.fetchone()
    if row is None:
        cur.execute("SELECT id FROM etf WHERE ticker = %s", (etf["ticker"],))
        row = cur.fetchone()
    etf_id = row[0]

    # 🎯 CORRECTION 1 : On sauvegarde l'ETF tout de suite pour "rassurer" Railway
    conn.commit()

    print(f"Téléchargement de {etf['ticker']} depuis Yahoo Finance...")
    data = yf.download(etf["ticker"], start="2015-01-01", auto_adjust=True, progress=False)
    
    # 🎯 CORRECTION 2 : On prépare un "colis" (liste) au lieu d'envoyer ligne par ligne
    records = []
    for date, row_data in data.iterrows():
        records.append((etf_id, date.date(), float(row_data["Close"].iloc[0]), int(row_data["Volume"].iloc[0])))

    print(f"Envoi de {len(records)} jours de cotation vers Railway...")
    
    # 🎯 CORRECTION 3 : Envoi en rafale (executemany) - beaucoup plus rapide !
    cur.executemany("""
        INSERT INTO cours_historique (etf_id, date, prix_cloture_ajuste, volume)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT DO NOTHING
    """, records)

    # 🎯 CORRECTION 4 : On sauvegarde les prix de cet ETF avant de passer au suivant
    conn.commit()
    print(f"✅ {etf['ticker']} terminé !\n")

cur.close()
conn.close()
print("🎉 Import total terminé avec succès !")