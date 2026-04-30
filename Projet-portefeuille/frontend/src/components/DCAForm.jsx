import { useState, useEffect } from "react";
import "./DCAForm.css";

export default function DCAForm({ etfs, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    etf_ticker: "",
    capital_initial: 1000,
    versement_mensuel: 200,
    date_debut: "2015-01-01",
    date_fin: "2024-12-31",
    ter: "",
  });

  // Pré-remplir TER quand l'ETF change
  useEffect(() => {
    if (formData.etf_ticker && etfs.length > 0) {
      const etf = etfs.find((e) => e.ticker === formData.etf_ticker);
      if (etf && etf.ter !== undefined && etf.ter !== null) {
        setFormData((prev) => ({ ...prev, ter: etf.ter }));
      }
    }
  }, [formData.etf_ticker, etfs]);

  // Sélection automatique du premier ETF
  useEffect(() => {
    if (etfs.length > 0 && !formData.etf_ticker) {
      setFormData((prev) => ({ ...prev, etf_ticker: etfs[0].ticker }));
    }
  }, [etfs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["capital_initial", "versement_mensuel", "ter"].includes(name)
        ? value === "" ? "" : Number(value)
        : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      ter: formData.ter === "" ? null : Number(formData.ter),
    };
    onSubmit(payload);
  };

  return (
    <form className="dca-form" onSubmit={handleSubmit}>
      <h2>Configuration</h2>

      <div className="form-group">
        <label htmlFor="etf_ticker">ETF</label>
        <select
          id="etf_ticker"
          name="etf_ticker"
          value={formData.etf_ticker}
          onChange={handleChange}
          required
        >
          {etfs.map((etf) => (
            <option key={etf.ticker} value={etf.ticker}>
              {etf.ticker} — {etf.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="capital_initial">Capital de départ (€)</label>
        <input
          type="number"
          id="capital_initial"
          name="capital_initial"
          value={formData.capital_initial}
          onChange={handleChange}
          min="0"
          step="100"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="versement_mensuel">Versement mensuel (€)</label>
        <input
          type="number"
          id="versement_mensuel"
          name="versement_mensuel"
          value={formData.versement_mensuel}
          onChange={handleChange}
          min="0"
          step="50"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date_debut">Début</label>
          <input
            type="date"
            id="date_debut"
            name="date_debut"
            value={formData.date_debut}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date_fin">Fin</label>
          <input
            type="date"
            id="date_fin"
            name="date_fin"
            value={formData.date_fin}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="ter">
          TER (frais annuels, ex: 0.0038 = 0.38%)
        </label>
        <input
          type="number"
          id="ter"
          name="ter"
          value={formData.ter}
          onChange={handleChange}
          min="0"
          max="0.05"
          step="0.0001"
          placeholder="Auto-rempli depuis l'ETF"
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Calcul en cours..." : "Lancer la simulation"}
      </button>

      <p className="form-note">
        💡 La simulation rejoue mois par mois votre stratégie sur les données historiques réelles de l'ETF.
      </p>
    </form>
  );
}
