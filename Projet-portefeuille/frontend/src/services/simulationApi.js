/**
 * Client API pour le Module B - Simulateur DCA
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function lancerSimulation(parametres) {
  const response = await fetch(`${API_BASE_URL}/simulation/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parametres),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erreur inconnue" }));
    throw new Error(error.detail || "Erreur lors de la simulation");
  }

  return response.json();
}

export async function getSimulation(id) {
  const response = await fetch(`${API_BASE_URL}/simulation/${id}`);
  if (!response.ok) throw new Error("Simulation introuvable");
  return response.json();
}

export async function getEtfs() {
  const response = await fetch(`${API_BASE_URL}/etf/`);
  if (!response.ok) throw new Error("Erreur récupération ETF");
  return response.json();
}