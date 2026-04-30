import { useState, useEffect } from "react";
import DCAForm from "../components/DCAForm";
import DCAResults from "../components/DCAResults";
import DCAChart from "../components/DCAChart";
import { lancerSimulation, getEtfs } from "../services/simulationApi";
import "./SimulateurDCA.css";

export default function SimulateurDCA() {
  const [etfs, setEtfs] = useState([]);
  const [resultats, setResultats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    getEtfs()
      .then(setEtfs)
      .catch(() => {
        // Fallback si l'endpoint /etf/ n'est pas encore prêt
        setEtfs([
          { ticker: "CW8.PA", nom: "Amundi MSCI World", ter: 0.0038 },
          { ticker: "500.PA", nom: "Amundi S&P 500", ter: 0.0015 },
          { ticker: "ESE.PA", nom: "iShares MSCI Europe", ter: 0.0012 },
          { ticker: "OBLI.PA", nom: "Lyxor Obligations Euro", ter: 0.0017 },
        ]);
      });
  }, []);

  const handleSubmit = async (parametres) => {
    setLoading(true);
    setErreur(null);
    setResultats(null);
    try {
      const data = await lancerSimulation(parametres);
      setResultats(data);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dca-page">
      <header className="dca-header">
        <h1>Simulateur DCA</h1>
        <p className="dca-subtitle">
          Simulez votre stratégie d'investissement passif sur des données historiques réelles
        </p>
      </header>

      <div className="dca-container">
        <aside className="dca-sidebar">
          <DCAForm etfs={etfs} onSubmit={handleSubmit} loading={loading} />
        </aside>

        <main className="dca-main">
          {erreur && (
            <div className="dca-erreur">
              ⚠ {erreur}
            </div>
          )}

          {loading && (
            <div className="dca-loading">
              <div className="spinner"></div>
              <p>Calcul de la simulation en cours...</p>
            </div>
          )}

          {!loading && !resultats && !erreur && (
            <div className="dca-placeholder">
              <h2>👈 Configurez votre stratégie</h2>
              <p>
                Sélectionnez un ETF, définissez votre capital de départ et votre versement mensuel,
                puis lancez la simulation pour voir comment votre portefeuille aurait évolué.
              </p>
            </div>
          )}

          {resultats && !loading && (
            <>
              <DCAResults metriques={resultats.metriques} parametres={resultats.parametres} />
              <DCAChart resultats={resultats.resultats_mensuels} valeurLivretA={resultats.metriques.valeur_livret_a} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
