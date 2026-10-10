# MediCircle REST API Specification

Base URL: `http://localhost:5000/api`

## Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new Patient or Caregiver |
| `POST` | `/auth/login` | Public | Login and receive a JWT token |
| `POST` | `/auth/logout` | Authenticated | Logout user session |
| `GET` | `/auth/me` | Authenticated | Fetch current authenticated user |
| `POST` | `/auth/forgot-password` | Public | Send password reset instructions |

---

## Profile (`/api/profile`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/profile` | Authenticated | Get current user profile |
| `PUT` | `/profile` | Authenticated | Update name, phone, emergency contact |

---

## Medicines (`/api/medicines`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/medicines` | Patient Only | List all patient medicines with schedules |
| `POST` | `/medicines` | Patient Only | Create medicine and initial schedules |
| `GET` | `/medicines/:id` | Patient Only | Get medicine details |
| `PUT` | `/medicines/:id` | Patient Only | Update medicine |
| `DELETE` | `/medicines/:id` | Patient Only | Delete medicine & associated schedules |
| `GET` | `/medicines/:medicineId/schedules` | Patient Only | List schedules for medicine |
| `POST` | `/medicines/:medicineId/schedules` | Patient Only | Add schedule to medicine |

---

## Medication Logs (`/api/medication-logs`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/medication-logs` | Patient Only | Get all dose logs |
| `GET` | `/medication-logs/today` | Patient Only | Get today's scheduled doses |
| `GET` | `/medication-logs/history` | Patient Only | Get dose history (query `?days=30`) |
| `POST` | `/medication-logs/:id/taken` | Patient Only | Mark dose status as TAKEN |
| `POST` | `/medication-logs/:id/skipped` | Patient Only | Mark dose status as SKIPPED |

---

## Caregiver Management (`/api/caregiver`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/caregiver/code` | Patient Only | Generate temporary 5-char code (e.g. `MC-8F4K2`) |
| `GET` | `/caregiver/connections` | Authenticated | List all caregiver connections |
| `POST` | `/caregiver/connect` | Caregiver Only | Submit connection request using code |
| `POST` | `/caregiver/connections/:id/approve` | Patient Only | Approve pending connection request |
| `POST` | `/caregiver/connections/:id/reject` | Patient Only | Reject connection request |
| `DELETE` | `/caregiver/connections/:id` | Authenticated | Sever active connection |
| `GET` | `/caregiver/patients` | Caregiver Only | List connected patients with ACTIVE status |
| `GET` | `/caregiver/patients/:patientId` | Caregiver Only | View patient details (ACTIVE only) |
| `GET` | `/caregiver/patients/:patientId/medications` | Caregiver Only | View patient medicines (Read-only) |
| `GET` | `/caregiver/patients/:patientId/history` | Caregiver Only | View patient medication logs |
| `GET` | `/caregiver/patients/:patientId/adherence` | Caregiver Only | View patient adherence percentage |

---

## Adherence (`/api/adherence`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/adherence/today` | Patient Only | Today's adherence statistics |
| `GET` | `/adherence/weekly` | Patient Only | 7-day adherence statistics |
| `GET` | `/adherence/monthly` | Patient Only | 30-day adherence statistics |

---

## Notifications (`/api`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notifications` | Authenticated | List recent notifications (max 50) |
| `PUT` | `/notifications/:id/read` | Authenticated | Mark notification as read |
| `POST` | `/devices/register` | Authenticated | Register device push notification token |
