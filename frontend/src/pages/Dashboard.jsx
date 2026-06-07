import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../helpers/api';

const Dashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('careerbridge_user') || '{}'));
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentInternships, setRecentInternships] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Parallel REST calls
      const [appsRes, jobsRes, intsRes, logsRes] = await Promise.all([
        api.get('/applications.php'),
        api.get('/jobs.php'),
        api.get('/internships.php'),
        api.get('/activity_logs.php')
      ]);

      if (appsRes.data.success) setApplications(appsRes.data.applications);
      if (jobsRes.data.success) setRecentJobs(jobsRes.data.jobs.slice(0, 3));
      if (intsRes.data.success) setRecentInternships(intsRes.data.internships.slice(0, 3));
      if (logsRes.data.success) setActivityLogs(logsRes.data.logs.slice(0, 5));

    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return <span className="badge bg-success bg-opacity-25 text-success border border-success badge-custom">Accepted</span>;
      case 'rejected': return <span className="badge bg-danger bg-opacity-25 text-danger border border-danger badge-custom">Rejected</span>;
      case 'reviewed': return <span className="badge bg-warning bg-opacity-25 text-warning border border-warning badge-custom">Reviewed</span>;
      default: return <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary badge-custom">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-white" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-secondary">Assembling your workspace...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Welcome Banner */}
      <div className="glass-card p-4 mb-4 text-white d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div>
          <h2 className="fw-bold mb-1">Welcome back, {user.name}!</h2>
          <p className="text-secondary mb-0">Role: <span className="text-capitalize">{user.role}</span> | Manage applications and learning worksheets.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/profile" className="btn btn-outline-light border-secondary text-white px-3 py-2 small">
            <i className="bi bi-person-gear me-1"></i> Edit Profile
          </Link>
          <Link to="/placement" className="btn btn-primary-custom px-3 py-2 small">
            <i className="bi bi-rocket-takeoff-fill me-1"></i> Prep Materials
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small mb-4">{error}</div>}

      <div className="row g-4">
        {/* Main Content Area */}
        <div className="col-lg-8">
          
          {/* Stats Widgets */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="glass-card p-3 text-center">
                <h4 className="fw-bold text-white mb-0">{applications.length}</h4>
                <small className="text-secondary">Submitted Applications</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card p-3 text-center">
                <h4 className="fw-bold text-success mb-0">
                  {applications.filter(a => a.status === 'accepted').length}
                </h4>
                <small className="text-secondary">Offers Accepted</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card p-3 text-center">
                <h4 className="fw-bold text-warning mb-0">
                  {applications.filter(a => a.status === 'reviewed').length}
                </h4>
                <small className="text-secondary">Under Review</small>
              </div>
            </div>
          </div>

          {/* Applications Tracking */}
          <div className="glass-card p-4 mb-4">
            <h5 className="fw-semibold text-white mb-3"><i className="bi bi-file-earmark-check me-2 text-primary"></i>Application Progress</h5>
            {applications.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <i className="bi bi-archive fs-3 d-block mb-2"></i>
                You haven't submitted any job or internship applications yet.
                <div className="mt-3">
                  <Link to="/jobs" className="btn btn-primary-custom btn-sm me-2">Browse Jobs</Link>
                  <Link to="/internships" className="btn btn-secondary-custom btn-sm">Browse Internships</Link>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover border-secondary mb-0 align-middle" style={{ background: 'transparent' }}>
                  <thead>
                    <tr className="border-secondary text-secondary">
                      <th>Type</th>
                      <th>Position & Company</th>
                      <th>Applied Date</th>
                      <th>Resume</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="border-secondary">
                        <td className="text-capitalize small">
                          {app.type === 'job' ? (
                            <span className="badge bg-primary bg-opacity-25 text-primary border border-primary badge-custom">Job</span>
                          ) : (
                            <span className="badge bg-success bg-opacity-25 text-success border border-success badge-custom">Internship</span>
                          )}
                        </td>
                        <td>
                          <div className="fw-semibold text-white">{app.position_title}</div>
                          <div className="small text-secondary">{app.company_name}</div>
                        </td>
                        <td className="small text-secondary">{new Date(app.applied_at).toLocaleDateString()}</td>
                        <td>
                          <a 
                            href={`http://localhost:8000/${app.resume_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-outline-light btn-sm border-secondary text-white py-1 px-2"
                            title="Download Resume"
                          >
                            <i className="bi bi-file-earmark-arrow-down-fill text-warning"></i> PDF
                          </a>
                        </td>
                        <td>{getStatusBadge(app.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="glass-card p-4">
            <h5 className="fw-semibold text-white mb-3"><i className="bi bi-clock-history me-2 text-info"></i>Activity Timeline</h5>
            {activityLogs.length === 0 ? (
              <p className="text-muted text-center py-3">No activity recorded yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="d-flex gap-3 align-items-start">
                    <div className="bg-secondary bg-opacity-25 border border-secondary rounded p-2 text-center" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-lightning-charge-fill text-warning fs-6"></i>
                    </div>
                    <div>
                      <h6 className="fw-semibold text-white mb-0">{log.action}</h6>
                      <p className="text-secondary small mb-0">{log.details}</p>
                      <small className="text-muted text-xxs">{new Date(log.created_at).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Sidebar widgets */}
        <div className="col-lg-4">
          
          {/* Quick Profile Summary */}
          <div className="glass-card p-4 mb-4 text-center">
            {user.profile_pic ? (
              <img 
                src={`http://localhost:8000/${user.profile_pic}`} 
                alt="Profile" 
                className="rounded-circle object-fit-cover border border-secondary mx-auto mb-3"
                style={{ width: '100px', height: '100px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop";
                }}
              />
            ) : (
              <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white border border-secondary mx-auto mb-3" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h5 className="fw-bold text-white mb-1">{user.name}</h5>
            <p className="text-secondary mb-3 small">{user.email}</p>
            <div className="border-top border-secondary border-opacity-25 pt-3">
              <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary badge-custom py-2 px-3 text-capitalize">
                Role: {user.role} User
              </span>
            </div>
          </div>

          {/* Recently Posted Jobs */}
          <div className="glass-card p-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-white mb-0">Recent Jobs</h6>
              <Link to="/jobs" className="text-primary text-decoration-none small">View all</Link>
            </div>
            {recentJobs.length === 0 ? (
              <p className="text-muted small">No jobs listed yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {recentJobs.map(job => (
                  <div key={job.id} className="pb-3 border-bottom border-secondary border-opacity-25 last-border-none">
                    <h6 className="fw-semibold text-white mb-0">{job.title}</h6>
                    <small className="text-secondary d-block">{job.company} — {job.location}</small>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>Salary: {job.salary}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Posted Internships */}
          <div className="glass-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-white mb-0">Recent Internships</h6>
              <Link to="/internships" className="text-primary text-decoration-none small">View all</Link>
            </div>
            {recentInternships.length === 0 ? (
              <p className="text-muted small">No internships listed yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {recentInternships.map(intern => (
                  <div key={intern.id} className="pb-3 border-bottom border-secondary border-opacity-25 last-border-none">
                    <h6 className="fw-semibold text-white mb-0">{intern.title}</h6>
                    <small className="text-secondary d-block">{intern.company} — {intern.location}</small>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>Stipend: {intern.stipend}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
