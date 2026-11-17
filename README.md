# SurveyFlow - Modern Enterprise Survey & Questionnaire Platform

A high-performance, full-stack survey and feedback collection platform built with TypeScript, Node.js, Express, MongoDB, React, Vite, Tailwind CSS, Recharts, and Lucide Icons.

---

## 🌟 Highlights & Architecture

### **Backend (Modular Layered Architecture)**
- **Layered Pattern**: `Route -> Middleware -> Controller -> Service -> Repository -> Model`
- **Dual API Support**:
  - Versioned API: `/api/v1/*` returning standard `{ success, data, message, meta }` envelopes
  - Backwards Compatibility: Legacy `/api/surveys` and `/api/responses` endpoints
- **Enterprise Middleware**:
  - Request logging with latency and status code tracking
  - Sliding-window rate limiting (1000 reqs/15m in dev, stricter on submission)
  - Strict input validation powered by **Zod schemas**
  - Robust `ObjectId.isValid()` guards preventing CastError crashes
  - Centralized error handling with specialized `AppError` subclasses
- **High-Performance Analytics**: Native MongoDB aggregation pipelines computing real-time distributions, average ratings, and response counts.
- **Data Export**: Built-in CSV and JSON export engine (`/api/v1/surveys/:id/export?format=csv|json`).

### **Frontend (Feature-Driven Modular Architecture)**
- **Target Folder Structure**: Strict feature-based modules (`features/surveys`, `features/responses`, `features/questions`, `features/analytics`, `components/ui`, `components/layout`, `components/feedback`, `pages/`, `api/`).
- **Color Psychology**:
  - Pure white card and background surfaces (`bg-white`, `border-slate-100`) for high clarity and minimal cognitive fatigue.
  - Emerald green call-to-action buttons (`bg-emerald-600 hover:bg-emerald-700 text-white`) signaling security, success, and positive progression.
- **User Experience**:
  - Interactive multi-step wizard mode or single-page continuous view with smooth progress tracking.
  - Draft auto-save and automatic session recovery.
  - Real-time live questionnaire preview side-by-side with the question builder.
  - Rich interactive visualizations (Recharts donut charts, bar charts, star ratings, and response logs).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+
- **MongoDB** running on `mongodb://127.0.0.1:27017`

### 2. Backend Setup & Seeding

```bash
cd server

# Install dependencies
npm install

# Run database seed (Seeds 3 surveys, 3 users, 17 realistic responses)
npm run seed

# Start server in development mode (port 5000)
npm run dev
```

#### Sample Seed Logins
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@surveyflow.com` | `admin123` |
| **Survey Creator** | `elena.rostova@university.edu` | `creator123` |
| **Student / Respondent** | `alex.rivera@student.edu` | `student123` |

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start Vite development server (port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Reference Overview

### Health
- `GET /healthz` & `GET /api/healthz` - Database connectivity & system health

### Surveys (`/api/v1/surveys`)
- `GET /api/v1/surveys` - List all surveys (supports search, status filter, pagination)
- `POST /api/v1/surveys` - Create a new survey
- `GET /api/v1/surveys/:id` - Fetch single survey by ID
- `PUT /api/v1/surveys/:id` - Update survey configuration or questions
- `DELETE /api/v1/surveys/:id` - Soft-delete or archive survey
- `GET /api/v1/surveys/:id/export?format=csv` - Download survey responses as CSV
- `GET /api/v1/surveys/:id/export?format=json` - Download survey responses as JSON

### Responses (`/api/v1/responses`)
- `POST /api/v1/responses` - Submit a questionnaire response
- `GET /api/v1/responses/survey/:surveyId/results` - Aggregated analytics & distributions
- `GET /api/v1/responses/survey/:surveyId` - Raw response records with pagination

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Create user account
- `POST /api/v1/auth/login` - Authenticate and retrieve JWT token
- `GET /api/v1/auth/me` - Retrieve current user profile
