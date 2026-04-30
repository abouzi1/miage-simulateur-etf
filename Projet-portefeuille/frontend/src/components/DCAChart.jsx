import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./DCAChart.css";

const formatEuroCompact = (value) => {
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k €`;
  return `${value.toFixed(0)} €`;
};

const formatEuroFull = (value) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="tooltip-date">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="tooltip-entry" style={{ color: entry.color }}>
          <span className="tooltip-name">{entry.name}:</span>{" "}
          <strong>{formatEuroFull(entry.value)}</strong>
        </p>
      ))}
    </div>
  );
};

export default function DCAChart({ resultats, valeurLivretA }) {
  // Préparation des données pour Recharts
  const data = resultats.map((r) => ({
    date: new Date(r.date).toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    }),
    "Valeur portefeuille": r.valeur_portefeuille,
    "Sans frais": r.valeur_sans_frais,
    "Capital versé": r.capital_verse,
  }));

  return (
    <div className="dca-chart-container">
      <h3>📈 Évolution du portefeuille</h3>
      <p className="chart-subtitle">
        Valeur de votre portefeuille mois par mois, comparée au capital versé.
      </p>

      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorPortefeuille" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorSansFrais" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            tickFormatter={formatEuroCompact}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "1rem" }}
            iconType="circle"
          />

          <Area
            type="monotone"
            dataKey="Sans frais"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#colorSansFrais)"
          />
          <Area
            type="monotone"
            dataKey="Valeur portefeuille"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#colorPortefeuille)"
          />
          <Line
            type="monotone"
            dataKey="Capital versé"
            stroke="#6b7280"
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="chart-legend-info">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "#3b82f6" }}></span>
          <span><strong>Valeur portefeuille</strong> : votre portefeuille avec les frais TER réellement déduits</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "#10b981" }}></span>
          <span><strong>Sans frais</strong> : ce que vaudrait votre portefeuille avec un TER de 0%</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "#6b7280" }}></span>
          <span><strong>Capital versé</strong> : la somme totale que vous avez investie</span>
        </div>
      </div>
    </div>
  );
}
