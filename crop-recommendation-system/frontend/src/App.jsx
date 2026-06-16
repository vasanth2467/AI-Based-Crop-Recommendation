import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SoilForm from './components/SoilForm';
import RecommendationCard from './components/RecommendationCard';
import HistoryTable from './components/HistoryTable';
import CropStats from './components/CropStats';
import { Leaf, Heart, ArrowUp } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionInput, setPredictionInput] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Show prediction card when result arrives
  const [showResult, setShowResult] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/farmers/1/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.recommendations || []);
      }
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/crops/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, [fetchHistory, fetchStats]);

  const handlePredict = async (formData) => {
    setPredictLoading(true);
    setPredictError(null);
    setShowResult(false);
    setPredictionResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || `Server error: ${res.status}`);
      }

      setPredictionResult(data);
      setPredictionInput(formData);
      setShowResult(true);

      // Refresh history and stats
      fetchHistory();
      fetchStats();
    } catch (err) {
      setPredictError(err.message || 'Failed to get prediction. Ensure the backend is running.');
    } finally {
      setPredictLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-agri-50">
      <Header />
      <HeroSection />

      {/* Main Content */}
      <main>
        <SoilForm onPredict={handlePredict} loading={predictLoading} />

        {/* Error Banner */}
        {predictError && (
          <div className="max-w-2xl mx-auto px-4 -mt-6 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-lg">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 text-sm">Prediction Failed</h4>
                <p className="text-red-600 text-sm mt-0.5">{predictError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Result */}
        <RecommendationCard
          result={predictionResult ? { ...predictionResult, input_data: predictionInput } : {}}
          visible={showResult}
        />

        {/* Analytics */}
        <CropStats stats={stats} loading={statsLoading} />

        {/* History */}
        <HistoryTable history={history} loading={historyLoading} />
      </main>

      {/* Footer */}
      <footer className="bg-agri-950 text-agri-200/70 py-12">
        <div className="max-w-6xl mx-auto section-padding">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-agri-800 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-agri-400" />
                </div>
                <span className="font-display text-xl font-bold text-white">AgriSmart AI</span>
              </div>
              <p className="text-sm leading-relaxed">
                Leveraging machine learning to help farmers make data-driven crop decisions.
                Built with scikit-learn, FastAPI, and React.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#predict" className="hover:text-agri-300 transition-colors">Make Prediction</a></li>
                <li><a href="#analytics" className="hover:text-agri-300 transition-colors">Analytics</a></li>
                <li><a href="#history" className="hover:text-agri-300 transition-colors">History</a></li>
              </ul>
            </div>

            {/* Tech Stack */}
            <div>
              <h4 className="text-white font-semibold mb-4">Technology Stack</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-agri-500 rounded-full" />
                  scikit-learn RandomForest
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-agri-500 rounded-full" />
                  FastAPI + SQLAlchemy
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-agri-500 rounded-full" />
                  React + Tailwind CSS
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-agri-500 rounded-full" />
                  PostgreSQL / SQLite
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-agri-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-agri-400">
              &copy; {new Date().getFullYear()} AgriSmart AI. Built for farmers everywhere.
            </p>
            <p className="text-xs text-agri-400 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for agriculture
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 w-11 h-11 bg-agri-700 hover:bg-agri-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
