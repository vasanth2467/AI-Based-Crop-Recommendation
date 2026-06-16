-- ============================================================
-- AgriSmart AI — Seed Data for Development & Testing
-- ============================================================

-- Clear existing data (careful in production!)
-- TRUNCATE TABLE recommendations, soil_tests, farmers RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------
-- FARMERS
-- ---------------------------------------------------------------
INSERT INTO farmers (name, email, phone, farm_location, farm_size) VALUES
('Rajesh Kumar', 'rajesh.kumar@farmmail.in', '+91-9876543210', 'Pune, Maharashtra', 12.50),
('Sunita Devi', 'sunita.devi@farmmail.in', '+91-9876543211', 'Coimbatore, Tamil Nadu', 8.00),
('Mohammed Ali', 'm.ali@farmmail.in', '+91-9876543212', 'Mysore, Karnataka', 25.00),
('Priya Nair', 'priya.nair@farmmail.in', '+91-9876543213', 'Kochi, Kerala', 5.50),
('Gurpreet Singh', 'gurpreet@farmmail.in', '+91-9876543214', 'Ludhiana, Punjab', 18.00),
('Anita Sharma', 'anita.sharma@farmmail.in', '+91-9876543215', 'Jaipur, Rajasthan', 10.00),
('Chen Wei', 'chen.wei@farmmail.in', '+91-9876543216', 'Shillong, Meghalaya', 15.00),
('Lakshmi Rao', 'lakshmi.rao@farmmail.in', '+91-9876543217', 'Nashik, Maharashtra', 7.25);

-- ---------------------------------------------------------------
-- SOIL TESTS
-- ---------------------------------------------------------------
INSERT INTO soil_tests (farmer_id, n_value, p_value, k_value, ph_value) VALUES
(1, 85.50, 42.00, 38.50, 6.20),
(1, 90.00, 45.00, 40.00, 6.50),
(2, 55.00, 28.00, 48.00, 5.80),
(3, 110.00, 55.00, 60.00, 6.80),
(4, 65.00, 30.00, 55.00, 5.50),
(5, 130.00, 60.00, 65.00, 7.00),
(6, 35.00, 22.00, 25.00, 7.50),
(7, 75.00, 35.00, 50.00, 5.20),
(8, 95.00, 48.00, 45.00, 6.00);

-- ---------------------------------------------------------------
-- RECOMMENDATIONS (sample past predictions)
-- ---------------------------------------------------------------
INSERT INTO recommendations (farmer_id, predicted_crop, confidence_percentage, temp, humidity, rainfall, advisory_notes) VALUES
(1, 'Rice', 94.20, 26.50, 78.00, 220.00, 'Apply urea in split doses. Maintain 2-3 cm standing water. Monitor for blast disease.'),
(1, 'Wheat', 89.50, 18.00, 58.00, 85.00, 'Use HD-2967 variety. Apply DAP at sowing. Ensure timely irrigation at crown root stage.'),
(2, 'Coffee', 91.80, 22.00, 72.00, 180.00, 'Apply lime to raise pH to 6.0. Use shade nets. Monitor for leaf rust. Arabica is recommended.'),
(3, 'Sugarcane', 93.50, 30.00, 68.00, 200.00, 'Use Co-0238 variety. Apply FYM 10 tons/acre. Maintain adequate moisture during grand growth.'),
(4, 'Rubber', 88.00, 27.00, 82.00, 280.00, 'Use RRII-105 clone. Apply NPK 12:6:6. Ensure proper drainage. Intercrop with legumes initially.'),
(5, 'Wheat', 92.10, 16.00, 55.00, 70.00, 'Timely sowing by Nov 15. Use PBW-550 variety. Spray 2,4-D for broadleaf weed control.'),
(6, 'Mungbean', 87.50, 32.00, 55.00, 75.00, 'Use SML-668 variety. Rhizobium inoculation recommended. Harvest at 80% pod maturity.'),
(7, 'Tea', 90.00, 20.00, 80.00, 300.00, 'Use TV-23 clone. Maintain pH 4.5-5.5. Apply zinc sulfate if deficiency observed.'),
(8, 'Cotton', 85.50, 28.00, 60.00, 95.00, 'Use Bt cotton hybrid. Monitor for bollworm. Apply potassium nitrate during flowering.');
