import React from 'react';

const About = () => {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <span className="badge bg-secondary bg-opacity-25 border border-secondary text-white px-3 py-2 badge-custom mb-3">
          ℹ️ About the Platform
        </span>
        <h1 className="fw-extrabold text-white mb-3">About CareerBridge</h1>
        <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
          CareerBridge is a next-generation Career & Placement Ecosystem designed to empower universities and students.
        </p>
      </div>

      <div className="row g-5 align-items-center mb-5">
        <div className="col-lg-6">
          <h3 className="fw-semibold text-white mb-3">Our Objective</h3>
          <p className="text-secondary" style={{ lineHeight: '1.7', fontSize: '1.05rem' }}>
            Traditional placement cells run on disjoint spreadsheets, email chains, and localized folders. CareerBridge unifies the entire workflow into a single, secure SaaS portal.
          </p>
          <p className="text-secondary" style={{ lineHeight: '1.7', fontSize: '1.05rem' }}>
            Students can build their profiles, showcase coding projects, download curated academic study notes, review data structures & aptitude worksheets, and apply for job and internship postings. 
          </p>
          <p className="text-secondary" style={{ lineHeight: '1.7', fontSize: '1.05rem' }}>
            System Administrators gain access to advanced analytics panels built with Chart.js to inspect registration trends, post ratios, and evaluate user applications efficiently.
          </p>
        </div>

        <div className="col-lg-6">
          <div className="glass-card p-4">
            <h4 className="fw-semibold text-white mb-4"><i className="bi bi-stack me-2 text-primary"></i>Tech Stack & Architecture</h4>
            
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="bg-primary bg-opacity-25 rounded p-2 text-primary" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-browser-chrome fs-5"></i>
              </div>
              <div>
                <h6 className="fw-semibold text-white mb-0">Frontend Client</h6>
                <p className="text-secondary mb-0 small">React.js (Vite), React Router DOM, Bootstrap 5, Chart.js, Axios</p>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="bg-success bg-opacity-25 rounded p-2 text-success" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-cpu fs-5"></i>
              </div>
              <div>
                <h6 className="fw-semibold text-white mb-0">REST API Backend</h6>
                <p className="text-secondary mb-0 small">PHP 8+ OOP, JWT Authentication, Custom CORS Middleware</p>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="bg-info bg-opacity-25 rounded p-2 text-info" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-database fs-5"></i>
              </div>
              <div>
                <h6 className="fw-semibold text-white mb-0">Relational Database</h6>
                <p className="text-secondary mb-0 small">MySQL (PDO connection, prepared statements, key constraints)</p>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3">
              <div className="bg-warning bg-opacity-25 rounded p-2 text-warning" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-shield-lock fs-5"></i>
              </div>
              <div>
                <h6 className="fw-semibold text-white mb-0">Security Protocols</h6>
                <p className="text-secondary mb-0 small">Password hashing via Bcrypt, strict file uploads verification, SQL Injection guard, role checks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
