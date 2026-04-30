export default function RegressionResults({ metriques, parametres }) {
  const formatNombre = (valeur, decimals = 2) => {
    if (valeur === null || valeur === undefined || Number.isNaN(Number(valeur))) return "N/A";
    return Number(valeur).toFixed(decimals);
  };

  const formatPercent = (valeur) => {
    if (valeur === null || valeur === undefined || Number.isNaN(Number(valeur))) return "N/A";
    return `${Number(valeur).toFixed(2)} %`;
  };

  const pValue =
    metriques?.p_value !== undefined && metriques?.p_value !== null
      ? Number(metriques.p_value)
      : null;

  return (
    <section className="reg-results-card">
      <div className="reg-results-header">
        <div>
          <h2>Synthèse de la régression</h2>
          <p>
            ETF : <strong>{parametres?.ticker || "N/A"}</strong> · Fenêtre :{" "}
            <strong>{parametres?.fenetre_annees || "N/A"} ans</strong>
          </p>
        </div>
      </div>

      <div className="reg-metrics-grid">
        <div className="reg-metric">
          <span>R²</span>
          <strong>{formatNombre(metriques?.r2, 4)}</strong>
          <small>Part de la variation expliquée par le temps</small>
        </div>

        <div className="reg-metric">
          <span>Pente β1</span>
          <strong>{formatNombre(metriques?.pente_jour ?? metriques?.beta1, 4)} €/jour</strong>
          <small>Tendance moyenne quotidienne</small>
        </div>

        <div className="reg-metric">
          <span>Pente annualisée</span>
          <strong>{formatPercent(metriques?.pente_annuelle_pct)}</strong>
          <small>Approximation de la tendance annuelle</small>
        </div>

        <div className="reg-metric">
          <span>P-value</span>
          <strong>{pValue !== null ? pValue.toExponential(2) : "N/A"}</strong>
          <small>Significativité statistique de la pente</small>
        </div>
      </div>
    </section>
  );
}