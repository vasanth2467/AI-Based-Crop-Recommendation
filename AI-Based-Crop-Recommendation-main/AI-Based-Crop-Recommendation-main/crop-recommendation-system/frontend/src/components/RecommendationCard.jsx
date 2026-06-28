import { useEffect, useRef } from 'react';
import {
  CheckCircle2, AlertTriangle, Sprout, Thermometer, Droplets, CloudRain,
  Lightbulb, ArrowRight, TrendingUp, ShieldCheck, FlaskConical
} from 'lucide-react';
import ConfidenceGauge from './ConfidenceGauge';

const CROP_META = {
  Rice: { icon: '🌾', color: 'bg-yellow-100 text-yellow-800', season: 'Kharif', water: 'High', market: 'Stable' },
  Wheat: { icon: '🌾', color: 'bg-amber-100 text-amber-800', season: 'Rabi', water: 'Medium', market: 'MSP Protected' },
  Maize: { icon: '🌽', color: 'bg-yellow-100 text-yellow-700', season: 'Year-round', water: 'Medium', market: 'Growing' },
  Coffee: { icon: '☕', color: 'bg-amber-100 text-amber-900', season: 'Perennial', water: 'Medium', market: 'Premium' },
  Cotton: { icon: '🌿', color: 'bg-green-100 text-green-800', season: 'Kharif', water: 'Medium', market: 'Volatile' },
  Mungbean: { icon: '🫘', color: 'bg-lime-100 text-lime-800', season: 'Summer/Zaid', water: 'Low', market: 'Export Demand' },
  Tea: { icon: '🍃', color: 'bg-emerald-100 text-emerald-800', season: 'Perennial', water: 'High', market: 'Auction Stable' },
  Rubber: { icon: '🌳', color: 'bg-teal-100 text-teal-800', season: 'Perennial', water: 'High', market: 'Price Sensitive' },
  Apple: { icon: '🍎', color: 'bg-red-100 text-red-800', season: 'Temperate', water: 'Medium', market: 'Cold Storage' },
  Orange: { icon: '🍊', color: 'bg-orange-100 text-orange-800', season: 'Sub-tropical', water: 'Medium', market: 'Processing' },
  Sugarcane: { icon: '🎋', color: 'bg-green-100 text-green-700', season: 'Year-round', water: 'Very High', market: 'Ethanol Policy' },
  Lentil: { icon: '🫘', color: 'bg-yellow-100 text-yellow-800', season: 'Rabi', water: 'Low', market: 'Export Strong' },
};

export default function RecommendationCard({ result, visible }) {
  const cardRef = useRef(null);
  const cropMeta = CROP_META[result.predicted_crop] || { icon: '🌱', color: 'bg-gray-100 text-gray-800', season: 'N/A', water: 'N/A', market: 'N/A' };

  useEffect(() => {
    if (visible && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [visible]);

  if (!visible) return null;

  const top3 = Object.entries(result.all_probabilities || {}).slice(0, 3);

  return (
    <div ref={cardRef} className="py-16 bg-agri-50/50 animate-fade-in">
      <div className="max-w-5xl mx-auto section-padding">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-agri-100 text-agri-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <CheckCircle2 className="w-4 h-4" />
            AI Analysis Complete
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900">
            Your Recommendation
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Crop Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-agri-100 overflow-hidden">
            <div className="bg-[radial-gradient(ellipse_at_top_right,_#166534_0%,_#14532d_100%)] p-6 text-white">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{cropMeta.icon}</span>
                <div>
                  <div className="text-agri-200 text-sm font-medium uppercase tracking-wider mb-1">
                    Top Recommended Crop
                  </div>
                  <h3 className="font-display text-4xl font-bold">{result.predicted_crop}</h3>
                </div>
                <div className="ml-auto">
                  <ConfidenceGauge percentage={result.confidence_percentage} />
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Quick meta tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cropMeta.color}`}>
                  Season: {cropMeta.season}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                  Water: {cropMeta.water}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                  Market: {cropMeta.market}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  result.confidence_percentage >= 90 ? 'bg-agri-100 text-agri-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  Confidence: {result.confidence_percentage}%
                </span>
              </div>

              {/* Advisory */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1.5 flex items-center gap-2">
                      Smart Agronomy Advisory
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                    </h4>
                    <p className="text-amber-800/80 text-sm leading-relaxed">
                      {result.advisory}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Top 3 + Conditions */}
          <div className="space-y-6">
            {/* Top 3 Crops */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-agri-600" />
                Top Matches
              </h4>
              <div className="space-y-3">
                {top3.map(([crop, conf], idx) => (
                  <div key={crop} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-agri-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="flex-1 font-medium text-sm text-gray-700">{crop}</span>
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${idx === 0 ? 'bg-agri-500' : 'bg-gray-300'}`}
                        style={{ width: `${conf}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 w-12 text-right">{conf}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-earth-600" />
                Input Conditions
              </h4>
              <div className="space-y-3">
                <ConditionRow icon={Sprout} label="Nitrogen (N)" value={`${result.input_data?.N ?? '—'} ppm`} color="text-agri-600" />
                <ConditionRow icon={Sprout} label="Phosphorus (P)" value={`${result.input_data?.P ?? '—'} ppm`} color="text-agri-600" />
                <ConditionRow icon={Sprout} label="Potassium (K)" value={`${result.input_data?.K ?? '—'} ppm`} color="text-agri-600" />
                <ConditionRow icon={Droplets} label="Soil pH" value={`${result.input_data?.ph ?? '—'}`} color="text-earth-600" />
                <ConditionRow icon={Thermometer} label="Temperature" value={`${result.input_data?.temperature ?? '—'}°C`} color="text-red-500" />
                <ConditionRow icon={CloudRain} label="Humidity" value={`${result.input_data?.humidity ?? '—'}%`} color="text-sky-600" />
                <ConditionRow icon={CloudRain} label="Rainfall" value={`${result.input_data?.rainfall ?? '—'} mm`} color="text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConditionRow({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Icon className={`w-4 h-4 ${color}`} />
        {label}
      </div>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}
