# 🎓 DSCE Mini Project Management System

A full-stack web application for managing student mini projects at Dayananda Sagar College of Engineering (DSCE).

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Email | Gmail SMTP (App Password) |

---

## 📁 Project Structure

```
dsce-mini-project/
├── backend/          # FastAPI Python backend
│   ├── main.py
│   ├── user_routes.py
│   ├── group_routes.py
│   ├── auth_middleware.py
│   ├── email_service.py
│   ├── requirements.txt
│   └── ...
└── frontend/         # React + Vite frontend
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── firebase/
    └── ...
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Firebase project with **Authentication** and **Firestore** enabled

---

### 🔧 Backend Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/arunkumarmeda27/dsce-mini-project.git
   cd dsce-mini-project/backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate      # Windows
   source venv/bin/activate   # Mac/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Add Firebase Service Account Key**

   - Go to [Firebase Console](https://console.firebase.google.com) → Project Settings → Service Accounts
   - Click **"Generate new private key"** → download the JSON file
   - Rename it to `serviceAccountKey.json` and place it inside `backend/`

5. **Create `.env` file** inside `backend/`
   ```env
   EMAIL_ADDRESS=your_gmail@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   ```
   > 📌 Use a **Gmail App Password**, not your regular password.  
   > Generate one at: Google Account → Security → 2-Step Verification → App Passwords

6. **Run the backend**
   ```bash
   uvicorn main:app --reload
   ```
   Backend will start at: `http://127.0.0.1:8000`

---

### 🎨 Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**

   Open `src/firebase/config.js` and replace with your Firebase project config:
   ```js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Run the frontend**
   ```bash
   npm run dev
   ```
   Frontend will start at: `http://localhost:5173`

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Student** | Create group, upload project, view group status |
| **Guide** | View assigned groups, accept/reject, review submissions |
| **Admin** | Approve users, manage groups, assign guides |

---

## 🔐 Authentication

- Email/password login (must use `@dsce.edu.in` email)
- Google OAuth login (must use `@dsce.edu.in` Google account)
- **Admin approval required** before accessing the dashboard

---

## 📧 Email Notifications

Automated emails are sent for:
- Group creation (with project details and members)
- Guide assignment / acceptance / rejection
- Group deletion
- Admin notifications to students/guides

---

## 🚀 Key Features

- ✅ Role-based access control (Student / Guide / Admin)
- ✅ Google & Email login with domain restriction
- ✅ Admin approval gate before dashboard access
- ✅ Group creation with leader assignment
- ✅ Guide assignment workflow
- ✅ Project file uploads (report, PPT, images)
- ✅ In-app notifications
- ✅ Export groups as Excel / PDF (guide feature)
- ✅ Status timeline tracking

---

## 🔒 Security Notes

> ⚠️ **Never commit** `serviceAccountKey.json` or `.env` to version control.  
> Both are listed in `.gitignore` and must be set up locally by each developer.