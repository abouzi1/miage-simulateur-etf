import { useState, useEffect } from 'react';
import axios from 'axios';
import EtfChart from './EtfChart';

function EtfSelector() {
  const [etfs, setEtfs] = useState([]);
  // On crée deux boîtes pour nos deux ETF
  const [etf1Id, setEtf1Id] = useState("");
  const [etf2Id, setEtf2Id] = useState("");

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/etfs')
      .then(response => setEtfs(response.data))
      .catch(error => console.error("Erreur Backend :", error));
  }, []);

  const selectedEtf1 = etfs.find(etf => etf.id.toString() === etf1Id);
  const selectedEtf2 = etfs.find(etf => etf.id.toString() === etf2Id);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Explorateur et Comparateur d'ETF (Module A)</h2>
      
      {/* Conteneur Flexbox pour mettre les deux sélecteurs côte à côte */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '30px' }}>
        
        {/* COLONNE GAUCHE : ETF 1 (Bleu) */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#2563eb', fontWeight: 'bold' }}>
            🔴 Actif n°1 (Courbe Bleue) :
          </label>
          <select 
            style={{ padding: '8px', width: '100%', fontSize: '16px', borderColor: '#2563eb' }}
            value={etf1Id}
            onChange={(e) => setEtf1Id(e.target.value)}
          >
            <option value="">-- Sélectionner --</option>
            {etfs.map(etf => <option key={etf.id} value={etf.id}>{etf.nom} ({etf.ticker})</option>)}
          </select>

          {selectedEtf1 && (
            <div style={{ marginTop: '15px', padding: '15px', borderLeft: '4px solid #2563eb', backgroundColor: '#f0f4ff', borderRadius: '4px' }}>
              <p style={{ margin: '5px 0' }}><strong>Frais :</strong> {(selectedEtf1.ter * 100).toFixed(2)} %</p>
              <p style={{ margin: '5px 0' }}><strong>PEA :</strong> {selectedEtf1.eligible_pea ? "✅ Oui" : "❌ Non"}</p>
              <p style={{ margin: '5px 0' }}><strong>Indice :</strong> {selectedEtf1.indice_replique}</p>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : ETF 2 (Orange) */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#ea580c', fontWeight: 'bold' }}>
            🟠 Actif n°2 (Courbe Orange) :
          </label>
          <select 
            style={{ padding: '8px', width: '100%', fontSize: '16px', borderColor: '#ea580c' }}
            value={etf2Id}
            onChange={(e) => setEtf2Id(e.target.value)}
          >
            <option value="">-- Sélectionner pour comparer --</option>
            {etfs.map(etf => <option key={etf.id} value={etf.id}>{etf.nom} ({etf.ticker})</option>)}
          </select>

          {selectedEtf2 && (
            <div style={{ marginTop: '15px', padding: '15px', borderLeft: '4px solid #ea580c', backgroundColor: '#fff7ed', borderRadius: '4px' }}>
              <p style={{ margin: '5px 0' }}><strong>Frais :</strong> {(selectedEtf2.ter * 100).toFixed(2)} %</p>
              <p style={{ margin: '5px 0' }}><strong>PEA :</strong> {selectedEtf2.eligible_pea ? "✅ Oui" : "❌ Non"}</p>
              <p style={{ margin: '5px 0' }}><strong>Indice :</strong> {selectedEtf2.indice_replique}</p>
            </div>
          )}
        </div>
      </div>

      {/* Le Graphique : On lui passe maintenant les objets complets pour qu'il connaisse les Tickers */}
      {(selectedEtf1 || selectedEtf2) && (
        <EtfChart etf1={selectedEtf1} etf2={selectedEtf2} />
      )}
    </div>
  );
}

export default EtfSelector;