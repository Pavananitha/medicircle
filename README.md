# MediCircle – Smart Medicine Reminder and Caregiver Management System

MediCircle is a full-stack mobile healthcare platform designed for Smartphone Computing. Step 1 establishes a clean monorepo architecture and delivers an end-to-end working authentication foundation connecting an Expo React Native mobile client to a Node.js + Express + TypeScript backend.

---

## 📋 1. Project Overview (Step 1 Foundation)

In Step 1, the following core architecture is implemented:
- **Monorepo Structure**: Separate `mobile/` and `server/` packages configured with TypeScript.
- **Expo React Native Mobile Client**: File-based routing with Expo Router, React Hook Form, and Zod client-side validation.
- **Secure Storage**: JWT access token persistence using `expo-secure-store` with safe local fallbacks.
- **Node.js + Express Backend**: Layered architecture (`Route -> Controller -> Service -> Repository`) with Zod request validation and bcrypt password verification.
- **Isolated Development Authentication**: Precomputed bcrypt hash development authentication without hardcoded plaintext passwords.
- **JWT Authentication Foundation**: Stateless JWT issuance (`1h` expiration) and reusable Express authentication middleware.
- **Role-Based Routing Foundation**: Prepares routing for `PATIENT` and `CAREGIVER` roles.
- **Patient Dashboard Placeholder**: Temporary post-login screen displaying welcome status and complete logout functionality.

> [!NOTE]
> Medical reminders, prescriptions, schedules, caregiver pairing, and push notifications will be introduced in subsequent development phases.

---

## ⚙️ 2. Requirements & 3. Node.js Version

- **Node.js**: `v20.x` or `v22.x` / `v23.x` (Tested on Node `v23.10.0`)
- **Package Manager**: `npm` (v9+)
- **Mobile Environment**:
  - Expo CLI (`npx expo`)
  - Expo Go mobile app (iOS App Store / Google Play Store) or
  - Android Studio Emulator (Android 10+) or
  - iOS Simulator (macOS Xcode)

---

## 📦 4. Installing Dependencies

Run `npm install` in each workspace:

```bash
# Workspace Root
npm install

# Backend Server
cd server
npm install

# Mobile Application
cd ../mobile
npm install
```

---

## 🔑 7. Environment Variables

### Backend Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
Default values:
```env
PORT=5000
JWT_SECRET=medicircle_dev_jwt_secret_key_2026
```

### Mobile Configuration (`mobile/.env`)
Copy `mobile/.env.example` to `mobile/.env`:
```bash
cp mobile/.env.example mobile/.env
```
For local simulator/desktop development:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```
For physical phone or Android emulator, see instructions below.

---

## 🚀 5. Starting the Backend

From the repository root:
```bash
cd server
npm run dev
```
The server will start at:
- **Base URL**: `http://localhost:5000` (or `http://127.0.0.1:5000`)
- **Health Check**: `GET http://localhost:5000/api/health`
- **Login API**: `POST http://localhost:5000/api/auth/login`

---

## 📱 6. Starting the Mobile App

From the repository root:
```bash
cd mobile
npx expo start
```
From the interactive Expo terminal menu:
- Press `a` to open on an Android emulator
- Press `i` to open on an iOS simulator
- Press `w` to open on Web browser
- Scan the displayed QR code with the **Expo Go** app on a physical device

---

## 👤 8. Development Login Credentials

For Step 1 verification, use the isolated development account:

| Field | Value |
|---|---|
| **Email** | `patient1@example.com` |
| **Password** | `Medi@123` |
| **Role** | `PATIENT` |

> [!IMPORTANT]
> The password is **never stored or checked in plaintext**. The backend verifies it against a salted bcrypt hash (`$2b$10$...`) using `bcrypt.compare()`.

---

## 📲 9. Testing on Android Emulator

1. Start your Android Emulator from Android Studio (AVD Manager).
2. Note that the Android emulator cannot reach your computer's `localhost` directly; it reaches the host loopback at `10.0.2.2`.
3. In `mobile/.env`, set:
   ```env
   EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
   ```
4. Start the mobile app:
   ```bash
   cd mobile
   npx expo start
   ```
5. Press `a` to install/launch the app inside the Android emulator.
6. Enter `patient1@example.com` and `Medi@123` to test the login.

---

## 📱 10. Testing on a Physical Android Phone

1. Ensure your physical phone and development computer are connected to the **same local Wi-Fi network**.
2. Find your computer's local network IP:
   - **macOS / Linux**: run `ifconfig` or `ipconfig getifaddr en0` (e.g. `192.168.1.100`)
   - **Windows**: run `ipconfig` (IPv4 Address)
3. In `mobile/.env`, point the API client to your LAN IP:
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5000/api
   # Example:
   # EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
   ```
4. In `server/.env`, ensure the backend binds to all interfaces:
   ```env
   HOST=0.0.0.0
   PORT=5000
   ```
5. Launch Expo:
   ```bash
   cd mobile
   npx expo start
   ```
6. Open **Expo Go** on your Android phone and scan the QR code.

---

## 🛠 11. Troubleshooting

### 1. `EADDRINUSE: address already in use :::5000` (macOS AirPlay Receiver)
- On macOS Monterey/Ventura/Sonoma/Sequoia, the macOS AirPlay Receiver service (`ControlCenter`) listens on port 5000 by default.
- **Solution A**: The backend automatically defaults `HOST=127.0.0.1` on macOS, which successfully avoids the wildcard AirPlay collision for local testing.
- **Solution B**: To free up port 5000 completely for LAN connections:
  - Open **System Settings** -> **General** -> **AirDrop & AirPlay**.
  - Turn off **AirPlay Receiver**.
- **Solution C**: Change `PORT=5001` in `server/.env` and update `EXPO_PUBLIC_API_URL` to port `5001`.

### 2. Mobile Shows: "Unable to connect to MediCircle server"
- Confirm the backend server is running: `curl http://localhost:5000/api/health`.
- For physical mobile devices, make sure `EXPO_PUBLIC_API_URL` is set to your computer's local IP (not `localhost`) and both devices are on the same Wi-Fi network.
- Check firewall settings on your computer to ensure incoming traffic on port 5000 is allowed.

### 3. Clear Cache
If Expo caches old environment variables:
```bash
cd mobile
npx expo start -c
```

---

## 🧪 Verification Commands

```bash
# 1. Verify Backend Build
cd server
npm run build

# 2. Verify Mobile TypeScript
cd ../mobile
npm run typecheck

# 3. Test Backend Health Check
curl -i http://localhost:5000/api/health

# 4. Test Valid Login
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@example.com","password":"Medi@123"}'

# 5. Test Invalid Password (Returns 401)
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@example.com","password":"wrong"}'
```
