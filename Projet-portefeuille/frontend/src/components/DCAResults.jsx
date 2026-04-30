import "./DCAResults.css";

const formatEuro = (value) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value) =>
  new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function DCAResults({ metriques, parametres }) {
  const {
    capital_total_verse,
    valeur_finale,
    valeur_finale_sans_frais,
    gain_net,
    impact_frais_total,
    cagr,
    nombre_mois,
    valeur_livret_a,
  } = metriques;

  const gainPositif = gain_net >= 0;
  const performanceVsLivret = valeur_finale - valeur_livret_a;

  return (
    <div className="dca-results">
      {/* Cartes de métriques */}
      <div className="metrics-grid">
        <MetricCard
          label="Capital versé"
          value={formatEuro(capital_total_verse)}
          subtitle={`${nombre_mois} mois`}
          color="bleu"
        />
        <MetricCard
          label="Valeur finale"
          value={formatEuro(valeur_finale)}
          subtitle={`avec frais TER`}
          color="bleu-fonce"
          highlight
        />
        <MetricCard
          label="Gain net"
          value={formatEuro(gain_net)}
          subtitle={gainPositif ? "📈 Plus-value" : "📉 Moins-value"}
          color={gainPositif ? "vert" : "rouge"}
        />
        <MetricCard
          label="CAGR"
          value={formatPercent(cagr)}
          subtitle="Rendement annualisé"
          color="bleu"
        />
      </div>

      {/* Tableau comparatif (impact des frais) */}
      <div className="comparison-table">
        <h3>📊 Impact des frais TER</h3>
        <table>
          <thead>
            <tr>
              <th>Scénario</th>
              <th>Valeur finale</th>
              <th>Différence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Sans frais</strong> (TER = 0%)
              </td>
              <td className="value-cell">{formatEuro(valeur_finale_sans_frais)}</td>
              <td>—</td>
            </tr>
            <tr className="row-highlight">
              <td>
                <strong>Avec frais réels</strong> (TER ETF)
              </td>
              <td className="value-cell">{formatEuro(valeur_finale)}</td>
              <td className="value-negative">
                −{formatEuro(impact_frais_total)}
              </td>
            </tr>
            <tr>
              <td>
                <strong>Livret A</strong> (3% / an, sans risque)
              </td>
              <td className="value-cell">{formatEuro(valeur_livret_a)}</td>
              <td className={performanceVsLivret >= 0 ? "value-positive" : "value-negative"}>
                {performanceVsLivret >= 0 ? "+" : ""}
                {formatEuro(performanceVsLivret)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="table-note">
          💡 Sur le long terme, même un TER faible représente une perte importante.
          Les ETF passifs (TER ~0.20%) sont beaucoup plus rentables que les fonds actifs (TER ~1.5%).
        </p>
      </div>

      {/* Avertissement obligatoire (cf. cahier des charges) */}
      <div className="warning-card">
        <strong>⚠ Note importante :</strong> Le fait qu'une stratégie ait bien fonctionné
        dans le passé ne garantit pas ses performances futures. Le backtesting est un outil
        d'illustration, pas de prédiction.
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtitle, color, highlight }) {
  return (
    <div className={`metric-card metric-${color} ${highlight ? "metric-highlight" : ""}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-subtitle">{subtitle}</div>
    </div>
  );
}
