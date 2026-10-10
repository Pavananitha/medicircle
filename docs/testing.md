# MediCircle Testing Documentation

## Test Categories & Scenarios

### 1. Authentication & Security
- **Registration**: Successfully creates patient and caregiver accounts with bcrypt hashed passwords.
- **Login & Password Verification**: Validates password hashes via `bcrypt.compare`.
- **JWT Verification**: Verifies tokens are signed with the configured secret and expire properly.
- **Security Invariants**: Verifies `password_hash` is never included in API responses or logs.

### 2. Medicine Ownership & Access Control
- **Medicine Creation**: Validates medicine creation with multiple schedule times.
- **Patient Isolation**: Patient A cannot view, update, or delete Patient B's medicines (`404` / `403`).
- **Role Isolation**: Caregivers cannot access `POST /api/medicines` (`403 Forbidden`).

### 3. Medication Logs & Adherence
- **Dose Actions**: Marking dose as `TAKEN` records `action_time`.
- **Dose Skipping**: Marking dose as `SKIPPED` records skip state.
- **Adherence Math**: `Taken doses / Total scheduled doses * 100`.

### 4. Missed Dose Detection & Caregiver Alerts
- **Grace Period**: Tests expired doses past 30 minutes moving to `MISSED`.
- **Notifications**: Connected caregivers automatically receive missed dose notices.

### 5. Caregiver Linkage Authorization
- **Code Validation**: Temporary code expiry and single-use enforcement.
- **Connection Isolation**: Caregiver cannot view patient records without `ACTIVE` connection status.
- **Self-Connection Prevention**: Cannot connect to one's own account.
