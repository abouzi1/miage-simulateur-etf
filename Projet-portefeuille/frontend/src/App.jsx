import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import SimulateurDCA from "./pages/SimulateurDCA";
import "./App.css";

// ============================================================
// PAGE D'ACCUEIL
// ============================================================
function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content fade-in">
          <span className="hero-badge">📊 Projet DATA — M2 MIAGE</span>
          <h1 className="hero-title">
            Simulateur de <span className="hero-highlight">Portefeuille Passif</span>
          </h1>
          <p className="hero-subtitle">
            Comprenez l'investissement passif avec des données historiques réelles.
            Simulez vos stratégies DCA, analysez les tendances de marché, et apprenez
            pourquoi les ETF sont la base d'un placement rationnel.
          </p>
          <div className="hero-actions">
            <NavLink to="/simulateur" className="btn-hero btn-hero-primary">
              Lancer une simulation →
            </NavLink>
            <NavLink to="/etf" className="btn-hero btn-hero-secondary">
              Explorer les ETF
            </NavLink>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
      </section>

      <section className="modules-section">
        <h2 className="section-title">Trois modules pour tout comprendre</h2>
        <p className="section-subtitle">
          De l'exploration des ETF à l'analyse statistique en passant par la simulation
        </p>

        <div className="modules-grid">
          <ModuleCard
            icon="🔍"
            number="A"
            title="Explorateur d'ETF"
            description="Recherchez des ETF, consultez leurs caractéristiques (TER, indice, éligibilité PEA) et comparez leurs performances historiques."
            link="/etf"
            cta="Explorer"
          />
          <ModuleCard
            icon="📈"
            number="B"
            title="Simulateur DCA"
            description="Testez votre stratégie d'investissement programmé sur des données passées. Visualisez l'impact des frais et comparez avec un Livret A."
            link="/simulateur"
            cta="Simuler"
            highlight
          />
          <ModuleCard
            icon="📐"
            number="C"
            title="Régression linéaire"
            description="Analyse statistique des tendances de marché par OLS. Métriques (R², pente, p-value), résidus et interprétation critique."
            link="/regression"
            cta="Analyser"
          />
        </div>
      </section>

      <section className="info-section">
        <div className="info-grid">
          <InfoCard
            icon="💡"
            title="Qu'est-ce qu'un ETF ?"
            text="Un ETF est un fonds coté qui réplique automatiquement un indice (ex. S&P 500). C'est la base de l'investissement passif : vous achetez 'le marché entier' sans choisir d'actions."
          />
          <InfoCard
            icon="📅"
            title="Le DCA, c'est quoi ?"
            text="Le Dollar Cost Averaging consiste à investir une somme fixe chaque mois. Cela lisse le prix d'achat moyen et évite le piège du market timing."
          />
          <InfoCard
            icon="💰"
            title="Pourquoi le TER compte ?"
            text="Sur 30 ans, une différence de 1% de frais annuels peut représenter des dizaines de milliers d'euros. Les ETF passifs (~0.20%) sont bien plus rentables que les fonds actifs (~1.5%)."
          />
        </div>
      </section>
    </div>
  );
}

// ============================================================
// CARTES
// ============================================================
function ModuleCard({ icon, number, title, description, link, cta, highlight }) {
  return (
    <div className={`module-card ${highlight ? "module-card-highlight" : ""}`}>
      <div className="module-card-header">
        <span className="module-card-icon">{icon}</span>
        <span className="module-card-number">Module {number}</span>
      </div>
      <h3 className="module-card-title">{title}</h3>
      <p className="module-card-description">{description}</p>
      <NavLink to={link} className="module-card-cta">
        {cta} →
      </NavLink>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="info-card">
      <span className="info-card-icon">{icon}</span>
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}

// ============================================================
// PAGES PLACEHOLDER (en attendant les autres modules)
// ============================================================
function ExplorateurETF() {
  return (
    <div className="placeholder-page">
      <span className="placeholder-icon">🔍</span>
      <h1>Module A — Explorateur d'ETF</h1>
      <p>Cette page sera développée par mon coéquipier.</p>
      <p className="placeholder-meta">🚧 En cours de construction</p>
    </div>
  );
}

function RegressionLineaire() {
  return (
    <div className="placeholder-page">
      <span className="placeholder-icon">📐</span>
      <h1>Module C — Régression linéaire</h1>
      <p>Cette page sera développée par mon coéquipier.</p>
      <p className="placeholder-meta">🚧 En cours de construction</p>
    </div>
  );
}

// ============================================================
// NAVBAR
// ============================================================
function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <span className="navbar-logo">📊</span>
        <span className="navbar-title">Portefeuille Passif</span>
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/" end className="navbar-link">
          Accueil
        </NavLink>
        <NavLink to="/etf" className="navbar-link">
          ETF
        </NavLink>
        <NavLink to="/simulateur" className="navbar-link">
          Simulateur
        </NavLink>
        <NavLink to="/regression" className="navbar-link">
          Régression
        </NavLink>
      </div>

      <div className="navbar-meta">
        <span className="navbar-tag">M2 MIAGE</span>
      </div>
    </nav>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <strong>📊 Portefeuille Passif</strong>
          <p>Projet DATA — Master 2 MIAGE</p>
          <p>Université Paris-Saclay — 2025/2026</p>
        </div>

        <div className="footer-section">
          <strong>Navigation</strong>
          <NavLink to="/etf">Explorateur d'ETF</NavLink>
          <NavLink to="/simulateur">Simulateur DCA</NavLink>
          <NavLink to="/regression">Régression</NavLink>
        </div>

        <div className="footer-section">
          <strong>Technologies</strong>
          <span>FastAPI · PostgreSQL</span>
          <span>React · Recharts · Vite</span>
          <span>scikit-learn · Pandas</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>⚠ Le passé ne préjuge pas du futur. Outil pédagogique uniquement.</span>
      </div>
    </footer>
  );
}

// ============================================================
// APP
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/etf" element={<ExplorateurETF />} />
            <Route path="/simulateur" element={<SimulateurDCA />} />
            <Route path="/regression" element={<RegressionLineraire />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
