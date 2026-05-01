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
    const requete1 = etf1 ? axios.get(`http://127.0.0.1:8000/api/etfs/${etf1.id}/historique`) : Promise.resolve({ data: [] });
    const requete2 = etf2 ? axios.get(`http://127.0.0.1:8000/api/etfs/${etf2.id}/historique`) : Promise.resolve({ data: [] });

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
  }, [etf1, etf2]); // On relance ce code dès qu'un des deux ETF change

  if (loading) return <p style={{ marginTop: '20px', textAlign: 'center' }}>⏳ Calcul et fusion des historiques en cours...</p>;
  if (data.length === 0) return null;

  return (
    <div style={{ marginTop: '20px', height: '450px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center' }}>Comparaison des prix de clôture</h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" minTickGap={50} tick={{ fontSize: 12 }} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
          <Tooltip />
          {/* Legend permet d'afficher le nom de la courbe en bas du graphique */}
          <Legend verticalAlign="top" height={36} />
          
          {/* Si ETF1 existe, on dessine sa ligne bleue. On utilise son Ticker comme clé dynamique */}
          {etf1 && (
            <Line type="monotone" dataKey={etf1.ticker} name={etf1.nom} stroke="#2563eb" dot={false} strokeWidth={2} />
          )}
          
          {/* Si ETF2 existe, on dessine sa ligne orange */}
          {etf2 && (
            <Line type="monotone" dataKey={etf2.ticker} name={etf2.nom} stroke="#ea580c" dot={false} strokeWidth={2} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EtfChart;