import { useState, useEffect } from 'react';
import axios from 'axios';
import EtfChart from './EtfChart';

function EtfSelector() {
  const [etfs, setEtfs] = useState([]);
  const [etf1Id, setEtf1Id] = useState("");
  const [etf2Id, setEtf2Id] = useState("");
  
  // NOUVEAU : Un interrupteur (state) pour savoir si on affiche la zone de comparaison
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/etfs')
      .then(response => setEtfs(response.data))
      .catch(error => console.error("Erreur Backend :", error));
  }, []);

  const selectedEtf1 = etfs.find(etf => etf.id.toString() === etf1Id);
  const selectedEtf2 = etfs.find(etf => etf.id.toString() === etf2Id);

  // Fonction pour refermer la comparaison proprement
  const annulerComparaison = () => {
    setIsComparing(false); // On cache la colonne de droite
    setEtf2Id(""); // On vide la mémoire du 2ème ETF pour que le graphique s'ajuste
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Explorateur d'ETF</h2>
      
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '30px' }}>
        
        {/* COLONNE GAUCHE : Toujours visible */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: isComparing ? '#2563eb' : '#333', fontWeight: 'bold' }}>
            {isComparing ? "🔴 Actif n°1 (Courbe Bleue) :" : "Sélectionne un ETF :"}
          </label>
          <select 
            style={{ padding: '8px', width: '100%', fontSize: '16px', borderColor: isComparing ? '#2563eb' : '#ccc' }}
            value={etf1Id}
            onChange={(e) => setEtf1Id(e.target.value)}
          >
            <option value="">-- Sélectionner --</option>
            {etfs.map(etf => <option key={etf.id} value={etf.id}>{etf.nom} ({etf.ticker})</option>)}
          </select>

          {selectedEtf1 && (
            <div style={{ marginTop: '15px', padding: '15px', borderLeft: isComparing ? '4px solid #2563eb' : '4px solid #333', backgroundColor: isComparing ? '#f0f4ff' : '#f9f9f9', borderRadius: '4px' }}>
              <p style={{ margin: '5px 0' }}><strong>Frais :</strong> {(selectedEtf1.ter * 100).toFixed(2)} %</p>
              <p style={{ margin: '5px 0' }}><strong>PEA :</strong> {selectedEtf1.eligible_pea ? "✅ Oui" : "❌ Non"}</p>
              <p style={{ margin: '5px 0' }}><strong>Indice :</strong> {selectedEtf1.indice_replique}</p>
            </div>
          )}

          {/* LE BOUTON COMPARER : Apparaît si on a un ETF1, et qu'on ne compare pas encore */}
          {selectedEtf1 && !isComparing && (
            <button 
              onClick={() => setIsComparing(true)}
              style={{ marginTop: '15px', padding: '10px 15px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              + Comparer avec un autre ETF
            </button>
          )}
        </div>

        {/* COLONNE DROITE : Apparaît uniquement si l'interrupteur isComparing est sur "true" */}
        {isComparing && (
          <div style={{ flex: 1, minWidth: '300px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#ea580c', fontWeight: 'bold' }}>
              🟠 Actif n°2 (Courbe Orange) :
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select 
                style={{ padding: '8px', width: '100%', fontSize: '16px', borderColor: '#ea580c' }}
                value={etf2Id}
                onChange={(e) => setEtf2Id(e.target.value)}
              >
                <option value="">-- Sélectionner pour comparer --</option>
                {etfs.map(etf => <option key={etf.id} value={etf.id}>{etf.nom} ({etf.ticker})</option>)}
              </select>
              
              {/* Le bouton en forme de croix pour annuler */}
              <button 
                onClick={annulerComparaison}
                style={{ padding: '8px 12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                title="Fermer la comparaison"
              >
                ✖
              </button>
            </div>

            {selectedEtf2 && (
              <div style={{ marginTop: '15px', padding: '15px', borderLeft: '4px solid #ea580c', backgroundColor: '#fff7ed', borderRadius: '4px' }}>
                <p style={{ margin: '5px 0' }}><strong>Frais :</strong> {(selectedEtf2.ter * 100).toFixed(2)} %</p>
                <p style={{ margin: '5px 0' }}><strong>PEA :</strong> {selectedEtf2.eligible_pea ? "✅ Oui" : "❌ Non"}</p>
                <p style={{ margin: '5px 0' }}><strong>Indice :</strong> {selectedEtf2.indice_replique}</p>
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