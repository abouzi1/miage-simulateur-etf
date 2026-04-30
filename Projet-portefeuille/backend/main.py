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
    description="API du projet DATA M2 MIAGE - Modules B et C",
    version="1.0.0",
)

# 2. Configuration CORS pour autoriser le frontend React Vite

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 3. Inclusion des routers
app.include_router(simulation.router)
app.include_router(regression_router)

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