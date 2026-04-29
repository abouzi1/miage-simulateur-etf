import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function EtfChart({ etfId }) {
  // Boîte pour stocker les milliers de prix
  const [data, setData] = useState([]);
  // Boîte pour savoir si on est en train de charger
  const [loading, setLoading] = useState(false);

  // Ce code s'active à chaque fois que l'etfId change (quand tu cliques dans le menu)
  useEffect(() => {
    if (!etfId) return;

    setLoading(true);
    // On appelle ta fameuse route Historique !
    axios.get(`http://127.0.0.1:8000/api/etfs/${etfId}/historique`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération de l'historique :", error);
        setLoading(false);
      });
  }, [etfId]);

  if (loading) return <p style={{ marginTop: '20px' }}>⏳ Chargement de l'historique (cela peut prendre quelques secondes)...</p>;
  if (data.length === 0) return null;

  return (
    <div style={{ marginTop: '40px', height: '400px', width: '100%', maxWidth: '800px' }}>
      <h3>Évolution du prix de clôture</h3>
      
      {/* ResponsiveContainer permet au graphique de s'adapter à la taille de l'écran */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            minTickGap={50} // Évite que les dates ne se chevauchent
            tick={{ fontSize: 12 }}
          />
          {/* L'axe Y s'adapte automatiquement au prix le plus bas et le plus haut */}
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="prix" 
            stroke="#2563eb" // Une jolie couleur bleue
            dot={false} // On enlève les points pour que la ligne soit fluide (il y a 3000 points !)
            strokeWidth={2} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EtfChart;