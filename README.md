# 🎓 ClassIQ — Smart & Secure Classroom Management Platform

![ClassIQ Banner](https://img.shields.io/badge/ClassIQ-Enterprise--Grade-6366f1?style=for-the-badge&logo=academic&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Express.js](https://img.shields.io/badge/Express.js-v4.19-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-v8.5-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

---

## 📌 Executive Summary

**ClassIQ** is an enterprise-grade classroom management and academic intelligence platform built for modern educational institutions. It unifies zero-trust dynamic QR attendance verification, GPS Haversine geofencing, real-time WebSocket communication, rubric-based assignment evaluation, automated quiz testing, and a native Google Gemini AI Academic Suite into a cohesive single-page application.

---

## ✨ Core Features & Highlights

### 🛡️ 1. Zero-Trust Dynamic Attendance System
- **Rotating HMAC-SHA256 QR Codes**: Server-generated QR codes rotating every 15 seconds over WebSockets to prevent proxy attendance and screenshot sharing.
- **GPS Haversine Geofencing**: Real-time geolocation distance verification enforcing physical presence within classroom boundaries.
- **Anti-Fraud Security**: Automated IP collision detection, shared device hardware fingerprinting, and speed/impossible-travel verification.
- **Auto-Absent Background Worker**: Automated background worker that marks non-attending enrolled students as `absent` upon session expiration.
- **CSV & PDF Reports**: Secure formula-injection-sanitized CSV exports and official academic PDF generation using `pdfkit`.

### 📚 2. Course & Classroom Management
- **Virtual Classrooms**: Teacher-managed courses with dynamic access code rotation, roster management, and join approval queues.
- **Interactive Stream**: Classroom-wide announcements, pinned posts, comments, and attachments.
- **Curriculum & Materials**: Organized study modules supporting PDFs, lecture notes, video links, bookmarks, and revision queues.

### 📝 3. Assignments & Adaptive Quizzes
- **Assignment Engine**: Multi-format file submissions, rubric-based evaluation, deadline extension requests, and grade tracking.
- **Quiz Architect**: Multiple choice, True/False, Short Answer, and Essay question formats with time-boxed attempt windows, draft auto-saving, option randomization, and auto-grading.

### 🧠 4. ClassIQ AI Academic Suite
- **ClassIQ AI Tutor**: Native integration with Google Gemini LLM for interactive student tutoring.
- **Quiz Auto-Generator**: Derive contextual quiz questions directly from uploaded lecture notes.
- **Smart Summarization**: Bulleted summary and key takeaway generator for long course resources.

---

## 🏗️ System Architecture

```
                                  +-----------------------+
                                  |    React 18 + Vite    |
                                  |  (ClassIQ Frontend)   |
                                  +-----------+-----------+
                                              |
                                 HTTP / WS     |  Socket.IO
                                 REST APIs     v  Events
                                  +-----------+-----------+
                                  | Express.js Server     |
                                  | (Node.js ESM Runtime) |
                                  +-----+-----+-----+-----+
                                        |     |     |
              +-------------------------+     |     +-------------------------+
              |                               v                               |
 +------------+-----------+       +-----------+-----------+       +-----------+-----------+
 |    MongoDB Database    |       |   Local File Storage    |       |   Google Gemini AI    |
 |   (Mongoose Schemas)   |       |   (/uploads Directory)  |       |   (Academic Suite)    |
 +------------------------+       +-----------------------+       +-----------------------+
```

---

## 🛠️ Tech Stack

### **Backend (`/server`)**
- **Runtime**: Node.js (ES Module Standard)
- **Framework**: Express.js v4.19
- **Database**: MongoDB & Mongoose v8.5 with compound indexes
- **Real-Time**: Socket.IO v4.8 (authenticated WebSocket rooms)
- **Security**: Helmet (CSP/XSS), CORS, Express Rate Limit, NoSQL Injection Sanitization
- **Services**: PDFKit, Multer, Zod env validation

### **Frontend (`/client`)**
- **Framework**: React 18 + Vite Build Engine
- **Routing**: React Router v6
- **Styling**: Vanilla CSS Design System with custom CSS properties & dark mode tokens
- **Hardware Integration**: `html5-qrcode` camera scanner, HTML5 Geolocation API
- **Charts**: Recharts dynamic metrics

---

## 📁 Repository Structure

```
classIQ/
├── client/                      # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/          # Reusable UI components (ClassroomCard, StudentRoster, etc.)
│   │   ├── context/             # React Context Providers (AuthContext, SocketContext)
│   │   ├── features/            # Feature modules (AI, Engagement, ActivePulseCard)
│   │   ├── pages/               # Page components (Dashboards, Security, Settings, Auth)
│   │   ├── services/            # API client service wrappers
│   │   └── index.css            # Centralized CSS Design Tokens & Styling
│   ├── vercel.json              # Vercel SPA Routing Rewrite Rules
│   └── vite.config.js           # Vite Build Configuration
├── server/                      # Node.js + Express Backend Server
│   ├── src/
│   │   ├── config/              # Environment schema, CORS, and database setup
│   │   ├── middleware/          # Security, auth, error handling, and metrics middleware
│   │   ├── modules/             # Modular Domain Logic (Auth, Attendance, Quiz, AI, etc.)
│   │   ├── routes/              # Health & core API router definitions
│   │   ├── socket/              # Socket.IO connection handlers & room isolation
│   │   ├── workers/             # Session expiry auto-absent background timer workers
│   │   └── app.js & server.js   # Main Express application & HTTP server entry points
│   └── tests/                   # 12 Automated Integration Test Suites (Jest)
└── docs/                        # Complete Technical & Architectural Specifications
    ├── PROJECT_DOCUMENTATION.md # Enterprise architectural manual
    ├── PRODUCTION_AUDIT.md      # Security & OWASP release verification
    ├── API.md                   # REST & WebSocket endpoint guide
    └── BACKUP_AND_RECOVERY.md   # Database backup & disaster recovery guide
```

---

## ⚡ Quickstart Setup

### **1. Prerequisites**
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local instance or MongoDB Atlas cluster URI

### **2. Clone & Install Dependencies**
```bash
git clone https://github.com/BHOOMI-08/classIQ.git
cd classIQ

# Install Server Dependencies
cd server && npm install

# Install Client Dependencies
cd ../client && npm install
```

### **3. Environment Configuration**
Create a `.env` file inside `/server`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/classiq
JWT_ACCESS_SECRET=your_access_secret_key_at_least_32_bytes
JWT_REFRESH_SECRET=your_refresh_secret_key_at_least_32_bytes
ATTENDANCE_HMAC_SECRET=your_attendance_hmac_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Create a `.env` file inside `/client`:
```env
VITE_API_URL=http://localhost:5000
```

### **4. Start Development Servers**
```bash
# Terminal 1: Backend API
cd server && npm run dev

# Terminal 2: Frontend Client
cd client && npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Testing & Quality Assurance

Run the complete backend test suite (12 test suites, 57 automated tests):
```bash
cd server
npm test
```

### **Test Coverage Summary**
- **Auth & JWT Security**: Pass
- **Rotating QR & Geofence Verification**: Pass
- **Quiz Auto-Grading & Attempt Engine**: Pass
- **Assignment Processing & Rubrics**: Pass
- **ClassIQ AI Assistant & Summarization**: Pass
- **Rate Limiting & OWASP Sanitization**: Pass

---

## 🚀 Cloud Deployment

- **Backend**: Ready for direct deployment to **Render** (`npm start`, `app.set('trust proxy', 1)` enabled).
- **Frontend**: Ready for direct deployment to **Vercel** (`client/vercel.json` rewrite configuration pre-configured).

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
