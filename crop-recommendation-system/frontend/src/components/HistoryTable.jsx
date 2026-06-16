import { useState } from 'react';
import { Clock, Sprout, User, ChevronDown, ChevronUp, TrendingUp, Calendar } from 'lucide-react';

const CROP_ICONS = {
  Rice: '🌾', Wheat: '🌾', Maize: '🌽', Coffee: '☕', Cotton: '🌿',
  Mungbean: '🫘', Tea: '🍃', Rubber: '🌳', Apple: '🍎', Orange: '🍊',
  Sugarcane: '🎋', Lentil: '🫘',
};

export default function HistoryTable({ history, loading }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <section id="history" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto section-padding">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-earth-100 text-earth-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Clock className="w-4 h-4" />
            Recommendation History
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Past Predictions
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Review previous AI recommendations and track advisory outcomes over time.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-agri-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-3 text-sm">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
            <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No recommendations yet</p>
            <p className="text-gray-400 text-sm mt-1">Submit the form above to get your first AI crop recommendation.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Crop</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Conditions</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((rec) => (
                    <>
                      <tr
                        key={rec.id}
                        className="hover:bg-agri-50/30 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(rec.id)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-400">#{rec.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{CROP_ICONS[rec.predicted_crop] || '🌱'}</span>
                            <div>
                              <span className="font-semibold text-gray-800">{rec.predicted_crop}</span>
                              <span className="block text-xs text-gray-400">Farmer #{rec.farmer_id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rec.confidence_percentage >= 90 ? 'bg-agri-500' :
                                  rec.confidence_percentage >= 70 ? 'bg-sky-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${rec.confidence_percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{rec.confidence_percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="text-xs text-gray-500 space-y-0.5">
                            <span className="inline-block mr-2">🌡 {rec.temp}°C</span>
                            <span className="inline-block mr-2">💧 {rec.humidity}%</span>
                            <span className="inline-block">🌧 {rec.rainfall}mm</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(rec.created_at)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {expandedId === rec.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </td>
                      </tr>
                      {expandedId === rec.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-agri-50/30 border-b border-gray-100">
                            <div className="text-sm text-gray-600 leading-relaxed">
                              <strong className="text-gray-800 flex items-center gap-1.5 mb-1">
                                <TrendingUp className="w-4 h-4 text-agri-600" />
                                Advisory Notes:
                              </strong>
                              {rec.advisory_notes || 'No advisory available.'}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
