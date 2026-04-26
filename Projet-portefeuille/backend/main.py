from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialisation de l'application
app = FastAPI(
    title="API Portefeuille ETF",
    description="Serveur Backend pour le projet de simulation d'investissement",
    version="1.0.0"
)

# Configuration CORS (Indispensable pour que React puisse communiquer avec Python)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En phase de développement, on autorise toutes les adresses
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Création d'une route de test basique
@app.get("/")
def read_root():
    return {"message": "Le serveur Backend est en ligne et prêt à envoyer des données !"}