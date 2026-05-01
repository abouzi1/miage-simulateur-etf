from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend import explorateur_etf

# Charge les variables du fichier .env (notamment DATABASE_URL)
load_dotenv()

app = FastAPI(title="API Simulateur ETF")

# Configuration du CORS (autorise le Frontend React à discuter avec ce Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include(explorateur_etf) 
