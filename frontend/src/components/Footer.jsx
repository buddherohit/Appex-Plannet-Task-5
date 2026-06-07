import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="glass-card-no-hover mt-5 rounded-0 border-start-0 border-end-0 border-bottom-0 py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold mb-3 d-flex align-items-center">
              <i className="bi bi-link-45deg text-gradient-primary fs-4 me-2"></i>
              <span className="text-gradient-primary">Career</span>Bridge
            </h5>
            <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Empowering students to cross the bridge from academics to professional excellence. High-quality courses, notes sharing, mock preparations, and active hiring roles.
            </p>
            <div className="d-flex gap-3 mt-4">
              <a href="#" className="btn btn-outline-light border-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-facebook text-info"></i>
              </a>
              <a href="#" className="btn btn-outline-light border-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-twitter-x text-white"></i>
              </a>
              <a href="#" className="btn btn-outline-light border-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-linkedin text-primary"></i>
              </a>
              <a href="#" className="btn btn-outline-light border-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-github text-white"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-semibold mb-3 text-white">Ecosystem</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.95rem' }}>
              <li><Link to="/courses" className="text-secondary text-decoration-none hover-link">Courses</Link></li>
              <li><Link to="/notes" className="text-secondary text-decoration-none hover-link">Study Notes</Link></li>
              <li><Link to="/placement" className="text-secondary text-decoration-none hover-link">Placement Prep</Link></li>
              <li><Link to="/projects" className="text-secondary text-decoration-none hover-link">Project Showcase</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-semibold mb-3 text-white">Portals</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.95rem' }}>
              <li><Link to="/jobs" className="text-secondary text-decoration-none hover-link">Job Board</Link></li>
              <li><Link to="/internships" className="text-secondary text-decoration-none hover-link">Internships</Link></li>
              <li><Link to="/dashboard" className="text-secondary text-decoration-none hover-link">Dashboard</Link></li>
              <li><Link to="/profile" className="text-secondary text-decoration-none hover-link">Profile Settings</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="fw-semibold mb-3 text-white">Contact Us</h6>
            <ul className="list-unstyled d-flex flex-column gap-3 text-secondary" style={{ fontSize: '0.95rem' }}>
              <li className="d-flex align-items-start gap-2">
                <i className="bi bi-geo-alt-fill text-gradient-primary mt-1"></i>
                <span>Appex Planet Campus, Sector 62, Noida, UP, 201301</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-telephone-fill text-gradient-primary"></i>
                <span>+91 98765 43210</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="bi bi-envelope-fill text-gradient-primary"></i>
                <span>support@careerbridge.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4 border-secondary opacity-25" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} CareerBridge. All rights reserved.
          </p>
          <div className="d-flex gap-4" style={{ fontSize: '0.9rem' }}>
            <a href="#" className="text-secondary text-decoration-none">Privacy Policy</a>
            <a href="#" className="text-secondary text-decoration-none">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
