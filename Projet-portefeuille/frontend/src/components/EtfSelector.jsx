import { useState, useEffect } from 'react';
import axios from 'axios';
import EtfChart from './EtfChart';
import './EtfSelector.css';

function EtfSelector() {
  const [etfs, setEtfs] = useState([]);
  const [etf1Id, setEtf1Id] = useState("");
  const [etf2Id, setEtf2Id] = useState("");

  const [isComparing, setIsComparing] = useState(false);

  const [searchEtf1, setSearchEtf1] = useState("");
  const [searchEtf2, setSearchEtf2] = useState("");

  useEffect(() => {
    // MODIFICATION ICI : Remplacement de l'adresse locale par l'URL de production Railway
    axios.get('https://miage-simulateur-etf-production.up.railway.app/etfs/')
      .then(response => setEtfs(response.data))
      .catch(error => console.error("Erreur Backend :", error));
  }, []);

  const selectedEtf1 = etfs.find(etf => etf.id.toString() === etf1Id);
  const selectedEtf2 = etfs.find(etf => etf.id.toString() === etf2Id);

  const filteredEtfs1 = etfs.filter(etf => {
    const nom = etf.nom || "";
    const ticker = etf.ticker || "";
    return `${nom} ${ticker}`.toLowerCase().includes(searchEtf1.toLowerCase());
  });

  const filteredEtfs2 = etfs.filter(etf => {
    const nom = etf.nom || "";
    const ticker = etf.ticker || "";
    return `${nom} ${ticker}`.toLowerCase().includes(searchEtf2.toLowerCase());
  });

  const annulerComparaison = () => {
    setIsComparing(false);
    setEtf2Id("");
    setSearchEtf2("");
  };

  return (
    <div className="etf-selector-page">
      <h2 className="etf-title">
        Explorateur d'ETF
      </h2>

      <div className="etf-selector-container">

        {/* COLONNE GAUCHE */}
        <div className="etf-column">
          <label className={`etf-label ${isComparing ? 'label-blue' : ''}`}>
            {isComparing ? "🔵 Actif n°1 — Courbe bleue :" : "Sélectionne un ETF :"}
          </label>

          <div className="etf-search-card blue-card">
            <div className="search-wrapper">
              <span className="search-icon">🔎</span>

              <input
                type="text"
                className="etf-search-input"
                placeholder="Rechercher un ETF par nom ou ticker..."
                value={searchEtf1}
                onChange={(e) => setSearchEtf1(e.target.value)}
              />
            </div>

            <select
              className="etf-select select-blue"
              value={etf1Id}
              onChange={(e) => setEtf1Id(e.target.value)}
            >
              <option value="">-- Sélectionner --</option>

              {filteredEtfs1.map(etf => (
                <option key={etf.id} value={etf.id}>
                  {etf.nom} ({etf.ticker})
                </option>
              ))}
            </select>
          </div>

          {selectedEtf1 && (
            <div className={`etf-info-box ${isComparing ? 'info-blue' : 'info-neutral'}`}>
              <p><strong>Frais :</strong> {(selectedEtf1.ter * 100).toFixed(2)} %</p>
              <p><strong>PEA :</strong> {selectedEtf1.eligible_pea ? "✅ Oui" : "❌ Non"}</p>
              <p><strong>Indice :</strong> {selectedEtf1.indice_replique}</p>
            </div>
          )}

          {selectedEtf1 && !isComparing && (
            <div className="compare-button-wrapper">
              <button
                className="compare-button"
                onClick={() => setIsComparing(true)}
              >
                + Comparer avec un autre ETF
              </button>
            </div>
          )}
        </div>

        {/* COLONNE DROITE */}
        {isComparing && (
          <div className="etf-column">
            <label className="etf-label label-orange">
              🟠 Actif n°2 — Courbe orange :
            </label>

            <div className="comparison-row">
              <div className="etf-search-card orange-card">
                <div className="search-wrapper">
                  <span className="search-icon">🔎</span>

                  <input
                    type="text"
                    className="etf-search-input orange-input"
                    placeholder="Rechercher un deuxième ETF..."
                    value={searchEtf2}
                    onChange={(e) => setSearchEtf2(e.target.value)}
                  />
                </div>

                <select
                  className="etf-select select-orange"
                  value={etf2Id}
                  onChange={(e) => setEtf2Id(e.target.value)}
                >
                  <option value="">-- Sélectionner pour comparer --</option>

                  {filteredEtfs2.map(etf => (
                    <option key={etf.id} value={etf.id}>
                      {etf.nom} ({etf.ticker})
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="close-compare-button"
                onClick={annulerComparaison}
                title="Fermer la comparaison"
              >
                ✖
              </button>
            </div>

            {selectedEtf2 && (
              <div className="etf-info-box info-orange">
                <p><strong>Frais :</strong> {(selectedEtf2.ter * 100).toFixed(2)} %</p>
                <p><strong>PEA :</strong> {selectedEtf2.eligible_pea ? "✅ Oui" : "❌ Non"}</p>
                <p><strong>Indice :</strong> {selectedEtf2.indice_replique}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {(selectedEtf1 || selectedEtf2) && (
        <EtfChart etf1={selectedEtf1} etf2={selectedEtf2} />
      )}
    </div>
  );
}

export default EtfSelector;