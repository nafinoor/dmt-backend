# Dhaka Metro Rail Ticketing System - Backend

This is the backend for the **Dhaka Metro Rail Ticketing System**, built with **Node.js, Express, and MongoDB**.  
It includes modules for authentication, ticketing, notices, lost & found, and complaints, with role-based access for users and admins.

---

## 🚀 Features

- **Authentication** (Signup, Login, JWT-based Auth, Profile, Profile Photo Upload)
- **Role Management** (User & Admin)
- **Ticketing System** (Buy tickets, Travel history, Email confirmation)
- **Notice Panel** (Admin can create, edit, delete notices)
- **Lost & Found** (Users can submit reports, Admins approve/delete)
- **Complaint Box** (Users create complaints, Admins mark as Noted or Solved with email notifications)
- **Email Notifications** (Forgot password, Ticket purchase, Complaint updates, etc.)
- File uploads using **Multer** (Profile photos, Lost & Found, Complaints)

---

## 🛠️ Tech Stack

- **Node.js** (Express.js)
- **MongoDB** (Mongoose)
- **JWT** for authentication
- **Nodemailer** for email notifications
- **Multer** for file uploads

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/nafinoor/dmt-backend.git
cd dmt-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/dmrsystem
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```
⚠️ **Do not commit `.env` to GitHub.** Instead, keep a `.env.example` file for reference.

### 4. Start the Server
For development with auto-reload (requires nodemon):
```bash
npm run dev
```

For production:
```bash
npm start
```

---

## 📂 Project Structure

```
backend/
│── config/             # Database connection
│── controllers/        # Business logic for APIs
│── middleware/         # Auth middleware (protect, admin, userOnly)
│── models/             # Mongoose models
│── routes/             # Express routes
│── utils/              # Helper functions (email, token, etc.)
│── uploads/            # Uploaded files (profile photos, reports)
│── server.js           # Entry point
```

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `PUT /api/auth/profile/photo`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Tickets
- `POST /api/tickets` → Buy ticket
- `GET /api/tickets` → Travel history
- `GET /api/tickets/:id` → View ticket
- `DELETE /api/tickets/:id` → Delete ticket

### Notices
- `GET /api/notices` → View all notices (public)
- `POST /api/notices` → Create notice (Admin)
- `PUT /api/notices/:id` → Update notice (Admin)
- `DELETE /api/notices/:id` → Delete notice (Admin)

### Lost & Found
- `GET /api/lostfound` → View approved reports
- `POST /api/lostfound` → Submit report (User)
- `PUT /api/lostfound/:id/approve` → Approve (Admin)
- `DELETE /api/lostfound/:id` → Delete (Admin)

### Complaints
- `POST /api/complaints` → Submit complaint (User)
- `GET /api/complaints/my` → User's complaints
- `GET /api/complaints/all` → All complaints (Admin)
- `PUT /api/complaints/:id/note` → Mark as Noted (Admin)
- `PUT /api/complaints/:id/solve` → Mark as Solved (Admin)

---

## 📧 Email Features

Users receive emails for:
- Ticket purchase confirmation
- Password reset links
- Complaint status updates (Noted/Solved)

Admin uses Gmail App Passwords for SMTP

---

## 📝 License

This project is for university project/demo purposes.  
Feel free to fork and adapt as needed.
