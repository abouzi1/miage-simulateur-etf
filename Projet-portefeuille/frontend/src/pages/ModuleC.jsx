import { useEffect, useState } from "react";
import RegressionForm from "../components/RegressionForm";
import RegressionResults from "../components/RegressionResults";
import RegressionTrendChart from "../components/RegressionTrendChart";
import ResidualsChart from "../components/ResidualsChart";
import RegressionAnalysis from "../components/RegressionAnalysis";
import { getEtfs, lancerRegression } from "../services/regressionAPI";
import "./ModuleC.css";

export default function ModuleC() {
  const [etfs, setEtfs] = useState([]);
  const [resultats, setResultats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    getEtfs()
      .then(setEtfs)
      .catch(() => {
        setEtfs([
          { id: 1, ticker: "CW8.PA", nom: "Amundi MSCI World", ter: 0.0038 },
          { id: 2, ticker: "500.PA", nom: "Amundi S&P 500", ter: 0.0015 },
          { id: 3, ticker: "ESE.PA", nom: "iShares MSCI Europe", ter: 0.0012 },
          { id: 4, ticker: "OBLI.PA", nom: "Lyxor Obligations Euro", ter: 0.0017 },
        ]);
      });
  }, []);

  const normaliserResultats = (data) => {
  const historique = data.historique || [];
  const projection = data.projection || [];

  const courbeHistorique = historique.map((point) => ({
    date: point.date,
    prix_reel: point.prix,
    prix_predit: point.tendance,
    ic_bas: point.ic_inf,
    ic_haut: point.ic_sup,
    ic_95: [point.ic_inf, point.ic_sup],
    type: "historique",
  }));

  const courbeProjection = projection.map((point, index) => ({
    date: `Projection M${index + 1}`,
    prix_reel: null,
    prix_predit: point.tendance,
    ic_bas: point.ic_inf,
    ic_haut: point.ic_sup,
    ic_95: [point.ic_inf, point.ic_sup],
    type: "projection",
  }));

  const residus = historique.map((point) => ({
    date: point.date,
    residu: point.residu,
  }));

  return {
    parametres: {
      ticker: data.ticker,
      fenetre_annees: data.fenetre_annees,
    },
    metriques: {
      r2: data.r2,
      pente_jour: data.pente_jour,
      pente_annuelle_pct: data.pente_annuelle_pct,
      p_value: data.p_value,
      intercept: data.intercept,
      nb_points: data.nb_points,
    },
    courbe: [...courbeHistorique, ...courbeProjection],
    residus,
  };
};

  const handleSubmit = async (parametres) => {
    setLoading(true);
    setErreur(null);
    setResultats(null);

    try {
      const data = await lancerRegression(parametres);
      setResultats(normaliserResultats(data));
    } catch (err) {
      setErreur(err.message || "Erreur lors du calcul de la régression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      <header className="reg-header">
        <span className="reg-badge">Module C</span>
        <h1>Régression linéaire</h1>
        <p className="reg-subtitle">
          Analysez la tendance de long terme d’un ETF et visualisez les limites de la prédiction financière.
        </p>
      </header>

      <div className="reg-container">
        <aside className="reg-sidebar">
          <RegressionForm etfs={etfs} onSubmit={handleSubmit} loading={loading} />
        </aside>

        <main className="reg-main">
          {erreur && <div className="reg-erreur">⚠ {erreur}</div>}

          {loading && (
            <div className="reg-loading">
              <div className="spinner"></div>
              <p>Calcul de la régression en cours...</p>
            </div>
          )}

          {!loading && !resultats && !erreur && (
            <div className="reg-placeholder">
              <h2>👈 Lancez une analyse</h2>
              <p>
                Sélectionnez un ETF, choisissez une fenêtre d’analyse entre 3 et 15 ans,
                puis lancez la régression pour afficher la tendance, les résidus et les métriques statistiques.
              </p>
            </div>
          )}

          {resultats && !loading && (
            <>
              <RegressionResults
                metriques={resultats.metriques}
                parametres={resultats.parametres}
              />

              <RegressionTrendChart data={resultats.courbe} />

              <ResidualsChart data={resultats.residus} />

              <RegressionAnalysis
                metriques={resultats.metriques}
                parametres={resultats.parametres}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}