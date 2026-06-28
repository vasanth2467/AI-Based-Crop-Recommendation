#!/usr/bin/env python3
"""
Agrismart AI — FastAPI Backend
==============================
Production-ready REST API serving ML crop recommendations.

Endpoints:
    POST /api/predict          → Predict optimal crop from soil + weather data
    GET  /api/farmers/{id}/history → Past recommendations for a farmer
    GET  /api/crops/stats      → Aggregated crop recommendation analytics
    GET  /health               → Service health check

Run:
    uvicorn main:app --reload --port 8000
"""

import os
import pickle
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
import joblib
import numpy as np
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from models import (Farmer, Recommendation, SessionLocal, Base, engine, get_db,
                    seed_database)

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

# ---------------------------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------------------------
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://localhost:8000"
).split(",")

# Clean up origins (remove spaces)
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]

# ---------------------------------------------------------------------------
# LIFESPAN — Load ML model at startup
# ---------------------------------------------------------------------------

MODEL_ARTIFACT: Optional[dict] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global MODEL_ARTIFACT
    model_path = Path(__file__).parent / "crop_model.pkl"
    if not model_path.exists():
        raise RuntimeError(f"Model file not found: {model_path}. Run train_model.py first.")
    MODEL_ARTIFACT = joblib.load(model_path)
    print(f"[+] ML model loaded — accuracy: {MODEL_ARTIFACT['accuracy']:.2%}")
    print(f"    Classes: {list(MODEL_ARTIFACT['label_encoder'].classes_)}")

    # Create tables & seed if needed (SQLite auto-creates file)
    Base.metadata.create_all(bind=engine)
    seed_database()

    yield
    MODEL_ARTIFACT = None


app = FastAPI(
    title="AgriSmart AI API",
    description="AI-Based Crop Recommendation System for Farmers",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# PYDANTIC SCHEMAS
# ---------------------------------------------------------------------------

class CropPredictionRequest(BaseModel):
    farmer_id: int = Field(..., ge=1, description="Farmer ID")
    N: float = Field(..., ge=0, le=200, description="Nitrogen content (ppm)")
    P: float = Field(..., ge=0, le=150, description="Phosphorus content (ppm)")
    K: float = Field(..., ge=0, le=150, description="Potassium content (ppm)")
    ph: float = Field(..., ge=4.0, le=9.0, description="Soil pH level")
    temperature: float = Field(..., ge=0, le=60, description="Temperature (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity (%)")
    rainfall: float = Field(..., ge=0, le=1000, description="Rainfall (mm)")


class CropPredictionResponse(BaseModel):
    success: bool
    predicted_crop: str
    confidence_percentage: float
    all_probabilities: dict
    advisory: str
    farmer_id: int
    saved_recommendation_id: int


class RecommendationOut(BaseModel):
    id: int
    farmer_id: int
    predicted_crop: str
    confidence_percentage: float
    temp: Optional[float]
    humidity: Optional[float]
    rainfall: Optional[float]
    advisory_notes: Optional[str]
    created_at: str


class CropStatsItem(BaseModel):
    crop: str
    count: int
    avg_confidence: float


class FarmerHistoryResponse(BaseModel):
    farmer: dict
    recommendations: List[RecommendationOut]


class CropStatsResponse(BaseModel):
    total_recommendations: int
    unique_crops: int
    crop_breakdown: List[CropStatsItem]
    top_crop: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_accuracy: Optional[float]
    model_trained_at: Optional[str]


# ---------------------------------------------------------------------------
# ADVISORY GENERATOR
# ---------------------------------------------------------------------------

CROP_ADVISORY = {
    "Rice": "Apply urea in 2-3 split doses. Maintain 2-3 cm standing water during tillering. Monitor for blast & BPH. Market: Steady demand year-round.",
    "Wheat": "Use certified HD-2967 or PBW-550 seeds. Apply DAP at sowing. Timely irrigation at crown root & flowering stages. Market: MSP procurement available.",
    "Maize": "Apply FYM 8-10 tons/acre. Use DK-818 hybrid. Ensure balanced NPK. Monitor for stem borer & fall armyworm. Market: Growing poultry feed demand.",
    "Coffee": "Apply agricultural lime if pH < 5.5. Maintain 50% shade. Monitor for leaf rust & white stem borer. Arabica fetches premium prices.",
    "Cotton": "Use Bt cotton hybrid. Protect squares & bolls from bollworm. Apply potassium nitrate during peak flowering. Market: Monitor CCI price trends.",
    "Mungbean": "Use SML-668 variety. Rhizobium inoculation boosts N fixation. Harvest at 80% pod maturity. Market: High export demand to Middle East.",
    "Tea": "Maintain soil pH 4.5-5.5. Apply NPK 10:5:5 quarterly. Shade regulation & tipping essential. Monitor for red spider mite. Market: Auction prices stable.",
    "Rubber": "Use RRII-105 or PB-260 clone. Intercrop with legumes for 3 years. Apply NPK 12:6:6 biannually. Market: Check RSS-4 daily prices.",
    "Apple": "Apply boron & zinc sulfate pre-bloom. Use spindle bush training. Monitor for scab & woolly aphid. Market: Cold storage extends selling window.",
    "Orange": "Apply micronutrient spray (Fe, Zn, Mn). Use drip irrigation. Monitor for citrus canker & greening. Market: Processed juice demand rising.",
    "Sugarcane": "Use Co-0238 or Co-0118 variety. Apply FYM 10 tons + 175 kg N/acre. Ratoon management crucial. Market: Ethanol blending policy supports prices.",
    "Lentil": "Use IPL-316 variety. Rhizobium + PSB inoculation recommended. One irrigation at pod fill stage. Market: Strong export demand year-round.",
}


def generate_advisory(crop: str, n: float, p: float, k: float, ph: float) -> str:
    """Build a contextual advisory message for the predicted crop."""
    base = CROP_ADVISORY.get(crop, "Consult local KVK for region-specific guidance.")
    notes = []
    if ph < 5.5:
        notes.append(f"Soil pH {ph} is acidic — apply agricultural lime @ 200-400 kg/acre.")
    elif ph > 7.5:
        notes.append(f"Soil pH {ph} is alkaline — apply gypsum or organic compost.")
    if n < 30:
        notes.append("Nitrogen is very low — prioritize organic manure & legume intercropping.")
    if k < 25:
        notes.append("Potassium deficiency detected — apply MOP (muriate of potash).")
    if notes:
        base += " \u26a0 " + " ".join(notes)
    return base


# ---------------------------------------------------------------------------
# API ENDPOINTS
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    return HealthResponse(
        status="ok",
        model_loaded=MODEL_ARTIFACT is not None,
        model_accuracy=MODEL_ARTIFACT["accuracy"] if MODEL_ARTIFACT else None,
        model_trained_at=MODEL_ARTIFACT.get("trained_at") if MODEL_ARTIFACT else None,
    )


@app.post(
    "/api/predict",
    response_model=CropPredictionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Prediction"],
)
def predict_crop(payload: CropPredictionRequest, db: Session = Depends(get_db)):
    if MODEL_ARTIFACT is None:
        raise HTTPException(status_code=503, detail="ML model not loaded.")

    # Verify farmer exists
    farmer = db.query(Farmer).filter(Farmer.id == payload.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail=f"Farmer with id={payload.farmer_id} not found.")

    # Prepare input vector
    features = MODEL_ARTIFACT["features"]  # ['N','P','K','ph','temperature','humidity','rainfall']
    input_vector = np.array([
        [payload.N, payload.P, payload.K, payload.ph,
         payload.temperature, payload.humidity, payload.rainfall]
    ])
    scaled = MODEL_ARTIFACT["scaler"].transform(input_vector)

    # Predict
    le = MODEL_ARTIFACT["label_encoder"]
    model = MODEL_ARTIFACT["model"]
    pred_idx = model.predict(scaled)[0]
    proba = model.predict_proba(scaled)[0]
    predicted_crop = le.inverse_transform([pred_idx])[0]
    confidence = round(float(proba[pred_idx]) * 100, 2)

    # Build probability map
    all_probs = {
        le.inverse_transform([i])[0]: round(float(p) * 100, 2)
        for i, p in enumerate(proba)
    }
    all_probs = dict(sorted(all_probs.items(), key=lambda x: x[1], reverse=True))

    # Generate advisory
    advisory = generate_advisory(
        predicted_crop, payload.N, payload.P, payload.K, payload.ph
    )

    # Persist recommendation
    rec = Recommendation(
        farmer_id=payload.farmer_id,
        predicted_crop=predicted_crop,
        confidence_percentage=confidence,
        temp=payload.temperature,
        humidity=payload.humidity,
        rainfall=payload.rainfall,
        advisory_notes=advisory,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    return CropPredictionResponse(
        success=True,
        predicted_crop=predicted_crop,
        confidence_percentage=confidence,
        all_probabilities=all_probs,
        advisory=advisory,
        farmer_id=payload.farmer_id,
        saved_recommendation_id=rec.id,
    )


@app.get(
    "/api/farmers/{farmer_id}/history",
    response_model=FarmerHistoryResponse,
    tags=["Farmers"],
)
def get_farmer_history(farmer_id: int, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail=f"Farmer with id={farmer_id} not found.")

    recs = (
        db.query(Recommendation)
        .filter(Recommendation.farmer_id == farmer_id)
        .order_by(Recommendation.created_at.desc())
        .all()
    )

    return FarmerHistoryResponse(
        farmer=farmer.to_dict(),
        recommendations=[
            RecommendationOut(
                id=r.id,
                farmer_id=r.farmer_id,
                predicted_crop=r.predicted_crop,
                confidence_percentage=r.confidence_percentage,
                temp=r.temp,
                humidity=r.humidity,
                rainfall=r.rainfall,
                advisory_notes=r.advisory_notes,
                created_at=r.created_at.isoformat() if r.created_at else "",
            )
            for r in recs
        ],
    )


@app.get(
    "/api/crops/stats",
    response_model=CropStatsResponse,
    tags=["Analytics"],
)
def get_crop_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func

    total = db.query(Recommendation).count()
    if total == 0:
        return CropStatsResponse(
            total_recommendations=0, unique_crops=0, crop_breakdown=[], top_crop="N/A"
        )

    rows = (
        db.query(
            Recommendation.predicted_crop.label("crop"),
            func.count(Recommendation.id).label("cnt"),
            func.avg(Recommendation.confidence_percentage).label("avg_conf"),
        )
        .group_by(Recommendation.predicted_crop)
        .order_by(func.count(Recommendation.id).desc())
        .all()
    )

    breakdown = [
        CropStatsItem(crop=r.crop, count=r.cnt, avg_confidence=round(float(r.avg_conf or 0), 2))
        for r in rows
    ]

    return CropStatsResponse(
        total_recommendations=total,
        unique_crops=len(rows),
        crop_breakdown=breakdown,
        top_crop=breakdown[0].crop if breakdown else "N/A",
    )


# ---------------------------------------------------------------------------
# RUN
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
