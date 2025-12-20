import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import TopPage from './pages/TopPage';
import QuizPage from './pages/QuizPage';
import InvitePage from './pages/InvitePage';
import ResultPage from './pages/ResultPage';
import LicensePage from './pages/LicensePage';
import { AppStatusProvider } from './context/AppStatusContext';
import StatusBanner from './components/StatusBanner';

export function AppContent() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="brand-mark">💞</span>
          <span className="brand-name">L2L</span>
          <span className="host-note">to Love Diagnosis</span>
        </Link>
      </header>

      <StatusBanner />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/license" element={<LicensePage />} />
          <Route path="/licenses" element={<LicensePage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="footer-brand">
          <span className="brand-mark">💞</span>
          <div className="footer-brand-text">
            <span className="footer-title">L2L</span>
            <span className="footer-subtitle">Love Diagnosis</span>
          </div>
        </div>
        <div className="footer-links">
          <Link className="footer-link" to="/licenses">
            Third-party licenses
          </Link>
          <a
            className="footer-link"
            href="https://github.com/byoo-myoo/L2L"
            target="_blank"
            rel="noreferrer"
          >
            GitHub repository
          </a>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppStatusProvider>
      <Router>
        <AppContent />
      </Router>
    </AppStatusProvider>
  );
}

export default App;

