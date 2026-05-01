"""
Script de diagnostic pour tester la connexion à PostgreSQL.
Lance-le avec : python test_db.py
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("🔍 DIAGNOSTIC CONNEXION POSTGRESQL")
print("=" * 60)

# Affiche les paramètres (sans le mot de passe)
print(f"DB_HOST      = {os.getenv('DB_HOST', 'localhost')}")
print(f"DB_PORT      = {os.getenv('DB_PORT', '5432')}")
print(f"DB_NAME      = {os.getenv('DB_NAME', 'NOT SET')}")
print(f"DB_USER      = {os.getenv('DB_USER', 'NOT SET')}")
print(f"DB_PASSWORD  = {'*' * len(os.getenv('DB_PASSWORD', '')) if os.getenv('DB_PASSWORD') else 'NOT SET'}")
print("-" * 60)

try:
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "portfolio_simulator"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        client_encoding="UTF8",
    )
    print("✅ Connexion réussie !")

    # Test : compte les ETF
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM etf")
        nb_etf = cur.fetchone()[0]
        print(f"📊 Nombre d'ETF en base : {nb_etf}")

        if nb_etf > 0:
            cur.execute("SELECT ticker, nom, ter FROM etf LIMIT 5")
            print("\nETF disponibles :")
            for row in cur.fetchall():
                print(f"  - {row[0]} | {row[1]} | TER={row[2]}")

        cur.execute("SELECT COUNT(*) FROM cours_historique")
        nb_cours = cur.fetchone()[0]
        print(f"\n📈 Nombre de cours historiques : {nb_cours}")

    conn.close()
    print("\n✅ Tout est OK, tu peux lancer le simulateur !")

except UnicodeDecodeError as e:
    print(f"❌ ERREUR D'ENCODAGE : {e}")
    print("\n💡 Solutions :")
    print("  1. Ton mot de passe contient un caractère accentué (é, è, à...)")
    print("     → change-le pour un mot de passe sans accents")
    print("  2. Le fichier .env n'est pas en UTF-8")
    print("     → dans VS Code, en bas à droite, clique sur 'UTF-8' et 'Save with Encoding'")

except psycopg2.OperationalError as e:
    print(f"❌ ERREUR DE CONNEXION : {e}")
    print("\n💡 Vérifie :")
    print("  - PostgreSQL est démarré (services Windows)")
    print("  - Le nom de la base existe")
    print("  - Le mot de passe est correct")

except Exception as e:
    print(f"❌ ERREUR : {type(e).__name__}: {e}")