import { useState } from "react";

export default function RegressionForm({ etfs, onSubmit, loading }) {
  const [ticker, setTicker] = useState("CW8.PA");
  const [fenetreAnnees, setFenetreAnnees] = useState(10);
  const [inclureProjection, setInclureProjection] = useState(true);

  const handleSubmit = (e) => {
  e.preventDefault();

  onSubmit({
    ticker,
    fenetre_annees: Number(fenetreAnnees),
  });
};

  return (
    <form className="reg-form-card" onSubmit={handleSubmit}>
      <h2>Paramètres</h2>
      <p className="reg-form-intro">
        Configurez l’ETF et la période utilisée pour calculer la tendance linéaire.
      </p>

      <div className="reg-form-group">
        <label htmlFor="ticker">ETF analysé</label>
        <select
          id="ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        >
          {etfs.map((etf) => (
            <option key={etf.ticker} value={etf.ticker}>
              {etf.ticker} — {etf.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="reg-form-group">
        <label htmlFor="fenetre">Fenêtre d’analyse</label>
        <select
          id="fenetre"
          value={fenetreAnnees}
          onChange={(e) => setFenetreAnnees(e.target.value)}
        >
          <option value={3}>3 ans</option>
          <option value={5}>5 ans</option>
          <option value={10}>10 ans</option>
          <option value={15}>15 ans</option>
        </select>
      </div>

      <label className="reg-checkbox">
        <input
          type="checkbox"
          checked={inclureProjection}
          onChange={(e) => setInclureProjection(e.target.checked)}
        />
        <span>Inclure une projection illustrative sur 12 mois</span>
      </label>

      <button type="submit" className="reg-submit" disabled={loading}>
        {loading ? "Analyse en cours..." : "Lancer la régression"}
      </button>

      <div className="reg-warning">
        ⚠ La projection est illustrative : elle ne garantit pas les performances futures.
      </div>
    </form>
  );
}