import { useEffect, useState } from 'react';

export default function ConfidenceGauge({ percentage }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  const getColor = (v) => {
    if (v >= 90) return '#16a34a'; // agri-600
    if (v >= 75) return '#0ea5e9'; // sky-500
    if (v >= 60) return '#f59e0b'; // warning
    return '#ef4444'; // danger
  };

  const color = getColor(percentage);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Progress arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">{percentage}%</span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">Confidence</span>
        </div>
      </div>

      {/* Label */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-gray-600">
          {percentage >= 90
            ? 'Highly Confident'
            : percentage >= 75
            ? 'Confident'
            : percentage >= 60
            ? 'Moderate'
            : 'Review Inputs'}
        </span>
      </div>
    </div>
  );
}
