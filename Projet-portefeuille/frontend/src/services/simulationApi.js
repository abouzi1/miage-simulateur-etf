/**
 * Client API pour le Module B - Simulateur DCA
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://miage-simulateur-etf-production.up.railway.app";

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
  return [
    { ticker: "CW8.PA", nom: "Amundi MSCI World", ter: 0.0038 },
    { ticker: "500.PA", nom: "Amundi S&P 500", ter: 0.0015 },
    { ticker: "ESE.PA", nom: "iShares MSCI Europe", ter: 0.0012 },
    { ticker: "OBLI.PA", nom: "Lyxor Obligations Euro", ter: 0.0017 },
  ];
}