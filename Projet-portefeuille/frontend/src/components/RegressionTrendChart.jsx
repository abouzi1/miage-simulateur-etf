import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function RegressionTrendChart({ data }) {
  return (
    <section className="reg-chart-card">
      <div className="reg-section-title">
        <h2>Cours historique et droite de régression</h2>
        <p>
          La droite représente la tendance moyenne estimée par le modèle linéaire.
        </p>
      </div>

      <div className="reg-chart-wrapper">
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              minTickGap={35}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value} €`}
            />
            <Tooltip
              formatter={(value, name) => {
                if (value === null || value === undefined) return ["N/A", name];
                if (Array.isArray(value)) {
                  return [`${value[0].toFixed(2)} € - ${value[1].toFixed(2)} €`, "IC 95 %"];
                }
                return [`${Number(value).toFixed(2)} €`, name];
              }}
              labelFormatter={(label) => `Date : ${label}`}
            />
            <Legend />

            <Area
              type="monotone"
              dataKey="ic_95"
              name="Intervalle de confiance 95 %"
              stroke="none"
              fill="#dbeafe"
              fillOpacity={0.8}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="prix_reel"
              name="Cours réel"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              connectNulls
            />

            <Line
              type="monotone"
              dataKey="prix_predit"
              name="Droite de régression"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="reg-chart-note">
        La partie projetée reste une estimation théorique basée sur une droite : elle ne doit pas être interprétée comme une prédiction fiable du marché.
      </div>
    </section>
  );
}