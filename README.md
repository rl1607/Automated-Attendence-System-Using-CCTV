# Attendence Tracker 👁️
### Automated Attendance System Using Face Recognition Through CCTV

Attendence Tracker is a full-stack, enterprise-grade automated attendance management platform. It leverages Artificial Intelligence (Face Recognition) and live camera feeds (RTSP Streams / Webcams) to automatically mark student attendance in real time. 

The application is built with a decoupled microservice architecture containing a Node.js + Express backend, a React.js (Vite) + TypeScript frontend, and a Python FastAPI AI microservice for neural embeddings processing.

---

## 📸 Snapshot Management Strategy
The application stores and displays snapshots across three main lifecycle modules:
1. **Biometric Registration**: When onboarding a new student, the system triggers the webcam interface to capture clean, multi-angle face snapshots. These snapshots are processed into embeddings and stored to identify the user later.
2. **Attendance Sessions Logs**: When a student is verified on a CCTV feed, the system captures a real-time frame snapshot of their face, marking their record with timestamp, confidence %, and location.
3. **Unknown/Intruder Alerts**: If an unrecognized face is continuously visible in a camera stream, a snapshot of the person's face is automatically captured, logged, and broadcast to the dashboard alerts system.

---

## 🛠️ Technology Stack
* **Frontend**: React (Vite), TypeScript, Tailwind CSS, Recharts, Framer Motion, Axios, Socket.IO Client.
* **Backend**: Node.js, Express, TypeScript, JWT (Access/Refresh tokens), Mongoose (MongoDB), Socket.IO.
* **AI Service**: Python, FastAPI, OpenCV, NumPy, DeepFace (Facenet).

---

## 📂 Project Directory Structure

```
automated-attendance-system/
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection configurations
│   │   ├── controllers/        # Auth, Student, Camera, Attendance, Timetable controllers
│   │   ├── middleware/         # JWT parsing, Role-Based Access Control, Audit logging
│   │   ├── models/             # Mongoose schemas (User, Student, Academic, System collections)
│   │   ├── routes/             # Express API router definitions
│   │   └── app.ts              # Express & Socket.IO server entry point
│   ├── ai-service/             # Decoupled AI face matching microservice
│   │   ├── app/
│   │   │   └── main.py         # FastAPI code (blink check, continuous tracking, cosine match)
│   │   └── requirements.txt    # Python package dependencies
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/         # Master Layout shell, Navbar, Sidebar
    │   ├── context/            # Auth and WebSocket Socket.IO contexts
    │   ├── pages/              # Dashboard, UploadData, FaceRecognition, DataStore, Messages, Timetable, CCTV
    │   ├── config.ts           # Dynamic API base URL configs
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Local Deployment Setup

### 1. Database Configuration
Ensure a local instance of MongoDB is running, or set up a MongoDB Atlas cluster. Create a `.env` file under `backend/` and configure:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/automated_attendance
JWT_SECRET=super_secret_jwt_key_123_456_789
JWT_REFRESH_SECRET=super_secret_refresh_key_123_456_789
AI_SERVICE_URL=http://127.0.0.1:8000
NODE_ENV=development
```

### 2. Node.js Backend Server Setup
From the project root:
```bash
cd backend
npm install
npm run dev
```
*Note: The server will automatically seed a default Super Admin user on its first launch:*
- **Email**: `admin@attendance.com` (or simply type `admin` in the field)
- **Password**: `admin123`

### 3. Python AI Microservice Setup
From the project root:
```bash
cd backend/ai-service
python -m venv venv

# Activate Virtual Environment
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### 4. React Frontend Setup
From the project root:
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ✨ Features Checklist
- [x] **Secure JWT Authentication**: Role-Based access guards.
- [x] **Webcam Face Enrollment**: Captures profile picture signatures.
- [x] **Real-time Attendance marking**: Webhooks from FastAPI trigger WebSocket signals.
- [x] **CCTV Streams Grid**: Controls camera stream parameters.
- [x] **Data Store Logs**: Tabbed roster registries and log export features (CSV/Excel/PDF).
- [x] **Automatic Late Calculations**: Calculates statuses based on timetable logs.
