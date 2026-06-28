#!/usr/bin/env python3
"""
Agrismart AI — SQLAlchemy ORM Models
====================================
Maps the PostgreSQL/MySQL schema to Python objects with relationships.
"""

import os
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import (Column, DateTime, Float, ForeignKey, Integer, String,
                        Text, create_engine, event)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

# ---------------------------------------------------------------------------
# DATABASE CONNECTION
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/agrismart"
    # For SQLite (quick dev): "sqlite:///./agrismart.db"
    # For MySQL: "mysql+pymysql://user:pass@localhost:3306/agrismart"
)

# Connection pooling settings for production
engine_kwargs = {"echo": False, "future": True}
if "postgresql" in DATABASE_URL or "mysql" in DATABASE_URL:
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,  # Test connection before using
    })

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ---------------------------------------------------------------------------
# MODELS
# ---------------------------------------------------------------------------

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    phone = Column(String(20))
    farm_location = Column(String(200))
    farm_size = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    soil_tests = relationship("SoilTest", back_populates="farmer", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="farmer", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "farm_location": self.farm_location,
            "farm_size": self.farm_size,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SoilTest(Base):
    __tablename__ = "soil_tests"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False)
    n_value = Column(Float, nullable=False)
    p_value = Column(Float, nullable=False)
    k_value = Column(Float, nullable=False)
    ph_value = Column(Float, nullable=False)
    testing_date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="soil_tests")

    def to_dict(self):
        return {
            "id": self.id,
            "farmer_id": self.farmer_id,
            "n_value": self.n_value,
            "p_value": self.p_value,
            "k_value": self.k_value,
            "ph_value": self.ph_value,
            "testing_date": self.testing_date.isoformat() if self.testing_date else None,
        }


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False)
    predicted_crop = Column(String(50), nullable=False)
    confidence_percentage = Column(Float, nullable=False)
    temp = Column(Float)
    humidity = Column(Float)
    rainfall = Column(Float)
    advisory_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer = relationship("Farmer", back_populates="recommendations")

    def to_dict(self):
        return {
            "id": self.id,
            "farmer_id": self.farmer_id,
            "predicted_crop": self.predicted_crop,
            "confidence_percentage": self.confidence_percentage,
            "temp": self.temp,
            "humidity": self.humidity,
            "rainfall": self.rainfall,
            "advisory_notes": self.advisory_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# DEPENDENCY INJECTION HELPER
# ---------------------------------------------------------------------------

def get_db():
    """FastAPI dependency that yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# SEED DATA (for development / quick testing)
# ---------------------------------------------------------------------------

def seed_database():
    """Insert mock data if tables are empty. Safe to call multiple times."""
    db = SessionLocal()
    try:
        if db.query(Farmer).first() is not None:
            print("[DB] Seed data already present, skipping.")
            return

        print("[DB] Seeding database with mock data ...")

        farmers_data = [
            Farmer(name="Rajesh Kumar", email="rajesh.kumar@farmmail.in", phone="+91-9876543210", farm_location="Pune, Maharashtra", farm_size=12.50),
            Farmer(name="Sunita Devi", email="sunita.devi@farmmail.in", phone="+91-9876543211", farm_location="Coimbatore, Tamil Nadu", farm_size=8.00),
            Farmer(name="Mohammed Ali", email="m.ali@farmmail.in", phone="+91-9876543212", farm_location="Mysore, Karnataka", farm_size=25.00),
            Farmer(name="Priya Nair", email="priya.nair@farmmail.in", phone="+91-9876543213", farm_location="Kochi, Kerala", farm_size=5.50),
            Farmer(name="Gurpreet Singh", email="gurpreet@farmmail.in", phone="+91-9876543214", farm_location="Ludhiana, Punjab", farm_size=18.00),
            Farmer(name="Anita Sharma", email="anita.sharma@farmmail.in", phone="+91-9876543215", farm_location="Jaipur, Rajasthan", farm_size=10.00),
            Farmer(name="Chen Wei", email="chen.wei@farmmail.in", phone="+91-9876543216", farm_location="Shillong, Meghalaya", farm_size=15.00),
            Farmer(name="Lakshmi Rao", email="lakshmi.rao@farmmail.in", phone="+91-9876543217", farm_location="Nashik, Maharashtra", farm_size=7.25),
        ]
        db.add_all(farmers_data)
        db.flush()

        soil_tests_data = [
            SoilTest(farmer_id=farmers_data[0].id, n_value=85.50, p_value=42.00, k_value=38.50, ph_value=6.20),
            SoilTest(farmer_id=farmers_data[0].id, n_value=90.00, p_value=45.00, k_value=40.00, ph_value=6.50),
            SoilTest(farmer_id=farmers_data[1].id, n_value=55.00, p_value=28.00, k_value=48.00, ph_value=5.80),
            SoilTest(farmer_id=farmers_data[2].id, n_value=110.00, p_value=55.00, k_value=60.00, ph_value=6.80),
            SoilTest(farmer_id=farmers_data[3].id, n_value=65.00, p_value=30.00, k_value=55.00, ph_value=5.50),
            SoilTest(farmer_id=farmers_data[4].id, n_value=130.00, p_value=60.00, k_value=65.00, ph_value=7.00),
            SoilTest(farmer_id=farmers_data[5].id, n_value=35.00, p_value=22.00, k_value=25.00, ph_value=7.50),
            SoilTest(farmer_id=farmers_data[6].id, n_value=75.00, p_value=35.00, k_value=50.00, ph_value=5.20),
            SoilTest(farmer_id=farmers_data[7].id, n_value=95.00, p_value=48.00, k_value=45.00, ph_value=6.00),
        ]
        db.add_all(soil_tests_data)

        recommendations_data = [
            Recommendation(farmer_id=farmers_data[0].id, predicted_crop="Rice", confidence_percentage=94.20, temp=26.50, humidity=78.00, rainfall=220.00, advisory_notes="Apply urea in split doses. Maintain 2-3 cm standing water. Monitor for blast disease."),
            Recommendation(farmer_id=farmers_data[0].id, predicted_crop="Wheat", confidence_percentage=89.50, temp=18.00, humidity=58.00, rainfall=85.00, advisory_notes="Use HD-2967 variety. Apply DAP at sowing. Ensure timely irrigation at crown root stage."),
            Recommendation(farmer_id=farmers_data[1].id, predicted_crop="Coffee", confidence_percentage=91.80, temp=22.00, humidity=72.00, rainfall=180.00, advisory_notes="Apply lime to raise pH to 6.0. Use shade nets. Monitor for leaf rust. Arabica is recommended."),
            Recommendation(farmer_id=farmers_data[2].id, predicted_crop="Sugarcane", confidence_percentage=93.50, temp=30.00, humidity=68.00, rainfall=200.00, advisory_notes="Use Co-0238 variety. Apply FYM 10 tons/acre. Maintain adequate moisture during grand growth."),
            Recommendation(farmer_id=farmers_data[3].id, predicted_crop="Rubber", confidence_percentage=88.00, temp=27.00, humidity=82.00, rainfall=280.00, advisory_notes="Use RRII-105 clone. Apply NPK 12:6:6. Ensure proper drainage. Intercrop with legumes initially."),
            Recommendation(farmer_id=farmers_data[4].id, predicted_crop="Wheat", confidence_percentage=92.10, temp=16.00, humidity=55.00, rainfall=70.00, advisory_notes="Timely sowing by Nov 15. Use PBW-550 variety. Spray 2,4-D for broadleaf weed control."),
            Recommendation(farmer_id=farmers_data[5].id, predicted_crop="Mungbean", confidence_percentage=87.50, temp=32.00, humidity=55.00, rainfall=75.00, advisory_notes="Use SML-668 variety. Rhizobium inoculation recommended. Harvest at 80% pod maturity."),
            Recommendation(farmer_id=farmers_data[6].id, predicted_crop="Tea", confidence_percentage=90.00, temp=20.00, humidity=80.00, rainfall=300.00, advisory_notes="Use TV-23 clone. Maintain pH 4.5-5.5. Apply zinc sulfate if deficiency observed."),
            Recommendation(farmer_id=farmers_data[7].id, predicted_crop="Cotton", confidence_percentage=85.50, temp=28.00, humidity=60.00, rainfall=95.00, advisory_notes="Use Bt cotton hybrid. Monitor for bollworm. Apply potassium nitrate during flowering."),
        ]
        db.add_all(recommendations_data)
        db.commit()
        print("[DB] Seeded 8 farmers, 9 soil tests, 9 recommendations.")
    except Exception as e:
        db.rollback()
        print(f"[DB] Seed error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print("[*] Creating tables ...")
    Base.metadata.create_all(bind=engine)
    print("[+] Tables created.")
    seed_database()
