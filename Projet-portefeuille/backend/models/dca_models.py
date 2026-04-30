"""
Schémas Pydantic pour le Module B - Simulateur DCA
"""
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List, Optional


class SimulationRequest(BaseModel):
    """Paramètres d'entrée pour lancer une simulation DCA"""
    etf_ticker: str = Field(..., description="Ticker de l'ETF (ex: CW8.PA)")
    capital_initial: float = Field(..., ge=0, description="Capital de départ en €")
    versement_mensuel: float = Field(..., ge=0, description="Versement mensuel DCA en €")
    date_debut: date = Field(..., description="Date de début de simulation")
    date_fin: date = Field(..., description="Date de fin de simulation")
    ter: Optional[float] = Field(None, ge=0, le=0.05, description="TER (sinon celui de l'ETF)")

    class Config:
        json_schema_extra = {
            "example": {
                "etf_ticker": "CW8.PA",
                "capital_initial": 1000,
                "versement_mensuel": 200,
                "date_debut": "2015-01-01",
                "date_fin": "2024-12-31",
                "ter": 0.0038
            }
        }


class ResultatMensuel(BaseModel):
    """Résultat d'un mois de simulation"""
    date: date
    prix: float
    parts_achetees: float
    parts_cumulees: float
    valeur_portefeuille: float
    valeur_sans_frais: float
    frais_cumules: float
    capital_verse: float


class MetriquesSimulation(BaseModel):
    """Métriques globales de la simulation"""
    capital_total_verse: float
    valeur_finale: float
    valeur_finale_sans_frais: float
    gain_net: float
    impact_frais_total: float
    cagr: float
    nombre_mois: int
    valeur_livret_a: float


class SimulationResponse(BaseModel):
    """Réponse complète d'une simulation"""
    simulation_id: int
    etf_ticker: str
    etf_nom: Optional[str]
    parametres: SimulationRequest
    metriques: MetriquesSimulation
    resultats_mensuels: List[ResultatMensuel]
    created_at: datetime