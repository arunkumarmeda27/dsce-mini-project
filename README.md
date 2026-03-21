<div align="center">
  <img src="frontend/src/assets/dsce-logo.png" alt="DSCE Logo" width="120" />
  <h1>🎓 DSCE Mini Project Management System</h1>
  <p>A full-stack web application designed for managing student mini-projects at Dayananda Sagar College of Engineering (DSCE).</p>
  
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://dsce-mini-project.vercel.app/)
  [![Backend API](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render)](https://dsce-mini-project-mmh0.onrender.com/docs)
</div>

<br />

The **DSCE Mini Project Management System** streamlines the entire project lifecycle—from student group formation to faculty guide approval and final report submissions. Engineered with a scalable modern tech stack, it features role-based access control, secure authentication, and real-time status tracking.

---

## ⚡ Tech Stack

This project is built using modern, production-grade tools:

### Frontend
- **Framework:** React 19 + Vite
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS + UI Glassmorphism
- **Hosting:** Vercel

### Backend
- **Framework:** FastAPI (Python 3.11)
- **Server:** Uvicorn & Gunicorn
- **Data Export:** Pandas, OpenPyXL, ReportLab
- **Hosting:** Render

### Cloud Services (Firebase)
- **Authentication:** Firebase Auth (Google OAuth & Email/Password)
- **Database:** Cloud Firestore (NoSQL)
- **Storage:** Google Cloud Storage (for reports/PPTs)

---

## 🚀 Key Features

*   **🔒 Domain-Restricted Auth:** Only allows `@dsce.edu.in` emails (Google OAuth & Email login).
*   **🛡️ Role-Based Access Control:** Distinct, secure dashboards for Students, Guides, and Admins.
*   **⏳ Admin Approval Gate:** Newly registered users cannot access the system until an Admin physically approves their account.
*   **👥 Automated Group Formation:** Students can digitally form groups, designate a leader, and select project domains.
*   **👩‍🏫 Guide Assignment:** Guides can review newly formed groups and choose to Accept or Reject them.
*   **📂 Cloud File Uploads:** Students can upload project documentation, code links, and presentation files natively into Cloud Storage.
*   **📊 One-Click Data Export:** Guides and Admins can export group data natively to `.xlsx` (Excel) or `.pdf`.
*   **📧 Automated Email Service:** Triggers fully automated HTML emails for group creation, guide acceptance, rejections, and system alerts using an asynchronous Python SMTP handler.

---

## 💻 Local Setup Instructions

If you wish to run the project locally on your machine, follow these steps:

### 1. Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** installed
- A Firebase project with **Firestore**, **Authentication**, and **Storage** enabled.

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/arunkumarmeda27/dsce-mini-project.git

# Navigate to backend
cd dsce-mini-project/backend

# Create & activate a virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

**Environment Configuration:**
Create a `.env` file in the `backend/` directory:
```env
EMAIL_ADDRESS=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```
> Place your Firebase `serviceAccountKey.json` inside the `backend/` directory as well. This file is ignored by Git for security.

Start the backend API:
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd dsce-mini-project/frontend

# Install dependencies
npm install
```

**Environment Configuration:**
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://127.0.0.1:8000
```
> Make sure your `src/firebase/config.js` is updated with your Firebase details.

Start the React application:
```bash
npm run dev
```

---

## 🚢 Cloud Deployment (CI/CD)

This application is configured for seamless deployment:
- **Vercel (Frontend):** Vercel handles the Vite build process. Requires setting the `VITE_API_URL` environment variable to the live backend URL.
- **Render (Backend):** Uses `gunicorn` in a production environment via the provided `render.yaml` configuration. Requires `PYTHON_VERSION=3.11.0` and the `FIREBASE_CREDENTIALS` string environment variable.

---

## 🔐 Security & Contribution Notes
- Strict CORS policies are enforced on the backend.
- Firebase credentials and environment secrets are safely listed in `.gitignore` and must never be committed.
- Google OAuth is strictly locked to specific institutional domains.