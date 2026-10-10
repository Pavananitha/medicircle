# MediCircle Database Documentation

## 1. Entity-Relationship Model

```mermaid
erDiagram
    users ||--o{ medicines : owns
    users ||--o{ medication_logs : has
    users ||--o{ caregiver_connections : participates
    users ||--o{ connection_codes : generates
    users ||--o{ notifications : receives
    users ||--o{ notification_devices : registers
    medicines ||--o{ medicine_schedules : contains
    medicines ||--o{ medication_logs : logs
    medicine_schedules ||--o{ medication_logs : schedules

    users {
        uuid id PK
        varchar name
        varchar email UK
        varchar phone
        varchar password_hash
        varchar role
        date date_of_birth
        varchar gender
        varchar emergency_contact_name
        varchar emergency_contact_phone
        timestamptz created_at
        timestamptz updated_at
    }

    medicines {
        uuid id PK
        uuid patient_id FK
        varchar name
        varchar generic_name
        varchar dosage
        varchar dosage_unit
        varchar medicine_type
        text instructions
        date start_date
        date end_date
        text notes
        boolean is_active
        timestamptz created_at
    }

    medicine_schedules {
        uuid id PK
        uuid medicine_id FK
        time schedule_time
        varchar frequency_type
        varchar days_of_week
        boolean is_active
    }

    medication_logs {
        uuid id PK
        uuid patient_id FK
        uuid medicine_id FK
        uuid schedule_id FK
        date scheduled_date
        time scheduled_time
        timestamptz action_time
        varchar status
    }

    caregiver_connections {
        uuid id PK
        uuid patient_id FK
        uuid caregiver_id FK
        varchar status
        timestamptz requested_at
        timestamptz approved_at
        timestamptz removed_at
    }

    connection_codes {
        uuid id PK
        uuid patient_id FK
        varchar code UK
        timestamptz expires_at
        timestamptz used_at
        boolean is_active
    }
```

---

## 2. Table Specifications & Indexes

| Table | Primary Key | Critical Indexes | Key Constraints |
|---|---|---|---|
| `users` | `id` (UUID) | `idx_users_email` | `UNIQUE(email)`, `CHECK(role IN ('PATIENT', 'CAREGIVER'))` |
| `medicines` | `id` (UUID) | `idx_medicines_patient_id` | Foreign Key `patient_id -> users(id)` (CASCADE) |
| `medicine_schedules` | `id` (UUID) | `idx_medicine_schedules_medicine_id` | Foreign Key `medicine_id -> medicines(id)` (CASCADE) |
| `medication_logs` | `id` (UUID) | `idx_medication_logs_patient_id`, `idx_medication_logs_scheduled_date`, `idx_medication_logs_status` | `UNIQUE(patient_id, medicine_id, schedule_id, scheduled_date, scheduled_time)` |
| `caregiver_connections` | `id` (UUID) | `idx_caregiver_connections_patient_id`, `idx_caregiver_connections_caregiver_id` | `UNIQUE(patient_id, caregiver_id)`, `CHECK(patient_id <> caregiver_id)` |
| `connection_codes` | `id` (UUID) | `idx_connection_codes_code` | `UNIQUE(code)` |
| `notifications` | `id` (UUID) | `idx_notifications_user_id`, `idx_notifications_is_read` | `CHECK(type IN (...))` |
| `notification_devices` | `id` (UUID) | None | `UNIQUE(user_id, push_token)` |
