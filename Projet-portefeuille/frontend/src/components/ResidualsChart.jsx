import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ResidualsChart({ data }) {
  return (
    <section className="reg-chart-card">
      <div className="reg-section-title">
        <h2>Analyse des résidus</h2>
        <p>
          Les résidus correspondent à la différence entre le cours réel et le cours prédit.
        </p>
      </div>

      <div className="reg-chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
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
              formatter={(value) => [`${Number(value).toFixed(2)} €`, "Résidu"]}
              labelFormatter={(label) => `Date : ${label}`}
            />
            <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="residu"
              name="Résidu"
              stroke="#1e40af"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}