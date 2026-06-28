# AgriSmart AI — Crop Recommendation System

A **production-ready, full-stack AI application** that helps farmers make data-driven crop decisions. Built with a `scikit-learn` RandomForest classifier, `FastAPI` backend, `PostgreSQL` database, and a beautiful `React` + `Tailwind CSS` dashboard.

![Stack](https://img.shields.io/badge/ML-scikit--learn-green) ![Backend](https://img.shields.io/badge/API-FastAPI-teal) ![Frontend](https://img.shields.io/badge/UI-React%20+%20Tailwind-blue) ![Database](https://img.shields.io/badge/DB-PostgreSQL-blueviolet)

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  FastAPI Backend  │────▶│   PostgreSQL    │
│  (Tailwind CSS)  │     │  (REST API + ML)  │     │    Database     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │ crop_model.pkl │
                        │ RandomForest  │
                        │  (94%+ acc)   │
                        └──────────────┘
```

---

## Directory Structure

```
crop-recommendation-system/
├── backend/
│   ├── train_model.py      # ML pipeline: synthetic data → model artifact
│   ├── main.py             # FastAPI app with all REST endpoints
│   ├── models.py           # SQLAlchemy ORM models + DB helpers
│   ├── requirements.txt    # Python dependencies
│   └── crop_model.pkl      # Trained model artifact (generated)
├── database/
│   ├── schema.sql          # PostgreSQL/MySQL schema (3 core tables)
│   └── seed_data.sql       # Mock INSERT statements for testing
├── frontend/
│   ├── package.json        # React dependencies
│   ├── vite.config.js      # Vite configuration with proxy
│   ├── tailwind.config.js  # Custom color palette + animations
│   ├── postcss.config.js   # PostCSS with Tailwind + Autoprefixer
│   ├── index.html          # Entry HTML with fonts
│   └── src/
│       ├── main.jsx        # React app entry point
│       ├── index.css       # Tailwind directives + custom styles
│       ├── App.jsx         # Root component with state + API calls
│       └── components/
│           ├── Header.jsx              # Fixed nav with scroll effect
│           ├── HeroSection.jsx         # Animated hero with particle canvas
│           ├── SoilForm.jsx            # 7-field input form + presets
│           ├── RecommendationCard.jsx  # AI result with advisory
│           ├── ConfidenceGauge.jsx     # SVG circular confidence meter
│           ├── CropStats.jsx           # Recharts bar chart analytics
│           └── HistoryTable.jsx        # Collapsible recommendation table
└── README.md               # This file
```

---

## Features

### Machine Learning
- **12 crop classes**: Rice, Wheat, Maize, Coffee, Cotton, Mungbean, Tea, Rubber, Apple, Orange, Sugarcane, Lentil
- **7 input features**: Nitrogen (N), Phosphorus (P), Potassium (K), pH, Temperature, Humidity, Rainfall
- **94%+ test accuracy** with `RandomForestClassifier`
- Synthetic dataset with realistic agricultural ranges per crop
- Hyperparameter-tuned model saved as `crop_model.pkl` with scaler & label encoder

### Backend API (FastAPI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Submit soil + weather data, get AI crop recommendation |
| `GET` | `/api/farmers/{id}/history` | Fetch all past recommendations for a farmer |
| `GET` | `/api/crops/stats` | Get summary analytics of recommended crops |
| `GET` | `/health` | Service health check with model metadata |

### Frontend Dashboard
- **Animated hero section** with particle canvas and agricultural stats
- **Interactive soil form** with 3 sample presets (Rice, Coffee, Cotton farms)
- **Confidence gauge** — circular SVG animation showing prediction certainty
- **Smart agronomy advisory** — contextual tips based on soil conditions
- **Analytics dashboard** — Recharts bar chart of crop recommendations
- **History table** — expandable rows with full advisory notes
- **Fully responsive** — works on mobile, tablet, and desktop

### Database
- 3 normalized tables: `farmers`, `soil_tests`, `recommendations`
- Automatic seed data insertion for development
- Supports PostgreSQL, MySQL, and SQLite

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (or use SQLite for quick testing)

### 1. Clone & Enter Project
```bash
cd crop-recommendation-system
```

### 2. Backend Setup

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
cd backend
pip install -r requirements.txt

# (Optional) Re-train the ML model
python train_model.py
# Expected output: "Test Accuracy: ~94%" and crop_model.pkl generated

# Set database URL (uses SQLite by default if not set)
# For PostgreSQL:
# export DATABASE_URL="postgresql://user:pass@localhost:5432/agrismart"
# For SQLite (dev):
# export DATABASE_URL="sqlite:///./agrismart.db"

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

Interactive API docs: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Start the React dev server
npm run dev
```

The dashboard will open at `http://localhost:5173`.

The Vite dev server proxies `/api` requests to the FastAPI backend automatically.

---

## API Usage Examples

### Predict Crop
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_id": 1,
    "N": 85, "P": 42, "K": 38,
    "ph": 6.2,
    "temperature": 26.5, "humidity": 78, "rainfall": 220
  }'
```

**Response:**
```json
{
  "success": true,
  "predicted_crop": "Rice",
  "confidence_percentage": 94.20,
  "all_probabilities": { "Rice": 94.2, "Coffee": 3.1, ... },
  "advisory": "Apply urea in split doses. Maintain 2-3 cm standing water...",
  "farmer_id": 1,
  "saved_recommendation_id": 10
}
```

### Get Farmer History
```bash
curl http://localhost:8000/api/farmers/1/history
```

### Get Crop Statistics
```bash
curl http://localhost:8000/api/crops/stats
```

---

## Database Schema

```sql
farmers
├── id (PK)
├── name, email, phone
├── farm_location, farm_size
└── created_at

soil_tests
├── id (PK)
├── farmer_id (FK)
├── n_value, p_value, k_value, ph_value
└── testing_date

recommendations
├── id (PK)
├── farmer_id (FK)
├── predicted_crop, confidence_percentage
├── temp, humidity, rainfall
├── advisory_notes
└── created_at
```

Run `database/schema.sql` to create tables, then `database/seed_data.sql` to insert test data. The FastAPI app auto-creates tables and seeds on first startup when using SQLite.

---

## Model Details

| Property | Value |
|----------|-------|
| Algorithm | RandomForestClassifier |
| Classes | 12 crops |
| Features | 7 (N, P, K, pH, Temperature, Humidity, Rainfall) |
| Training samples | 600 (synthetic, per-crop ranges) |
| Test split | 80/20 stratified |
| Accuracy | ~94% |
| Preprocessing | StandardScaler |
| Serialization | joblib (model + scaler + encoder) |

The synthetic dataset assigns realistic nutrient/weather ranges per crop based on agricultural research. Gaussian noise creates natural distribution overlap, making the classification task realistic.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./agrismart.db` | SQLAlchemy connection string |

Examples:
- PostgreSQL: `postgresql://user:password@localhost:5432/agrismart`
- MySQL: `mysql+pymysql://user:password@localhost:3306/agrismart`
- SQLite: `sqlite:///./agrismart.db`

---

## Screenshots

| Section | Description |
|---------|-------------|
| **Hero** | Full-screen gradient with animated particles and agricultural stats |
| **Soil Form** | 2-column grid with NPK + weather inputs and sample presets |
| **Result Card** | Crop recommendation with confidence gauge and advisory box |
| **Analytics** | Bar chart showing recommendation frequency by crop |
| **History** | Sortable table with expandable advisory notes |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| ML / Data | Python, scikit-learn, pandas, numpy, joblib |
| Backend | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| Database | PostgreSQL / MySQL / SQLite |
| Frontend | React 18, Vite, Tailwind CSS 3, Recharts, Lucide React |

---

## License

This project is built for educational and agricultural empowerment purposes.

---

*Built with precision for farmers. Powered by machine learning.*
