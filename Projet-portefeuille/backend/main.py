"""
Point d'entrée principal de l'API FastAPI - Projet DATA M2 MIAGE
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import simulation
from routers import router_regression # P3 - Module C
from routers import explorateur_etf

# 1. Création de l'instance FastAPI
app = FastAPI(
    title="Simulateur de Portefeuille Passif",
    description="API du projet DATA M2 MIAGE - Modules B et C",
    version="1.0.0",
)

# 2. Configuration CORS pour autoriser le frontend React Vite (Vercel inclus)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://miage-simulateur-etf.vercel.app"], # Mets l'URL exacte de ton site Vercel
    allow_credentials=True, # À True pour éviter les conflits
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Inclusion des routers
app.include_router(simulation.router)
app.include_router(router_regression.router)  # P3 - Module C
app.include_router(explorateur_etf.router)  # Module A - Explorateur ETF

# 4. Route de santé
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "message": "API Simulateur de Portefeuille - Projet DATA M2 MIAGE",
        "docs": "/docs",
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}