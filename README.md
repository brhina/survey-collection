# DataCollector - Universal Data & Survey Collection Platform

A high-performance, full-stack data collector, survey, registration, and inspection platform built with TypeScript, Node.js, Express, MongoDB, React, Vite, Tailwind CSS, Recharts, and Lucide Icons.

---

## 🌟 Highlights & Architecture

### **Data Collector & Form Concept**
- **Universal Form & Data Collection**: Designed not only for surveys, but for registrations, field audits, customer reviews, applications, and structured data intake.
- **Collector Categories**:
  - `survey`: Feedback questionnaires, ratings, NPS, and academic polls.
  - `registration`: Event signups, RSVPs, workshops, and attendee intake.
  - `feedback`: Bug reports, user feedback, and satisfaction reviews.
  - `inspection`: Safety audits, QA checklists, and facility monitoring logs.
  - `application`: Intake questionnaires, candidate registration, and proposals.
  - `general`: Universal custom data collection.
- **Expanded Field / Question Types**:
  - Text (Short Answer)
  - Paragraph (Long Text)
  - Email (with syntax verification)
  - Number & Metrics
  - Phone (Contact Number)
  - Date Picker
  - Multiple Choice (Single Selection)
  - Checkboxes (Multi-Selection)
  - Dropdowns
  - Rating Scales & NPS

---

### **Strict Single-Submission Uniqueness Per User/Email**
- **Respondent Email Sync**:
  - Automatically captures and syncs the email of authenticated users (`req.user.email`).
  - Requires and validates respondent email for unauthenticated/guest submissions.
- **Database-Level Compound Unique Index**:
  - MongoDB compound unique index: `{ surveyId: 1, respondentEmail: 1 }` with `{ unique: true }`.
  - Guarantees zero duplicate submissions even under race conditions.
- **Pre-flight Duplicate Check & Conflict Error (HTTP 409)**:
  - Validates submission before database write and catches duplicate key constraint violations (`code 11000`).
  - Returns informative `409 Conflict` errors: `"A submission from this email address has already been recorded for this data collector. Only one submission is permitted per email address."`
- **Eligibility Pre-Check API**:
  - `GET /api/v1/responses/check-eligibility?surveyId=:id&email=:email`
  - Allows instant client-side verification before filling or submitting forms.
- **Data Export with Email Tracking**:
  - CSV exports include `Respondent Email` as column #2.
  - JSON exports include full respondent email records.

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

# Run database seed (Seeds 4 collectors, 3 users, 21 realistic responses)
npm run seed

# Start server in development mode (port 5000)
npm run dev
```

#### Sample Seed Logins
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@surveyflow.com` | `admin123` |
| **Survey / Form Creator** | `elena.rostova@university.edu` | `creator123` |
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

### Collectors & Surveys (`/api/v1/surveys`)
- `GET /api/v1/surveys` - List all collectors (supports search, category filter, status filter, pagination)
- `POST /api/v1/surveys` - Create a new data collector or survey
- `GET /api/v1/surveys/:id` - Fetch single collector by ID
- `PUT /api/v1/surveys/:id` - Update collector configuration or questions
- `DELETE /api/v1/surveys/:id` - Soft-delete or archive collector
- `GET /api/v1/surveys/:id/export?format=csv` - Download responses as CSV (includes Respondent Email)
- `GET /api/v1/surveys/:id/export?format=json` - Download responses as JSON

### Responses (`/api/v1/responses`)
- `GET /api/v1/responses/check-eligibility?surveyId=:id&email=:email` - Check if email is eligible to submit
- `POST /api/v1/responses` - Submit response (records respondent email & enforces 1-per-email uniqueness)
- `GET /api/v1/responses/survey/:surveyId/results` - Aggregated analytics & distributions
- `GET /api/v1/responses/survey/:surveyId` - Raw response records with pagination

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Create user account
- `POST /api/v1/auth/login` - Authenticate and retrieve JWT token
- `GET /api/v1/auth/me` - Retrieve current user profile

