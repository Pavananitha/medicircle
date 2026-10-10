# MediCircle Database Setup Guide

This guide provides step-by-step instructions for installing PostgreSQL, creating the `medicircle` database, applying schemas, executing seeds, and verifying table structures.

---

## 1. PostgreSQL Installation

### macOS
Using Homebrew:
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Windows
1. Download the PostgreSQL installer from [PostgreSQL Official Downloads](https://www.postgresql.org/download/windows/).
2. Run the installer and include **Command Line Tools** and **pgAdmin 4**.
3. Set a superuser password for the `postgres` user (e.g., `postgres`).
4. Ensure the PostgreSQL service is running from the Windows Services console.

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 2. Connect to PostgreSQL

Open your terminal or command prompt:

```bash
psql -U postgres
```

If prompted, enter your PostgreSQL superuser password.

---

## 3. Create Database & Extensions

In the `psql` console, run:

```sql
CREATE DATABASE medicircle;
```

Switch to the `medicircle` database:

```sql
\c medicircle
```

Enable the UUID cryptographic extension:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

## 4. Run Schema & Seed SQL Scripts

From your project root or `database/` folder:

### Option A: Using `psql` command line
```bash
# Apply schema
psql -U postgres -d medicircle -f database/02_schema.sql

# Insert seed data
psql -U postgres -d medicircle -f database/03_seed.sql
```

### Option B: Inside the `psql` interactive prompt
```sql
\c medicircle
\i database/02_schema.sql
\i database/03_seed.sql
```

---

## 5. Verify Tables

In `psql`, list all public tables:

```sql
\dt
```

### Expected Output:
| Schema | Name | Type | Owner |
|---|---|---|---|
| public | caregiver_connections | table | postgres |
| public | connection_codes | table | postgres |
| public | medication_logs | table | postgres |
| public | medicine_schedules | table | postgres |
| public | medicines | table | postgres |
| public | notification_devices | table | postgres |
| public | notifications | table | postgres |
| public | users | table | postgres |

Total: **8 core tables**.

---

## 6. Inspecting via pgAdmin 4

1. Launch **pgAdmin 4**.
2. Connect to your local server under **Servers > PostgreSQL**.
3. Expand **Databases > medicircle > Schemas > public > Tables**.
4. Right-click on any table (e.g. `users`, `medicines`, `medication_logs`) and select **View/Edit Data > All Rows**.

---

## 7. Development Login Credentials

> [!IMPORTANT]
> The database stores **only salted bcrypt password hashes**. Plaintext passwords are NEVER stored in PostgreSQL or returned via API responses.
>
> For local development and testing, use the following credentials:

| User Type | Name | Email | Password | Role |
|---|---|---|---|---|
| **Patient 1** | Ravi Kumar | `patient1@example.com` | `Medi@123` | `PATIENT` |
| **Patient 2** | Priya Sharma | `patient2@example.com` | `Medi@123` | `PATIENT` |
| **Caregiver 1** | Suresh Kumar | `caregiver1@example.com` | `Medi@123` | `CAREGIVER` |
| **Caregiver 2** | Anita Patel | `caregiver2@example.com` | `Medi@123` | `CAREGIVER` |

The bcrypt hash corresponding to `Medi@123` is:
`$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW`
(Generated using `bcrypt.hash('Medi@123', 10)`).

---

## 8. Prisma ORM Synchronization

When working with the backend, Prisma is configured to map directly to this schema:

```bash
cd server
npx prisma generate
npx prisma db push # or npx prisma migrate dev
```
