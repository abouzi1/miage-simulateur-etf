export default function RegressionAnalysis({ metriques, parametres }) {
  const r2 = Number(metriques?.r2);
  const pente = Number(metriques?.pente_jour ?? metriques?.beta1);
  const pValue = Number(metriques?.p_value);

  const interpretationR2 =
    r2 >= 0.8
      ? "Le R² est élevé : la tendance de long terme est bien visible, mais cela ne veut pas dire que le modèle prédit correctement les cours futurs."
      : "Le R² est modéré ou faible : la droite explique une partie limitée des variations du cours.";

  const interpretationPente =
    pente > 0
      ? "La pente est positive : sur la période étudiée, l’ETF présente une tendance haussière moyenne."
      : "La pente est négative : sur la période étudiée, l’ETF présente une tendance baissière moyenne.";

  const interpretationPValue =
    pValue < 0.05
      ? "La p-value est inférieure à 5 %, ce qui indique que la pente est statistiquement significative."
      : "La p-value est supérieure à 5 %, la pente doit donc être interprétée avec prudence.";

  return (
    <section className="reg-analysis-card">
      <div className="reg-section-title">
        <h2>Interprétation critique</h2>
        <p>
          Cette partie est essentielle pour montrer les limites du modèle.
        </p>
      </div>

      <div className="reg-analysis-grid">
        <article>
          <h3>1. Tendance de long terme</h3>
          <p>{interpretationR2}</p>
          <p>{interpretationPente}</p>
        </article>

        <article>
          <h3>2. Significativité statistique</h3>
          <p>{interpretationPValue}</p>
          <p>
            Une pente significative confirme une tendance moyenne sur la période de{" "}
            {parametres?.fenetre_annees || "plusieurs"} ans, mais pas la capacité à prévoir le court terme.
          </p>
        </article>

        <article>
          <h3>3. Résidus et cycles de marché</h3>
          <p>
            Les résidus peuvent faire apparaître des périodes de crise, de bulle ou de correction.
            Ils ne sont généralement pas parfaitement aléatoires sur les marchés financiers.
          </p>
        </article>

        <article>
          <h3>4. Limite de la projection</h3>
          <p>
            Plus on prolonge la droite dans le futur, plus l’incertitude augmente.
            La projection doit donc rester illustrative.
          </p>
        </article>
      </div>

      <div className="reg-conclusion">
        <strong>Conclusion :</strong> la régression confirme une tendance, pas un timing.
        C’est pourquoi le DCA est plus rationnel que d’essayer de trouver le meilleur moment pour investir.
      </div>
    </section>
  );
}