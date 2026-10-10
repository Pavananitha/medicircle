-- ==============================================================================
-- MediCircle Seed Data Script
-- Accounts: 2 Patients, 2 Caregivers
-- Password for all accounts: Medi@123
--
-- IMPORTANT:
-- The database stores only the bcrypt password hash.
-- The plaintext password is NOT stored in PostgreSQL.
-- ==============================================================================


-- ==============================================================================
-- 1. CLEAN UP EXISTING SEED DATA
-- ==============================================================================

TRUNCATE TABLE users CASCADE;


-- ==============================================================================
-- 2. INSERT USERS
-- ==============================================================================

-- Patient 1: Ravi Kumar
INSERT INTO users (
    id,
    name,
    email,
    phone,
    password_hash,
    role,
    date_of_birth,
    gender,
    emergency_contact_name,
    emergency_contact_phone,
    created_at,
    updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Ravi Kumar',
    'patient1@example.com',
    '+91-9876543210',
    '$2b$10$t6xxByVqA9zcDfgQkhz//uuWsfdfin09GYsbDinM.AShpFmRiSrMK',
    'PATIENT',
    '1985-06-15',
    'Male',
    'Suresh Kumar',
    '+91-9876543212',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);


-- Patient 2: Priya Sharma
INSERT INTO users (
    id,
    name,
    email,
    phone,
    password_hash,
    role,
    date_of_birth,
    gender,
    emergency_contact_name,
    emergency_contact_phone,
    created_at,
    updated_at
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Priya Sharma',
    'patient2@example.com',
    '+91-9876543211',
    '$2b$10$t6xxByVqA9zcDfgQkhz//uuWsfdfin09GYsbDinM.AShpFmRiSrMK',
    'PATIENT',
    '1992-11-20',
    'Female',
    'Anita Patel',
    '+91-9876543213',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);


-- Caregiver 1: Suresh Kumar
INSERT INTO users (
    id,
    name,
    email,
    phone,
    password_hash,
    role,
    date_of_birth,
    gender,
    emergency_contact_name,
    emergency_contact_phone,
    created_at,
    updated_at
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Suresh Kumar',
    'caregiver1@example.com',
    '+91-9876543212',
    '$2b$10$t6xxByVqA9zcDfgQkhz//uuWsfdfin09GYsbDinM.AShpFmRiSrMK',
    'CAREGIVER',
    '1980-04-10',
    'Male',
    'Ravi Kumar',
    '+91-9876543210',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);


-- Caregiver 2: Anita Patel
INSERT INTO users (
    id,
    name,
    email,
    phone,
    password_hash,
    role,
    date_of_birth,
    gender,
    emergency_contact_name,
    emergency_contact_phone,
    created_at,
    updated_at
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'Anita Patel',
    'caregiver2@example.com',
    '+91-9876543213',
    '$2b$10$t6xxByVqA9zcDfgQkhz//uuWsfdfin09GYsbDinM.AShpFmRiSrMK',
    'CAREGIVER',
    '1988-09-25',
    'Female',
    'Priya Sharma',
    '+91-9876543211',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);


-- ==============================================================================
-- 3. INSERT MEDICINES FOR PATIENT 1 - RAVI KUMAR
-- ==============================================================================

-- Medicine 1: Paracetamol
INSERT INTO medicines (
    id,
    patient_id,
    name,
    generic_name,
    dosage,
    dosage_unit,
    medicine_type,
    instructions,
    start_date,
    end_date,
    notes,
    is_active
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Paracetamol',
    'Acetaminophen',
    '500',
    'mg',
    'Tablet',
    'Take after meals with water',
    CURRENT_DATE - INTERVAL '14 days',
    CURRENT_DATE + INTERVAL '30 days',
    'Prescribed for mild fever and joint ache',
    true
);


-- Medicine 2: Vitamin D3
INSERT INTO medicines (
    id,
    patient_id,
    name,
    generic_name,
    dosage,
    dosage_unit,
    medicine_type,
    instructions,
    start_date,
    end_date,
    notes,
    is_active
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Vitamin D3',
    'Cholecalciferol',
    '1000',
    'IU',
    'Capsule',
    'Take in the morning with milk or food',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '60 days',
    'Daily supplement',
    true
);


-- Medicine 3: Metformin
INSERT INTO medicines (
    id,
    patient_id,
    name,
    generic_name,
    dosage,
    dosage_unit,
    medicine_type,
    instructions,
    start_date,
    end_date,
    notes,
    is_active
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'Metformin',
    'Metformin Hydrochloride',
    '500',
    'mg',
    'Tablet',
    'Take with dinner',
    CURRENT_DATE - INTERVAL '20 days',
    NULL,
    'Maintenance dose',
    true
);


-- ==============================================================================
-- 4. INSERT MEDICINE SCHEDULES
-- ==============================================================================

-- Paracetamol:
-- 08:00 AM
-- 02:00 PM
-- 08:00 PM

INSERT INTO medicine_schedules (
    id,
    medicine_id,
    schedule_time,
    frequency_type,
    days_of_week,
    is_active
) VALUES
(
    '51111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '08:00:00',
    'DAILY',
    'MON,TUE,WED,THU,FRI,SAT,SUN',
    true
),
(
    '51111111-1111-1111-1111-111111111112',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '14:00:00',
    'DAILY',
    'MON,TUE,WED,THU,FRI,SAT,SUN',
    true
),
(
    '51111111-1111-1111-1111-111111111113',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '20:00:00',
    'DAILY',
    'MON,TUE,WED,THU,FRI,SAT,SUN',
    true
);


-- Vitamin D3:
-- 09:00 AM

INSERT INTO medicine_schedules (
    id,
    medicine_id,
    schedule_time,
    frequency_type,
    days_of_week,
    is_active
) VALUES
(
    '52222222-2222-2222-2222-222222222221',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '09:00:00',
    'DAILY',
    'MON,TUE,WED,THU,FRI,SAT,SUN',
    true
);


-- Metformin:
-- 08:30 PM

INSERT INTO medicine_schedules (
    id,
    medicine_id,
    schedule_time,
    frequency_type,
    days_of_week,
    is_active
) VALUES
(
    '53333333-3333-3333-3333-333333333331',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '20:30:00',
    'DAILY',
    'MON,TUE,WED,THU,FRI,SAT,SUN',
    true
);


-- ==============================================================================
-- 5. INSERT MEDICATION LOGS FOR TODAY
-- ==============================================================================

INSERT INTO medication_logs (
    id,
    patient_id,
    medicine_id,
    schedule_id,
    scheduled_date,
    scheduled_time,
    action_time,
    status
) VALUES

-- Vitamin D3 - Taken
(
    '61111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '52222222-2222-2222-2222-222222222221',
    CURRENT_DATE,
    '09:00:00',
    CURRENT_TIMESTAMP - INTERVAL '11 hours',
    'TAKEN'
),

-- Paracetamol - 08:00 AM - Taken
(
    '61111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '51111111-1111-1111-1111-111111111111',
    CURRENT_DATE,
    '08:00:00',
    CURRENT_TIMESTAMP - INTERVAL '12 hours',
    'TAKEN'
),

-- Paracetamol - 02:00 PM - Missed
(
    '61111111-1111-1111-1111-111111111113',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '51111111-1111-1111-1111-111111111112',
    CURRENT_DATE,
    '14:00:00',
    NULL,
    'MISSED'
),

-- Paracetamol - 08:00 PM - Pending
(
    '61111111-1111-1111-1111-111111111114',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '51111111-1111-1111-1111-111111111113',
    CURRENT_DATE,
    '20:00:00',
    NULL,
    'PENDING'
),

-- Metformin - 08:30 PM - Pending
(
    '61111111-1111-1111-1111-111111111115',
    '11111111-1111-1111-1111-111111111111',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '53333333-3333-3333-3333-333333333331',
    CURRENT_DATE,
    '20:30:00',
    NULL,
    'PENDING'
);


-- ==============================================================================
-- 6. INSERT CAREGIVER CONNECTION
-- Ravi Kumar <-> Suresh Kumar
-- ==============================================================================

INSERT INTO caregiver_connections (
    id,
    patient_id,
    caregiver_id,
    status,
    requested_at,
    approved_at
) VALUES (
    '71111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'ACTIVE',
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    CURRENT_TIMESTAMP - INTERVAL '7 days'
);


-- ==============================================================================
-- 7. INSERT CONNECTION CODE
-- ==============================================================================

INSERT INTO connection_codes (
    id,
    patient_id,
    code,
    expires_at,
    is_active
) VALUES (
    '81111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'MC-8F4K2',
    CURRENT_TIMESTAMP + INTERVAL '24 hours',
    true
);


-- ==============================================================================
-- 8. INSERT NOTIFICATIONS
-- ==============================================================================

-- Patient medicine reminder
INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    related_entity_id,
    is_read,
    created_at
) VALUES (
    '91111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'MEDICINE_REMINDER',
    'Time to take your medication',
    'Time to take Paracetamol 500 mg (Scheduled at 08:00 PM).',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    false,
    CURRENT_TIMESTAMP
);


-- Caregiver missed-dose alert
INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    related_entity_id,
    is_read,
    created_at
) VALUES (
    '92222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    'MISSED_DOSE',
    'Missed Medication Alert',
    'Ravi Kumar missed: Paracetamol 500 mg Scheduled: 02:00 PM.',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    false,
    CURRENT_TIMESTAMP - INTERVAL '6 hours'
);


-- ==============================================================================
-- SEED DATA COMPLETE
-- ==============================================================================

-- Development login accounts:
--
-- Patient:
-- Email: patient1@example.com
-- Password: Medi@123
--
-- Patient:
-- Email: patient2@example.com
-- Password: Medi@123
--
-- Caregiver:
-- Email: caregiver1@example.com
-- Password: Medi@123
--
-- Caregiver:
-- Email: caregiver2@example.com
-- Password: Medi@123
--
-- IMPORTANT:
-- These passwords are development credentials only.
-- PostgreSQL stores only the bcrypt hash.
-- ============================================================================== 