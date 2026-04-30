const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getEtfs() {
  return [
    { ticker: "CW8.PA", nom: "Amundi MSCI World", ter: 0.0038 },
    { ticker: "500.PA", nom: "Amundi S&P 500", ter: 0.0015 },
    { ticker: "ESE.PA", nom: "iShares MSCI Europe", ter: 0.0012 },
    { ticker: "OBLI.PA", nom: "Lyxor Obligations Euro", ter: 0.0017 },
  ];
}

export async function lancerRegression(parametres) {
  const response = await fetch(`${API_URL}/regression/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ticker: parametres.ticker,
      fenetre_annees: Number(parametres.fenetre_annees),
    }),
  });

  if (!response.ok) {
    let message = "Erreur lors du calcul de la régression.";

    try {
      const erreur = await response.json();
      message = erreur.detail || erreur.message || message;
    } catch {
      message = "Erreur serveur.";
    }

    throw new Error(message);
  }

  return response.json();
}