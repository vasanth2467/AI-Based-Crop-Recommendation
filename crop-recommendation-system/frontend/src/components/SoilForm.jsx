import { useState } from 'react';
import { FlaskConical, RotateCcw, Loader2, Wheat, Droplets, Thermometer, CloudRain } from 'lucide-react';

const SAMPLE_PRESETS = [
  {
    name: 'Rice Farm (Pune)',
    data: { farmer_id: 1, N: 85, P: 42, K: 38, ph: 6.2, temperature: 26.5, humidity: 78, rainfall: 220 },
  },
  {
    name: 'Coffee Estate (Coorg)',
    data: { farmer_id: 2, N: 60, P: 35, K: 55, ph: 5.6, temperature: 22, humidity: 72, rainfall: 180 },
  },
  {
    name: 'Cotton Field (Gujarat)',
    data: { farmer_id: 3, N: 120, P: 50, K: 55, ph: 7.0, temperature: 32, humidity: 48, rainfall: 75 },
  },
];

export default function SoilForm({ onPredict, loading }) {
  const [form, setForm] = useState({
    farmer_id: 1, N: '', P: '', K: '', ph: '', temperature: '', humidity: '', rainfall: '',
  });
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const loadSample = (preset) => {
    setForm(preset.data);
    setErrors({});
  };

  const resetForm = () => {
    setForm({ farmer_id: 1, N: '', P: '', K: '', ph: '', temperature: '', humidity: '', rainfall: '' });
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!form.farmer_id || form.farmer_id < 1) e.farmer_id = 'Select a valid farmer ID';
    if (form.N === '' || form.N < 0 || form.N > 200) e.N = 'Enter N between 0-200';
    if (form.P === '' || form.P < 0 || form.P > 150) e.P = 'Enter P between 0-150';
    if (form.K === '' || form.K < 0 || form.K > 150) e.K = 'Enter K between 0-150';
    if (form.ph === '' || form.ph < 4 || form.ph > 9) e.ph = 'Enter pH between 4-9';
    if (form.temperature === '' || form.temperature < 0 || form.temperature > 60) e.temperature = 'Enter 0-60°C';
    if (form.humidity === '' || form.humidity < 0 || form.humidity > 100) e.humidity = 'Enter 0-100%';
    if (form.rainfall === '' || form.rainfall < 0) e.rainfall = 'Enter rainfall ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onPredict({
      farmer_id: Number(form.farmer_id),
      N: Number(form.N),
      P: Number(form.P),
      K: Number(form.K),
      ph: Number(form.ph),
      temperature: Number(form.temperature),
      humidity: Number(form.humidity),
      rainfall: Number(form.rainfall),
    });
  };

  const inputGroups = [
    {
      title: 'Soil Nutrients (NPK)',
      icon: FlaskConical,
      color: 'text-agri-700',
      bg: 'bg-agri-50',
      fields: [
        { key: 'N', label: 'Nitrogen (N)', unit: 'ppm', min: 0, max: 200, step: 1, icon: 'N' },
        { key: 'P', label: 'Phosphorus (P)', unit: 'ppm', min: 0, max: 150, step: 1, icon: 'P' },
        { key: 'K', label: 'Potassium (K)', unit: 'ppm', min: 0, max: 150, step: 1, icon: 'K' },
      ],
    },
    {
      title: 'Soil & Weather',
      icon: Thermometer,
      color: 'text-earth-700',
      bg: 'bg-earth-50',
      fields: [
        { key: 'ph', label: 'Soil pH', unit: 'pH', min: 4, max: 9, step: 0.1, icon: 'pH' },
        { key: 'temperature', label: 'Temperature', unit: '°C', min: 0, max: 60, step: 0.5, icon: '°C' },
        { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, step: 1, icon: '%' },
        { key: 'rainfall', label: 'Rainfall', unit: 'mm', min: 0, max: 1000, step: 1, icon: 'mm' },
      ],
    },
  ];

  return (
    <section id="predict" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto section-padding">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-agri-100 text-agri-800 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <FlaskConical className="w-4 h-4" />
            AI Soil & Weather Analysis
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Enter Your Farm Data
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Input soil nutrient levels and weather parameters to get an AI-powered crop recommendation.
          </p>
        </div>

        {/* Sample Presets */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <span className="text-sm text-gray-400 py-2">Quick Load:</span>
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadSample(preset)}
              className="px-4 py-2 bg-agri-50 hover:bg-agri-100 text-agri-700 text-sm font-medium rounded-lg border border-agri-200 transition-colors"
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-500 text-sm font-medium rounded-lg border border-gray-200 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {inputGroups.map((group) => (
              <div key={group.title} className="bg-gray-50/70 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className={`w-9 h-9 ${group.bg} rounded-lg flex items-center justify-center`}>
                    <group.icon className={`w-5 h-5 ${group.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-800">{group.title}</h3>
                </div>

                <div className="space-y-4">
                  {group.fields.map((field) => (
                    <div key={field.key}>
                      <label className="flex items-center justify-between text-sm font-medium text-gray-600 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-6 h-6 rounded-md ${group.bg} ${group.color} text-xs font-bold flex items-center justify-center`}>
                            {field.icon}
                          </span>
                          {field.label}
                        </span>
                        <span className="text-gray-400 text-xs">{field.unit}</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={form[field.key]}
                          onChange={(e) => updateField(field.key, e.target.value)}
                          placeholder={`${field.min} - ${field.max}`}
                          className={`input-field ${errors[field.key] ? 'border-red-300 focus:ring-red-200' : ''}`}
                        />
                        {errors[field.key] && (
                          <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Farmer ID */}
          <div className="max-w-xs mx-auto">
            <label className="block text-sm font-medium text-gray-600 mb-1.5 text-center">
              Farmer ID
            </label>
            <input
              type="number"
              min={1}
              value={form.farmer_id}
              onChange={(e) => updateField('farmer_id', e.target.value)}
              className={`input-field text-center ${errors.farmer_id ? 'border-red-300' : ''}`}
            />
            {errors.farmer_id && (
              <p className="text-red-500 text-xs mt-1 text-center">{errors.farmer_id}</p>
            )}
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-base px-10 py-4 inline-flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Wheat className="w-5 h-5" />
                  Get Crop Recommendation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
