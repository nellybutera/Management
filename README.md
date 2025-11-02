# Credit Jambo Practical Test (Admin Side)

This repository contains the backend (NestJS) and frontend (React/Vite) components for the Credit Jambo Admin interface.

## Project Structure

The project is divided into two main, independent folders:

* **`backend/`**: Contains the **NestJS** REST API, authentication services, and database integration (Prisma).
* **`frontend/`**: Contains the **React** application (built with Vite) that serves the user interface.

***

## 1. Local Setup Instructions

Follow these steps to get the application running locally.

### Prerequisites

* **Node.js** (LTS version)
* **npm** or **Yarn**
* **PostgreSQL** database instance

### A. Backend Setup (NestJS)

1.  **Navigate** to the backend directory:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a file named **`.env`** in the `backend/` root. This must contain your database URL, JWT secrets, and mailer credentials.

    > **Example `.env` (Required Keys):**
    > ```env
    > # Database
    > DATABASE_URL="postgresql://user:password@localhost:5432/credit_jambo?schema=public"
    >
    > # JWT (Tokens)
    > JWT_SECRET="YOUR_STRONG_SECRET"
    >
    > # Email Service
    > MAIL_HOST=smtp.gmail.com
    > MAIL_PORT=587
    > MAIL_SECURE=false
    > MAIL_USER="your_email@gmail.com"
    > MAIL_PASS="your_16_digit_app_password"
    > ```

4.  **Run Database Migrations**:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Start the Backend Server**:
    The server runs on **port 3000** in watch mode.
    ```bash
    npm run start:dev
    ```

### B. Frontend Setup (React/Vite)

1.  **Navigate** to the frontend directory:
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the Frontend Development Server**:
    The client runs on **port 5173**.
    ```bash
    npm run dev
    ```

***

## 2. Access and Documentation

Once both servers are running:

| Resource | Access URL (Default) | Notes |
| :--- | :--- | :--- |
| **Frontend Application** | `http://localhost:5173/` | Start here to log in or register. |
| **Backend API Documentation** | `http://localhost:4000/api/docs` | Swagger UI detailing all endpoints (e.g., `/auth/register`). |
| **Base API URL** | `http://localhost:4000/` | All frontend API calls target this base address. |
