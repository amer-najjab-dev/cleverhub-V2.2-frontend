-- Insertar un registro de salud de prueba
INSERT INTO client_health_records (client_id, glucose_level, blood_pressure_systolic, blood_pressure_diastolic, weight, heart_rate, record_date, notes) 
VALUES (2, 1.15, 12, 8, 70.5, 85, '2024-01-15', 'Control regular');

-- Insertar una deuda de prueba
INSERT INTO client_debts (client_id, total_debt, paid_amount, status, notes)
VALUES (2, 150.00, 50.00, 'partial', 'Compra de medicamentos');

-- Actualizar último pedido del cliente
UPDATE clients SET last_purchase_date = NOW() WHERE id = 2;
