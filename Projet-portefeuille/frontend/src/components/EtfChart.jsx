import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function EtfChart({ etf1, etf2 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // S'il n'y a aucun ETF sélectionné, on vide le graphique
    if (!etf1 && !etf2) {
      setData([]);
      return;
    }

    setLoading(true);

    // On prépare les deux appels à l'API. Si un ETF manque, on renvoie une liste vide pour ne rien bloquer.
    const requete1 = etf1 ? axios.get(`http://127.0.0.1:8000/etfs/${etf1.id}/historique`) : Promise.resolve({ data: [] });
    const requete2 = etf2 ? axios.get(`http://127.0.0.1:8000/etfs/${etf2.id}/historique`) : Promise.resolve({ data: [] });

    // On lance les deux requêtes en même temps avec Promise.all
    Promise.all([requete1, requete2])
      .then(([reponse1, reponse2]) => {
        const historique1 = reponse1.data;
        const historique2 = reponse2.data;

        // FUSION DES DONNÉES : On utilise un dictionnaire pour regrouper les prix par date
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

        // On retransforme le dictionnaire en tableau et on le trie chronologiquement
        const tableauFinal = Object.values(donneesFusionnees).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setData(tableauFinal);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la fusion de l'historique :", error);
        setLoading(false);
      });
  }, [etf1, etf2]);

  if (loading) return <p style={{ marginTop: '20px', textAlign: 'center' }}>⏳ Calcul et fusion des historiques en cours...</p>;
  if (data.length === 0) return null;

  return (
    <div className="carte-commune" style={{ height: '450px', width: '100%', maxWidth: '1000px', margin: '20px auto' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Comparaison des prix de clôture</h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" minTickGap={50} tick={{ fontSize: 12 }} />
          
          {/* 1. L'axe de GAUCHE (Bleu) pour l'ETF 1 */}
          <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#2563eb' }} />
          
          {/* 2. L'axe de DROITE (Orange) pour l'ETF 2 (s'il existe) */}
          {etf2 && (
            <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#ea580c' }} />
          )}

          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          
          {/* Ligne ETF 1 */}
          {etf1 && (
            <Line 
              yAxisId="left" /* <--- On rattache cette ligne à l'axe de gauche */
              type="monotone" 
              dataKey={etf1.ticker} 
              name={etf1.nom} 
              stroke="#2563eb" 
              dot={false} 
              strokeWidth={2} 
              connectNulls={true} 
            />
          )}
          
          {/* Ligne ETF 2 */}
          {etf2 && (
            <Line 
              yAxisId="right" /* <--- On rattache cette ligne à l'axe de droite */
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