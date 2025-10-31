
---

# 🚀 AI-Powered Ticket Classification and Management System

This project implements a **modern, event-driven support ticketing system** that leverages **Generative AI (Google Gemini API)** to automate the entire initial triage process.  
It replaces the slow, manual process of categorization, prioritization, and assignment with an **intelligent, asynchronous workflow**, ensuring immediate user response and skill-based moderator routing.

---

## ✨ Features

This system is built for **speed** and **intelligence**, utilizing an **MERN stack** architecture decoupled by an **Event Bus**.

### 🧠 AI-Powered Triage & Intelligence

- ⚡ **Automatic Classification:** Instantly categorizes tickets (e.g., _Technical_, _Billing_) and assigns priority using the Gemini LLM.  
- 🧩 **Skill-Based Routing:** AI identifies required skills (e.g., _MongoDB_, _React_) from the ticket description, enabling automated assignment to the most qualified Moderator.  
- 💡 **Actionable Context:** Generates concise “Helpful Notes” for the assigned Moderator, drastically reducing initial diagnostic time.

---

## 🧩 System Architecture

- 🌀 **Asynchronous Processing:** Uses the **Inngest Event Bus** to decouple the user’s synchronous submission request from the high-latency AI analysis, guaranteeing sub-second user acknowledgement.  
- 🧠 **Smart Fallback:** If no Moderator matches the AI’s required skills, the ticket is automatically escalated and assigned to an **Admin** for manual review.  
- 🔐 **Robust Security:** Implements **Role-Based Access Control (RBAC)** using **JWT** for three distinct user types — `User`, `Moderator`, and `Admin`.

---

## 🛠️ Tech Stack

| **Layer**              | **Technology**          | **Rationale**                                                                 |
|------------------------|-------------------------|-------------------------------------------------------------------------------|
| **Frontend**           | React.js (Vite)         | Component-based framework for dynamic, responsive user interfaces.            |
| **Backend**            | Node.js / Express.js    | Event-driven runtime critical for non-blocking I/O during AI calls.           |
| **AI Intelligence**    | Google Gemini API       | Generative LLM used for few-shot and structured classification.               |
| **Database**           | MongoDB                 | NoSQL database chosen for flexible schema to store AI-generated fields.       |
| **Asynchronous Engine**| Inngest Event Bus       | Ensures reliable execution and retries of background tasks.                   |
| **Authentication**     | JSON Web Tokens (JWT)   | Stateless mechanism for secure RBAC across all API routes.                    |
| **Notifications**      | Nodemailer / Gmail SMTP | Handles asynchronous email notifications.                                     |

---

## 📐 Project Architecture Overview

The system architecture is divided into three key services:  
**Client (Frontend)**, **Synchronous API (Backend)**, and **Asynchronous Event Handler (Inngest)**.

1. 🧾 **Client Submission:** User submits a ticket to the Express API.  
2. ⚙️ **API Decoupling:** The Express Controller saves the ticket to MongoDB and fires a `ticket/created` event to Inngest.  
3. 🤖 **Asynchronous Triage:** The Inngest function consumes the event, calls the Gemini API, performs skill-matching, updates the ticket, and triggers notifications.

---

## ⚙️ Installation and Setup

### 🧾 Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Gemini API Key
- Gmail Account + App Password (for Nodemailer)
- Inngest Account (for Event Bus service)

---

### 🧭 Clone the Repository

```bash
git clone https://github.com/anshuman2810/ai-ticketing-system.git
cd ai-ticketing-system
```
## ⚙️ Configuration and Setup

### 🧾 Environment Variables

Create a `.env` file in the **root directory** of your project and add the following variables:

```bash
# MongoDB
MONGO_URI="your_mongodb_connection_string"
JWT_SECRET=a_long_random_string_for_tokens

# Gemini AI
GEMINI_API_KEY=your_google_gemini_api_key

# Email/Nodemailer (Using Gmail SMTP)
# NOTE: You must generate a specific App Password for your Gmail account, as standard login passwords will fail.
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_app_password
APP_URL=http://localhost:3000 # URL where the backend is running (for email links)
```

### 🧩 Install Dependencies

Navigate to both the backend and frontend directories and install dependencies:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 🚀 Running the Application

This project requires **three concurrent services** to run — the **Express API**, **Inngest Server**, and **React Frontend**.

| **Service**       | **Directory** | **Command**           | **Purpose**                                        |
|-------------------|---------------|-----------------------|----------------------------------------------------|
| Express Backend   | `backend/`    | `npm run start`       | REST API, controllers, and MongoDB interface.      |
| Inngest Server    | `backend/`    | `npm run inngest-dev` | Event listener for AI triage and assignment logic. |
| React Frontend    | `frontend/`   | `npm run dev`         | User interface and client-side application.        |

The frontend typically runs on:  
👉 **[http://localhost:5173](http://localhost:5173)**

---

### 🔒 Initial Setup Notes

- For initial testing, you must manually create at least **one Admin** and **one Moderator** user.  
- Update the Moderator’s **Skill Set** array in MongoDB (or via the Admin UI, if implemented).  
- This ensures that the **Smart Routing Logic** correctly assigns AI-triaged tickets to moderators.

---



