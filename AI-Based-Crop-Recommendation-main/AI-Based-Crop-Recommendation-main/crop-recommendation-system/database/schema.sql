-- ============================================================
-- AgriSmart AI - Crop Recommendation System Database Schema
-- Compatible with: PostgreSQL 14+, MySQL 8.0+, SQLite 3
-- ============================================================

-- Enable UUID extension (PostgreSQL only; comment out for MySQL/SQLite)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. FARMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS farmers (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(120) UNIQUE NOT NULL,
    phone       VARCHAR(20),
    farm_location VARCHAR(200),
    farm_size   DECIMAL(10, 2),          -- in acres
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. SOIL TESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS soil_tests (
    id          SERIAL PRIMARY KEY,
    farmer_id   INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    n_value     DECIMAL(8, 2) NOT NULL,   -- Nitrogen (ppm)
    p_value     DECIMAL(8, 2) NOT NULL,   -- Phosphorus (ppm)
    k_value     DECIMAL(8, 2) NOT NULL,   -- Potassium (ppm)
    ph_value    DECIMAL(4, 2) NOT NULL,   -- pH level
    testing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. RECOMMENDATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendations (
    id                  SERIAL PRIMARY KEY,
    farmer_id           INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    predicted_crop      VARCHAR(50) NOT NULL,
    confidence_percentage DECIMAL(5, 2) NOT NULL,
    temp                DECIMAL(5, 2),      -- Temperature (°C)
    humidity            DECIMAL(5, 2),      -- Humidity (%)
    rainfall            DECIMAL(8, 2),      -- Rainfall (mm)
    advisory_notes      TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_soil_tests_farmer_id ON soil_tests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_farmer_id ON recommendations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_crop ON recommendations(predicted_crop);
CREATE INDEX IF NOT EXISTS idx_recommendations_created ON recommendations(created_at);
