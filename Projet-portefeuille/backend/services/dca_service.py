"""
Service de calcul du Module B - Simulateur DCA (backtesting)
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import date
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Charge le fichier .env (forcé en UTF-8 pour éviter les soucis Windows)
load_dotenv(encoding="utf-8")

# Force la locale anglaise pour PostgreSQL (évite les messages d'erreur en français
# qui contiennent des accents non-décodables)
os.environ["LC_MESSAGES"] = "C"
os.environ["LANG"] = "C"
os.environ["PGCLIENTENCODING"] = "UTF8"

# Taux Livret A moyen utilisé pour la comparaison
TAUX_LIVRET_A = 0.03


def get_db_connection():
    """
    Connexion PostgreSQL via kwargs (gère les caractères spéciaux dans le password).
    """
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        client_encoding="UTF8",
    )


def get_etf_by_ticker(ticker: str) -> Optional[Dict]:
    """Récupère un ETF par son ticker"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT id, ticker, nom, ter FROM etf WHERE ticker = %s",
                (ticker,)
            )
            return cur.fetchone()
    finally:
        conn.close()


def get_cours_mensuels(etf_id: int, date_debut: date, date_fin: date) -> List[Dict]:
    """Récupère le premier prix de clôture de chaque mois sur la période."""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT DISTINCT ON (DATE_TRUNC('month', date))
                    date,
                    prix_cloture_ajuste
                FROM cours_historique
                WHERE etf_id = %s
                  AND date BETWEEN %s AND %s
                  AND prix_cloture_ajuste IS NOT NULL
                ORDER BY DATE_TRUNC('month', date), date ASC
            """, (etf_id, date_debut, date_fin))
            return cur.fetchall()
    finally:
        conn.close()


def calculer_cagr(valeur_finale: float, capital_verse: float, nombre_mois: int) -> float:
    """CAGR = (Valeur finale / Capital total versé) ^ (1 / nb_annees) - 1"""
    if capital_verse <= 0 or nombre_mois <= 0:
        return 0.0
    nb_annees = nombre_mois / 12
    if nb_annees <= 0:
        return 0.0
    try:
        ratio = valeur_finale / capital_verse
        if ratio <= 0:
            return 0.0
        return (ratio ** (1 / nb_annees)) - 1
    except (ValueError, ZeroDivisionError):
        return 0.0


def executer_simulation_dca(
    etf_id: int,
    ter: float,
    capital_initial: float,
    versement_mensuel: float,
    date_debut: date,
    date_fin: date,
) -> Dict:
    """Exécute l'algorithme DCA mois par mois et retourne les résultats."""
    cours = get_cours_mensuels(etf_id, date_debut, date_fin)

    if not cours:
        raise ValueError("Aucune donnée de cours disponible pour cette période")

    parts_cumulees = 0.0
    parts_cumulees_sans_frais = 0.0
    capital_verse = 0.0
    frais_cumules = 0.0
    ter_mensuel = ter / 12 if ter else 0.0

    resultats_mensuels = []
    valeur_livret = capital_initial
    taux_livret_mensuel = TAUX_LIVRET_A / 12

    for i, ligne in enumerate(cours):
        prix = float(ligne["prix_cloture_ajuste"])
        date_courante = ligne["date"]

        if i == 0:
            montant_invest = capital_initial + versement_mensuel
        else:
            montant_invest = versement_mensuel

        nouvelles_parts = montant_invest / prix
        parts_cumulees += nouvelles_parts
        parts_cumulees_sans_frais += nouvelles_parts
        capital_verse += montant_invest

        valeur_brute = parts_cumulees * prix
        valeur_sans_frais = parts_cumulees_sans_frais * prix

        if ter_mensuel > 0:
            frais_mois = valeur_brute * ter_mensuel
            frais_cumules += frais_mois
            parts_cumulees = parts_cumulees * (1 - ter_mensuel)

        valeur_apres_frais = parts_cumulees * prix

        valeur_livret = valeur_livret * (1 + taux_livret_mensuel) + versement_mensuel

        resultats_mensuels.append({
            "date": date_courante,
            "prix": round(prix, 4),
            "parts_achetees": round(nouvelles_parts, 6),
            "parts_cumulees": round(parts_cumulees, 6),
            "valeur_portefeuille": round(valeur_apres_frais, 2),
            "valeur_sans_frais": round(valeur_sans_frais, 2),
            "frais_cumules": round(frais_cumules, 2),
            "capital_verse": round(capital_verse, 2),
        })

    derniere_ligne = resultats_mensuels[-1]
    valeur_finale = derniere_ligne["valeur_portefeuille"]
    valeur_finale_sans_frais = derniere_ligne["valeur_sans_frais"]
    nombre_mois = len(resultats_mensuels)

    metriques = {
        "capital_total_verse": round(capital_verse, 2),
        "valeur_finale": round(valeur_finale, 2),
        "valeur_finale_sans_frais": round(valeur_finale_sans_frais, 2),
        "gain_net": round(valeur_finale - capital_verse, 2),
        "impact_frais_total": round(valeur_finale_sans_frais - valeur_finale, 2),
        "cagr": round(calculer_cagr(valeur_finale, capital_verse, nombre_mois), 4),
        "nombre_mois": nombre_mois,
        "valeur_livret_a": round(valeur_livret, 2),
    }

    return {
        "metriques": metriques,
        "resultats_mensuels": resultats_mensuels,
    }


def sauvegarder_simulation(
    etf_id: int,
    capital_initial: float,
    versement_mensuel: float,
    date_debut: date,
    date_fin: date,
    resultats_mensuels: List[Dict],
) -> int:
    """Insère la simulation et ses résultats en BDD, retourne l'ID."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO simulation
                    (etf_id, capital_initial, versement_mensuel, date_debut, date_fin)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (etf_id, capital_initial, versement_mensuel, date_debut, date_fin))
            simulation_id = cur.fetchone()[0]

            valeurs = [
                (
                    simulation_id,
                    r["date"],
                    r["valeur_portefeuille"],
                    r["parts_cumulees"],
                    r["frais_cumules"],
                )
                for r in resultats_mensuels
            ]
            cur.executemany("""
                INSERT INTO resultat_simulation
                    (simulation_id, date, valeur_portefeuille, parts_cumulees, frais_cumules)
                VALUES (%s, %s, %s, %s, %s)
            """, valeurs)

            conn.commit()
            return simulation_id
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_simulation_by_id(simulation_id: int) -> Optional[Dict]:
    """Récupère une simulation et ses résultats par ID"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT s.*, e.ticker, e.nom, e.ter
                FROM simulation s
                JOIN etf e ON s.etf_id = e.id
                WHERE s.id = %s
            """, (simulation_id,))
            simulation = cur.fetchone()
            if not simulation:
                return None

            cur.execute("""
                SELECT date, valeur_portefeuille, parts_cumulees, frais_cumules
                FROM resultat_simulation
                WHERE simulation_id = %s
                ORDER BY date ASC
            """, (simulation_id,))
            resultats = cur.fetchall()

            return {
                "simulation": dict(simulation),
                "resultats": [dict(r) for r in resultats],
            }
    finally:
        conn.close()