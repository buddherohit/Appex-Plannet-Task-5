import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const token = localStorage.getItem('careerbridge_token');

  return (
    <div className="position-relative overflow-hidden min-vh-100 d-flex flex-column justify-content-between">
      {/* Decorative Glow Elements */}
      <div className="hero-glow"></div>
      <div className="hero-glow-left"></div>

      <div className="container my-auto py-5">
        <div className="row align-items-center g-5 py-5">
          {/* Left Hero Column */}
          <div className="col-lg-6 text-center text-lg-start">
            <span className="badge bg-secondary bg-opacity-25 border border-secondary text-white px-3 py-2 badge-custom mb-3">
              🎓 The All-In-One Career Portal
            </span>
            <h1 className="display-4 fw-extrabold text-white lh-sm mb-3">
              Launch Your Career with <br />
              <span className="text-gradient-primary">CareerBridge</span>
            </h1>
            <p className="fs-5 text-secondary mb-4" style={{ lineHeight: '1.6' }}>
              Bridge the gap between academics and industries. Prepare with industry-level DSA resources, download shared study notes, enroll in tech courses, and apply for verified Jobs & Internships.
            </p>
            <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
              {token ? (
                <Link to="/dashboard" className="btn btn-primary-custom px-4 py-3 fs-6">
                  Go to Dashboard <i className="bi bi-arrow-right-short ms-1"></i>
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary-custom px-4 py-3 fs-6">
                    Get Started <i className="bi bi-arrow-right-short ms-1"></i>
                  </Link>
                  <Link to="/login" className="btn btn-outline-light border-secondary px-4 py-3 fs-6 text-white">
                    Sign In
                  </Link>
                </>
              )}
              <Link to="/about" className="btn btn-link text-decoration-none text-secondary d-flex align-items-center fs-6">
                Learn more <i className="bi bi-chevron-right ms-1" style={{ fontSize: '0.8rem' }}></i>
              </Link>
            </div>
          </div>

          {/* Right Hero Column: Interactive Cards Grid */}
          <div className="col-lg-6">
            <div className="row g-4 animate-float">
              <div className="col-6">
                <div className="glass-card p-4 text-center mb-4">
                  <div className="bg-primary bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-briefcase-fill text-gradient-primary fs-3"></i>
                  </div>
                  <h3 className="fw-bold text-white mb-1">50+</h3>
                  <p className="text-secondary mb-0 small">Active Jobs</p>
                </div>

                <div className="glass-card p-4 text-center">
                  <div className="bg-success bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-file-earmark-text-fill text-success fs-3"></i>
                  </div>
                  <h3 className="fw-bold text-white mb-1">200+</h3>
                  <p className="text-secondary mb-0 small">Study Resources</p>
                </div>
              </div>

              <div className="col-6 mt-lg-5">
                <div className="glass-card p-4 text-center mb-4">
                  <div className="bg-warning bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-mortarboard-fill text-warning fs-3"></i>
                  </div>
                  <h3 className="fw-bold text-white mb-1">15+</h3>
                  <p className="text-secondary mb-0 small">Internships</p>
                </div>

                <div className="glass-card p-4 text-center">
                  <div className="bg-info bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-people-fill text-info fs-3"></i>
                  </div>
                  <h3 className="fw-bold text-white mb-1">1.2k+</h3>
                  <p className="text-secondary mb-0 small">Placements Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="container py-5 border-top border-secondary border-opacity-25">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-white mb-2">Designed for Placement Success</h2>
          <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            CareerBridge is built to help student developers showcase their portfolios, access learning guides, and get hired.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <i className="bi bi-laptop fs-2 text-primary mb-3 d-block"></i>
              <h4 className="fw-semibold text-white mb-2">Technical Learning</h4>
              <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>
                Access courses on React, Node.js, Cloud architectures, and databases compiled by academic and industry experts.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <i className="bi bi-shield-check fs-2 text-success mb-3 d-block"></i>
              <h4 className="fw-semibold text-white mb-2">Mock Preparation</h4>
              <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>
                Examine active DSA code snippets, practice quantitative aptitude templates, and review top software engineering interview questions.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <i className="bi bi-share-fill fs-2 text-info mb-3 d-block"></i>
              <h4 className="fw-semibold text-white mb-2">Notes & Projects Exchange</h4>
              <p className="text-secondary mb-0" style={{ fontSize: '0.95rem' }}>
                Upload your lecture notes, search for class materials, showcase Github links, and list demo links for your capstone projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
