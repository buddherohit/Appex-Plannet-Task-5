# CareerBridge – Student Career & Placement Ecosystem

CareerBridge is a centralized, industry-grade Capstone Project designed to streamline university placement operations, career guidance, and academic resource distribution. It connects students and system administrators through a secure, high-fidelity platform.

---

## Technical Stack

### Frontend Client
* **React.js (Vite)**: Modern SPA architecture
* **Bootstrap 5 & Icons**: Glassmorphism SaaS Dashboard layouts
* **React Router DOM**: Secure role-based client routing
* **Chart.js (`react-chartjs-2`)**: Dynamic analytics dashboards
* **Axios**: Network request handlers with token auto-injection interceptors

### REST API Backend
* **PHP 8+**: Clean object-oriented REST service handlers
* **JSON Web Tokens (JWT)**: Secure stateless authorization headers
* **PDO connection**: Parameterized prepared queries safeguarding data

### Relational Database
* **MySQL**: Indexed constraints schema maintaining relational integrity

---

## Key Features

1. **Secure Registration & Verification**: Registers users and verifies credentials using a simulated 6-digit OTP passcode before enabling access.
2. **JWT Authorization Guard**: Restricts dashboard access to students and admins.
3. **Courses & Syllabus**: Lists educational modules, categorized by technology filters.
4. **Study Notes Sharing**: Allows students to exchange PDF, DOCX, PPTX, or image files with validation checks.
5. **Placement Job & Internship Portals**: Allows searching by location or type (Full-time, Remote, etc.) and uploading resumes to apply.
6. **Student showcase**: Showcases portfolios with GitHub integrations and live demo links.
7. **Placement Readiness Hub**: Offers DSA resources, quantitative shortcuts, and interview questions.
8. **Admin Control Center**: Allows managing users, courses, jobs, notes, and updating application statuses.
9. **Interactive Analytics Panels**: Built with Chart.js to visually trace user registrations, note shares, applications, and postings.

---

## Installation & Local Setup

### Prerequisites
- **Node.js** (v18 or higher) & **NPM**
- **XAMPP / WampServer** (running PHP 8+ and MySQL)

### 1. Database Setup
1. Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
2. Create a new database named `careerbridge`.
3. Import the SQL schema file located at: `database/schema.sql`.
   *(This creates all tables and seeds a default admin user and test student user)*.

**Default Credentials:**
* **Administrator**:
  - Email: `admin@careerbridge.com`
  - Password: `admin123`
* **Student User**:
  - Email: `student@careerbridge.com`
  - Password: `student123`

### 2. Backend Config
1. Move the `backend` folder to your web server directory (e.g., `C:/xampp/htdocs/careerbridge/backend/` or run a local server inside the folder).
2. Configure database credentials in `backend/config/db.php` if you use custom MySQL usernames or passwords.
3. To start a local PHP development server:
   ```bash
   cd backend
   php -S localhost:8000
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## REST API Documentation

All request parameters are sent as JSON in the body unless specified otherwise. Token-guarded APIs require the header `Authorization: Bearer <your_jwt_token>`.

### 1. Auth Endpoint (`/api/auth.php`)
* **`POST ?action=register`**: Creates account. Returns simulated `debug_otp`.
* **`POST ?action=verify-otp`**: Verifies email. Request: `{ "email": "x", "otp_code": "000000" }`.
* **`POST ?action=login`**: Logs in user. Returns signed JWT token.
* **`POST ?action=forgot-password`**: Triggers password reset. Returns `debug_otp`.
* **`POST ?action=reset-password`**: Submits new password with OTP.
* **`GET ?action=me`**: Returns logged-in user profile details from token.

### 2. Courses Endpoint (`/api/courses.php`)
* **`GET`**: Lists courses. Supports query params `search` and `category`.
* **`POST`**: Adds course (Admin only).
* **`PUT ?id=X`**: Modifies course details (Admin only).
* **`DELETE ?id=X`**: Deletes course (Admin only).

### 3. Applications Endpoint (`/api/applications.php`)
* **`GET`**: Lists applications (Students see their own; Admin sees all).
* **`POST`**: Submits application (Multipart form: `type`, `post_id`, and `resume` file).
* **`PUT ?id=X`**: Updates application status (Admin only: `status` = 'reviewed'|'accepted'|'rejected').

### 4. Admin Dashboard Endpoint (`/api/admin_dashboard.php`)
* **`GET`**: Returns registration trends, note categories, and opportunity metrics for Chart.js.

---

## Security Protocols

* **Parameterized SQL Queries**: PDO prepared statements safeguard against SQL Injection.
* **Cryptographic Passwords**: Password verification utilizes Bcrypt hashing algorithm.
* **File Validation**: Uploads are restricted by extension checks (e.g. PDF/DOCX for resumes; JPG/PNG for avatars) and size limits.
* **JWT Access Controls**: Access is guarded by token signature validation.
