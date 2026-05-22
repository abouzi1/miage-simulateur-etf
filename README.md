# Simulateur de portefeuille passif ETF

Projet  DATA - M2 MIAGE Apprentissage

Application web pédagogique permettant d’explorer des ETF, de simuler une stratégie d’investissement programmé DCA et d’analyser une tendance historique à l’aide d’une régression linéaire.

> Ce projet ne constitue pas un conseil financier. Il s’agit d’un outil pédagogique de backtesting basé sur des données historiques. Les performances passées ne garantissent pas les performances futures.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Architecture du projet](#architecture-du-projet)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Configuration de la base de données](#configuration-de-la-base-de-données)
- [Installation et lancement en local](#installation-et-lancement-en-local)
- [Documentation API](#documentation-api)
- [Application déployée](#application-déployée)
- [Structure du projet](#structure-du-projet)
- [Principales routes API](#principales-routes-api)

---

## Fonctionnalités

L’application est organisée autour de trois modules principaux :

### Module A - Explorateur ETF

- Affichage du catalogue des ETF disponibles.
- Consultation des informations principales : ticker, nom, indice répliqué, gestionnaire, TER et éligibilité PEA.
- Visualisation de l’historique des cours.
- Comparaison graphique entre deux ETF.

### Module B - Simulateur DCA

- Simulation d’une stratégie d’investissement mensuel sur un ETF.
- Paramètres configurables : capital initial, versement mensuel, date de début, date de fin et TER.
- Calcul de la valeur du portefeuille mois par mois.
- Prise en compte de l’impact des frais de gestion.
- Comparaison pédagogique avec un Livret A modélisé à 3 % par an.

### Module C - Régression linéaire

- Analyse de la tendance historique d’un ETF sur une fenêtre de 3, 5, 10 ou 15 ans.
- Calcul du R², de la pente journalière, de la pente annualisée, de la p-value et des résidus.
- Affichage d’une droite de tendance et d’une projection illustrative.
- Interprétation critique : un R² élevé décrit une tendance passée, mais ne permet pas de prédire les cours futurs avec certitude.

---

## Architecture du projet

L’application suit une architecture web en trois couches :

1. **Frontend React** : interface utilisateur, saisie des paramètres et affichage des résultats.
2. **Backend FastAPI** : routes REST, calculs financiers, régression linéaire et communication avec la base.
3. **Base de données PostgreSQL** : stockage des ETF, cours historiques, simulations et résultats de régression.

Le frontend communique avec le backend via des requêtes HTTP au format JSON. Le backend interroge PostgreSQL pour lire ou enregistrer les données.

---

## Technologies utilisées

### Frontend

- React
- Vite
- React Router DOM
- Recharts
- Axios / Fetch API
- CSS

### Backend

- Python
- FastAPI
- Uvicorn
- Psycopg2
- Python-dotenv
- Yfinance
- NumPy
- SciPy

### Base de données

- PostgreSQL

---

## Prérequis

Avant de lancer le projet, il faut installer :

- Python 3.10 ou version supérieure
- Node.js et npm
- PostgreSQL
- Git

---

## Configuration de la base de données

### 1. Créer une base PostgreSQL

Dans PostgreSQL, créer une base de données nommée par exemple :

```sql
CREATE DATABASE portefeuille;
```

### 2. Créer les tables

Exécuter le script SQL suivant dans la base `portefeuille` :

```sql
CREATE TABLE etf (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100),
    indice_replique VARCHAR(100),
    gestionnaire VARCHAR(100),
    ter DOUBLE PRECISION,
    eligible_pea BOOLEAN
);

CREATE TABLE cours_historique (
    id SERIAL PRIMARY KEY,
    etf_id INTEGER NOT NULL REFERENCES etf(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    prix_cloture_ajuste DOUBLE PRECISION,
    volume BIGINT,
    UNIQUE (etf_id, date)
);

CREATE TABLE simulation (
    id SERIAL PRIMARY KEY,
    etf_id INTEGER NOT NULL REFERENCES etf(id) ON DELETE CASCADE,
    capital_initial DOUBLE PRECISION NOT NULL,
    versement_mensuel DOUBLE PRECISION NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resultat_simulation (
    id SERIAL PRIMARY KEY,
    simulation_id INTEGER NOT NULL REFERENCES simulation(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    valeur_portefeuille DOUBLE PRECISION,
    parts_cumulees DOUBLE PRECISION,
    frais_cumules DOUBLE PRECISION
);

CREATE TABLE resultat_regression (
    id SERIAL PRIMARY KEY,
    etf_id INTEGER NOT NULL REFERENCES etf(id) ON DELETE CASCADE,
    fenetre_annees INTEGER NOT NULL,
    r2 DOUBLE PRECISION,
    pente_jour DOUBLE PRECISION,
    p_value DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Créer le fichier d’environnement backend

Dans le dossier `Projet-portefeuille/backend`, créer un fichier `.env` :

```env
DATABASE_URL=postgresql://postgres:motdepasse@localhost:5432/portefeuille

DB_HOST=localhost
DB_PORT=5432
DB_NAME=portefeuille
DB_USER=postgres
DB_PASSWORD=motdepasse
```

Remplacer `motdepasse` par le mot de passe PostgreSQL local.

> Le projet utilise principalement `DATABASE_URL`. Les variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` et `DB_PASSWORD` permettent aussi de tester la connexion avec `test_db.py`.

### 4. Alimenter la base avec les données ETF

Depuis le dossier backend :

```bash
python scripts/fetch_etf.py
```

Ce script récupère les cours historiques via `yfinance` à partir du 1er janvier 2015, puis insère les données dans PostgreSQL.

ETF importés :

| Ticker | Nom | Indice répliqué | Gestionnaire | TER | PEA |
|---|---|---|---|---:|---|
| CW8.PA | Amundi MSCI World | MSCI World | Amundi | 0,38 % | Oui |
| 500.PA | Amundi S&P 500 | S&P 500 | Amundi | 0,15 % | Oui |
| ESE.PA | iShares MSCI Europe | MSCI Europe | iShares | 0,12 % | Non |
| OBLI.PA | Lyxor Obligations État Euro | MTS Italy | Lyxor | 0,17 % | Non |

---

## Installation et lancement en local

### 1. Cloner le projet

```bash
git clone https://github.com/abouzi1/miage-simulateur-etf.git
cd miage-simulateur-etf/Projet-portefeuille
```

---

### 2. Lancer le backend FastAPI

Se placer dans le dossier backend :

```bash
cd backend
```

Créer un environnement virtuel :

```bash
python -m venv venv
```

Activer l’environnement virtuel.

Sous Windows PowerShell :

```powershell
.\venv\Scripts\activate
```

Sous macOS / Linux :

```bash
source venv/bin/activate
```

Installer les dépendances backend :

```bash
python -m pip install fastapi "uvicorn[standard]" psycopg2-binary python-dotenv yfinance pandas numpy scipy pydantic
```

Tester la connexion à la base :

```bash
python test_db.py
```

Importer les données ETF si ce n’est pas déjà fait :

```bash
python scripts/fetch_etf.py
```

Lancer l’API :

```bash
python -m uvicorn main:app --reload
```

L’API est alors disponible à l’adresse :

```text
http://127.0.0.1:8000
```

La documentation Swagger est disponible ici :

```text
http://127.0.0.1:8000/docs
```

---

### 3. Lancer le frontend React

Dans un second terminal, se placer dans le dossier frontend :

```bash
cd Projet-portefeuille/frontend
```

Si vous êtes déjà dans `Projet-portefeuille/backend`, faire :

```bash
cd ../frontend
```

Installer les dépendances :

```bash
npm install
```

Créer éventuellement un fichier `.env` dans `frontend` pour indiquer l’URL de l’API :

```env
VITE_API_URL=http://127.0.0.1:8000
```

Lancer le serveur de développement :

```bash
npm run dev
```

L’application frontend est disponible à l’adresse indiquée par Vite, généralement :

```text
http://localhost:5173
```

---

## Documentation API

FastAPI génère automatiquement une documentation interactive de l’API.

En local :

```text
http://127.0.0.1:8000/docs
```

Documentation alternative ReDoc :

```text
http://127.0.0.1:8000/redoc
```

---

## Application déployée

Lien vers l’application déployée :

```text
À compléter : https://...
```

Lien vers l’API déployée, si séparée du frontend :

```text
À compléter : https://.../docs
```

---

## Structure du projet

```text
miage-simulateur-etf/
└── Projet-portefeuille/
    ├── backend/
    │   ├── main.py
    │   ├── regression.py
    │   ├── test_db.py
    │   ├── models/
    │   │   └── dca_models.py
    │   ├── routers/
    │   │   ├── explorateur_etf.py
    │   │   ├── router_regression.py
    │   │   └── simulation.py
    │   ├── scripts/
    │   │   └── fetch_etf.py
    │   └── services/
    │       └── dca_service.py
    │
    └── frontend/
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── App.jsx
            ├── components/
            ├── pages/
            └── services/
```

---

## Principales routes API

### Health

| Méthode | Route | Description |
|---|---|---|
| GET | `/` | Vérifie que l’API fonctionne |
| GET | `/health` | Route de santé de l’API |

### Explorateur ETF

| Méthode | Route | Description |
|---|---|---|
| GET | `/etfs/` | Récupère la liste des ETF |
| GET | `/etfs/{etf_id}/historique` | Récupère les cours historiques d’un ETF |

### Simulation DCA

| Méthode | Route | Description |
|---|---|---|
| POST | `/simulation/` | Lance une simulation DCA |
| GET | `/simulation/{simulation_id}` | Récupère une simulation sauvegardée |

### Régression linéaire

| Méthode | Route | Description |
|---|---|---|
| POST | `/regression/` | Lance une régression linéaire sur un ETF |
| GET | `/regression/{ticker}` | Récupère une analyse de régression pour un ETF |

---

## Remarques importantes

- Le backend doit être lancé avant le frontend, sinon les appels API échoueront.
- La base PostgreSQL doit être créée et alimentée avant de lancer les simulations.
- La route Swagger FastAPI est `/docs`, et non `/swagger/index.html`.
- Le fichier `requirements.txt` n’est pas présent dans le projet initial : les dépendances backend sont donc installées manuellement dans ce README.
- Si le projet est lancé sous Linux, vérifier la casse des imports de fichiers JavaScript, car Linux est sensible aux majuscules/minuscules.
