import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Trophy, TrendingUp, Hash } from 'lucide-react';

const CROP_COLORS = {
  Rice: '#16a34a', Wheat: '#d97706', Maize: '#ca8a04', Coffee: '#92400e',
  Cotton: '#65a30d', Mungbean: '#84cc16', Tea: '#15803d', Rubber: '#0f766e',
  Apple: '#dc2626', Orange: '#f97316', Sugarcane: '#22c55e', Lentil: '#a16207',
};

export default function CropStats({ stats, loading }) {
  const chartData = useMemo(() => {
    if (!stats?.crop_breakdown) return [];
    return stats.crop_breakdown.map((item) => ({
      name: item.crop,
      count: item.count,
      avgConfidence: Math.round(item.avg_confidence),
      color: CROP_COLORS[item.crop] || '#6b7280',
    }));
  }, [stats]);

  const summaryCards = [
    {
      label: 'Total Recommendations',
      value: stats?.total_recommendations ?? 0,
      icon: Hash,
      color: 'text-agri-700',
      bg: 'bg-agri-50',
    },
    {
      label: 'Unique Crops',
      value: stats?.unique_crops ?? 0,
      icon: BarChart3,
      color: 'text-sky-700',
      bg: 'bg-sky-50',
    },
    {
      label: 'Top Crop',
      value: stats?.top_crop || 'N/A',
      icon: Trophy,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      label: 'Avg Confidence',
      value: chartData.length
        ? `${Math.round(chartData.reduce((s, d) => s + d.avgConfidence, 0) / chartData.length)}%`
        : '0%',
      icon: TrendingUp,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <section id="analytics" className="py-20 bg-gray-50/50">
      <div className="max-w-6xl mx-auto section-padding">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4" />
            Analytics Dashboard
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Crop Recommendation Insights
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Aggregate statistics showing which crops are most frequently recommended by the AI.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-agri-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 mt-3 text-sm">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{card.value}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-6">Recommendations by Crop</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                        formatter={(value, name) => [value, name === 'count' ? 'Count' : 'Avg Confidence']}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
