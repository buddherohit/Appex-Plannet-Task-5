# CareerBridge – Student Career & Placement Ecosystem
### Capstone Project Report

---

## 1. Introduction

In modern academic institutions, bridging the gap between student education and industry employment remains a critical operational challenge. Traditional placement cells rely on disjointed, spreadsheet-heavy tracking processes, causing communications latency and poor record accessibility. 

**CareerBridge** is an enterprise-grade Career & Placement Ecosystem that centralizes resources, job listings, internships, student coding showcases, placement prep worksheets, and user timelines. The system provides a seamless SaaS experience, connecting student developers directly with active opportunities and administrative tracking metrics.

---

## 2. Problem Statement

University placement cells face several systemic challenges:
1. **Data Fragmentation**: Learning syllabi, resume PDFs, list folders, and company applications are scattered across different cloud platforms, emails, and spreadsheet logs.
2. **Poor Accountability**: No clear historical audit timeline of student registrations, application approvals, or learning resources download activity exists.
3. **Complex Evaluation**: Training and placement coordinators lack real-time analytics graphs to inspect student registrations, job-to-internship posting ratios, and application trends.
4. **Security Vulnerabilities**: Insecure file uploads and lack of SQL Injection safeguards on academic portals present severe risks.

---

## 3. Objectives

The primary engineering objectives of the CareerBridge ecosystem are:
- **Centralize Operations**: Integrate courses, notes exchange, job application channels, and portfolio listings into a single responsive portal.
- **Provide Actionable Insights**: Embed dynamic Chart.js visualizations for administrators to analyze platform metrics.
- **Enforce Role-based Security**: Protect endpoints with JSON Web Tokens (JWT) and PDO database prepared queries.
- **Maximize Accessibility**: Utilize Bootstrap 5 and modern HSL custom styling to deliver a premium responsive experience across mobile and desktop viewports.

---

## 4. System Architecture

CareerBridge uses a three-tier web application architecture:

```
+-----------------------------------------------------------+
|                      CLIENT TIER                          |
|             React.js Single Page Application              |
|   (Axios Network Client, Chart.js, HTML5 CSS3 Outfit)     |
+-----------------------------------------------------------+
                              |
                     REST HTTP Requests
                      JWT Bearer Token
                              v
+-----------------------------------------------------------+
|                      BUSINESS TIER                        |
|                  PHP 8+ API Gateway                       |
| (JWT Verification Helper, CORS Controller, File Validator) |
+-----------------------------------------------------------+
                              |
                    SQL Prepared Statements
                              v
+-----------------------------------------------------------+
|                      DATA STORE TIER                      |
|                   MySQL Database Server                   |
|         (Foreign Key Constraints, Table Indexes)          |
+-----------------------------------------------------------+
```

---

## 5. Database Design

### Entity Relationship Model
- **`users`** establishes a 1:N relationship with **`projects`**, **`notes`**, and **`applications`**.
- **`jobs`** and **`internships`** map to **`applications`** through their primary keys.
- **`activity_logs`** and **`notifications`** hold cascading foreign keys to `users`.

### Table Schema Mapping
- **`users`**: Manages credentials, Bcrypt password hashes, and registration validation flags.
- **`courses`**: Stores educational content headers and covers.
- **`notes`**: Holds category terms and local relative storage file paths.
- **`jobs` & `internships`**: Manages hiring details, salaries/stipends, and deadlines.
- **`applications`**: Maps student IDs to job/internship posts, and stores resume file paths.
- **`placement_prep`**: Classifies readiness assets under DSA, Aptitude, and Interview categories.
- **`activity_logs`**: Logs historical user actions for student dashboards and admin timelines.
- **`notifications`**: Pushes alerts for application approvals or new postings.

---

## 6. Security Features

CareerBridge integrates multiple layers of industrial security:
1. **SQL Injection Protection**: Relational commands are compiled using MySQL PDO parameters, preventing raw command injection.
2. **Stateless JWT Tokens**: Session validation is managed via standard, cryptographic headers containing expirations.
3. **Bcrypt Password Hashing**: Passwords are saved as cryptographically salted hashes using standard `password_hash()` methods.
4. **Upload Verification Check**: Uploaded resume PDFs and notes are parsed on the backend. Files with unauthorized extensions or exceeding predefined size limits (2MB avatar, 5MB resume, 10MB notes) are blocked.

---

## 7. Future Scope

1. **Live Interview Rooms**: Integrate WebRTC channels to allow remote mock interviews directly inside the ecosystem.
2. **Resume Parsing**: Implement AI parsing of uploaded resume PDFs to automatically extract technology tags and suggest matching jobs.
3. **SMTP Notification Deliveries**: Upgrade simulated OTP verification to live email alerts using SMTP libraries.
4. **Calendar Sync**: Add automated calendar integrations for schedule tracking of job deadlines and interviews.

---

## 8. Conclusion

CareerBridge succeeds in solving the problem of scattered placement workflows by consolidating career preparation, syllabus guides, notes, showcases, and applications. The implementation demonstrates a robust separation of concerns, high UX responsiveness, state-of-the-art security, and visually engaging dashboards, making the Capstone project portfolio-ready and suitable for deployment.
