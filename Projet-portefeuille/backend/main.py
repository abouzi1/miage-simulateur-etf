"""
Point d'entrée principal de l'API FastAPI - Projet DATA M2 MIAGE
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import simulation
from router_regression import router as regression_router  # P3 - Module C

# 1. Création de l'instance FastAPI
app = FastAPI(
    title="Simulateur de Portefeuille Passif",
    description="API du projet DATA M2 MIAGE - Module B : Simulateur DCA",
    version="1.0.0",
)

# 2. Configuration CORS pour autoriser le frontend React (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev
        "http://localhost:3000",   # alternative
        # Ajoute ici l'URL Vercel quand tu déploieras :
        # "https://ton-app.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Inclusion des routers (modules)
app.include_router(simulation.router)
# Quand tes coéquipiers auront leurs modules :
# app.include_router(etf.router)
app.include_router(regression_router)  # P3 - Module C


# 4. Route de santé (utile pour vérifier que l'API tourne)
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
