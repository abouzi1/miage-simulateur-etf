"""
Endpoints REST pour le Module B - Simulateur DCA
"""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from models.dca_models import SimulationRequest, SimulationResponse
from services import dca_service

router = APIRouter(prefix="/simulation", tags=["Simulation DCA"])


@router.post(
    "/",
    response_model=SimulationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Lancer une simulation DCA",
    description="""
    Lance un backtesting DCA sur un ETF.

    L'algorithme calcule mois par mois :
    - le nombre de parts achetées avec le versement mensuel,
    - la valeur du portefeuille après application du TER,
    - la comparaison avec un Livret A,
    - le rendement annualisé (CAGR).
    """
)
def lancer_simulation(request: SimulationRequest):
    """Endpoint principal pour exécuter et persister une simulation DCA."""
    # 1. Vérifier que l'ETF existe
    etf = dca_service.get_etf_by_ticker(request.etf_ticker)
    if not etf:
        raise HTTPException(
            status_code=404,
            detail=f"ETF '{request.etf_ticker}' introuvable en base de données"
        )

    # 2. Validation dates
    if request.date_debut >= request.date_fin:
        raise HTTPException(
            status_code=400,
            detail="La date de début doit être antérieure à la date de fin"
        )

    # 3. TER : on prend celui fourni, sinon celui de l'ETF
    ter = request.ter if request.ter is not None else (etf.get("ter") or 0.0)

    # 4. Exécution
    try:
        resultats = dca_service.executer_simulation_dca(
            etf_id=etf["id"],
            ter=ter,
            capital_initial=request.capital_initial,
            versement_mensuel=request.versement_mensuel,
            date_debut=request.date_debut,
            date_fin=request.date_fin,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 5. Sauvegarde
    simulation_id = dca_service.sauvegarder_simulation(
        etf_id=etf["id"],
        capital_initial=request.capital_initial,
        versement_mensuel=request.versement_mensuel,
        date_debut=request.date_debut,
        date_fin=request.date_fin,
        resultats_mensuels=resultats["resultats_mensuels"],
    )

    return SimulationResponse(
        simulation_id=simulation_id,
        etf_ticker=etf["ticker"],
        etf_nom=etf.get("nom"),
        parametres=request,
        metriques=resultats["metriques"],
        resultats_mensuels=resultats["resultats_mensuels"],
        created_at=datetime.now(),
    )


@router.get(
    "/{simulation_id}",
    summary="Récupérer une simulation existante",
    description="Retourne les paramètres et résultats d'une simulation déjà calculée."
)
def get_simulation(simulation_id: int):
    """Récupère une simulation persistée."""
    data = dca_service.get_simulation_by_id(simulation_id)
    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"Simulation #{simulation_id} introuvable"
        )
    return data