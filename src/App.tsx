import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import TopPage from './pages/TopPage';
import QuizPage from './pages/QuizPage';
import InvitePage from './pages/InvitePage';
import ResultPage from './pages/ResultPage';
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
        </Routes>
      </main>
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

