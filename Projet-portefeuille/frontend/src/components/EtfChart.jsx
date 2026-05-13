import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function EtfChart({ etf1, etf2 }) {
  // 1. Le nouveau state pour gérer l'échelle temporelle choisie (par défaut: "10A")
  const [echelle, setEchelle] = useState("10A");
  
  // States existants
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!etf1 && !etf2) {
      setData([]);
      return;
    }

    setLoading(true);

    const requete1 = etf1 ? axios.get(`http://127.0.0.1:8000/etfs/${etf1.id}/historique`) : Promise.resolve({ data: [] });
    const requete2 = etf2 ? axios.get(`http://127.0.0.1:8000/etfs/${etf2.id}/historique`) : Promise.resolve({ data: [] });

    Promise.all([requete1, requete2])
      .then(([reponse1, reponse2]) => {
        const historique1 = reponse1.data;
        const historique2 = reponse2.data;

        const donneesFusionnees = {};

        historique1.forEach(item => {
          donneesFusionnees[item.date] = { date: item.date, [etf1.ticker]: item.prix };
        });

        historique2.forEach(item => {
          if (!donneesFusionnees[item.date]) {
            donneesFusionnees[item.date] = { date: item.date };
          }
          donneesFusionnees[item.date][etf2.ticker] = item.prix;
        });

        const tableauFinal = Object.values(donneesFusionnees).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setData(tableauFinal);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la fusion de l'historique :", error);
        setLoading(false);
      });
  }, [etf1, etf2]);

  // 2. La fonction qui filtre les données brutes selon le bouton cliqué
  const filtrerHistorique = (donnees, echelleChoisie) => {
    if (!donnees || donnees.length === 0) return [];

    const dateLaPlusRecente = new Date(donnees[donnees.length - 1].date);
    let dateLimite = new Date(dateLaPlusRecente);

    if (echelleChoisie === "1A") {
      dateLimite.setFullYear(dateLaPlusRecente.getFullYear() - 1);
    } else if (echelleChoisie === "3A") {
      dateLimite.setFullYear(dateLaPlusRecente.getFullYear() - 3);
    } else {
      return donnees; // Pour 10 ans ou plus, on renvoie tout
    }

    return donnees.filter(point => new Date(point.date) >= dateLimite);
  };

  if (loading) return <p style={{ marginTop: '20px', textAlign: 'center' }}>⏳ Calcul et fusion des historiques en cours...</p>;
  if (data.length === 0) return null;

  // 3. On applique le filtre juste avant le rendu (comme ça, on ne refait pas de requête réseau quand on change l'échelle !)
  const donneesFiltrees = filtrerHistorique(data, echelle);

  // Styles en ligne pour les boutons (tu pourras les déplacer dans EtfSelector.css plus tard si tu veux)
  const boutonStyle = {
    padding: '8px 16px',
    margin: '0 5px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    color: '#334155',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  };

  const boutonActifStyle = {
    ...boutonStyle,
    backgroundColor: '#2563eb',
    color: '#fff',
    borderColor: '#2563eb'
  };

  return (
    // On ajoute position: 'relative' au conteneur principal pour pouvoir placer notre icône
    <div className="carte-commune" style={{ position: 'relative', height: '550px', width: '100%', maxWidth: '1000px', margin: '20px auto', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Comparaison des prix de clôture</h3>
      
      {/* 4. Les boutons de sélection d'échelle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <button 
          style={echelle === "1A" ? boutonActifStyle : boutonStyle} 
          onClick={() => setEchelle("1A")}
        >
          1 An
        </button>
        <button 
          style={echelle === "3A" ? boutonActifStyle : boutonStyle} 
          onClick={() => setEchelle("3A")}
        >
          3 Ans
        </button>
        <button 
          style={echelle === "10A" ? boutonActifStyle : boutonStyle} 
          onClick={() => setEchelle("10A")}
        >
          10 Ans
        </button>
      </div>

      {/* NOUVEAU : L'icône des flèches orthogonales en haut à droite */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '25px', 
        display: 'flex', 
        alignItems: 'flex-end', 
        color: '#94a3b8', 
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '2px' }}>
          <span>Prix</span>
          {/* Dessin SVG personnalisé des deux flèches */}
          <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginTop: '2px' }}>
             {/* Axe Y (vertical) avec sa flèche */}
             <path d="M4 20V4l-3 3m3-3l3 3" />
             {/* Axe X (horizontal) avec sa flèche */}
             <path d="M4 20h16l-3-3m3 3l-3 3" />
          </svg>
        </div>
        <span style={{ marginBottom: '2px' }}>Temps</span>
      </div>
      
      {/* 5. Le graphique Recharts */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={donneesFiltrees}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" minTickGap={50} tick={{ fontSize: 12 }} />
          
          <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#2563eb' }} />
          
          {etf2 && (
            <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#ea580c' }} />
          )}

          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          
          {etf1 && (
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey={etf1.ticker} 
              name={etf1.nom} 
              stroke="#2563eb" 
              dot={false} 
              strokeWidth={2} 
              connectNulls={true} 
            />
          )}
          
          {etf2 && (
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey={etf2.ticker} 
              name={etf2.nom} 
              stroke="#ea580c" 
              dot={false} 
              strokeWidth={2} 
              connectNulls={true} 
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EtfChart;