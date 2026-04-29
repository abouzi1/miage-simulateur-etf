import { useState, useEffect } from 'react';
import axios from 'axios';
import EtfChart from './EtfChart'; // <--- 1. L'IMPORTATION EST ICI

function EtfSelector() {
  const [etfs, setEtfs] = useState([]);
  const [selectedEtfId, setSelectedEtfId] = useState("");

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/etfs')
      .then(response => {
        setEtfs(response.data);
      })
      .catch(error => {
        console.error("Erreur de connexion au Backend :", error);
      });
  }, []);

  const selectedEtf = etfs.find(etf => etf.id.toString() === selectedEtfId);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Explorateur d'ETF (Module A)</h2>
      <label htmlFor="etf-select" style={{ marginRight: '10px' }}>
        Sélectionne un ETF :
      </label>
      
      <select 
        id="etf-select" 
        style={{ padding: '8px', fontSize: '16px' }}
        value={selectedEtfId}
        onChange={(e) => setSelectedEtfId(e.target.value)}
      >
        <option value="">-- Liste des ETF --</option>
        {etfs.map(etf => (
          <option key={etf.id} value={etf.id}>
            {etf.nom} ({etf.ticker})
          </option>
        ))}
      </select>

      {/* La carte d'identité */}
      {selectedEtf && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          maxWidth: '400px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3 style={{ marginTop: '0' }}>Détails du produit</h3>
          <p><strong>Nom :</strong> {selectedEtf.nom}</p>
          <p><strong>Ticker :</strong> {selectedEtf.ticker}</p>
          <p><strong>Indice répliqué :</strong> {selectedEtf.indice_replique}</p>
          <p><strong>Gestionnaire :</strong> {selectedEtf.gestionnaire}</p>
          <p><strong>Frais de gestion :</strong> {(selectedEtf.ter * 100).toFixed(2)} %</p>
          <p><strong>Éligible PEA :</strong> {selectedEtf.eligible_pea ? "✅ Oui" : "❌ Non"}</p>
        </div>
      )}

      {/* <--- 2. LE GRAPHIQUE EST PLACÉ ICI, JUSTE AVANT LA FIN DE LA PAGE */}
      {selectedEtfId && (
        <EtfChart etfId={selectedEtfId} />
      )}

    </div> // <--- Voici la toute dernière balise dont je parlais !
  );
}

export default EtfSelector;