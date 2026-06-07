import React, { useState, useEffect } from 'react';
import api from '../helpers/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Domain states
  const [counters, setCounters] = useState({ students: 0, courses: 0, notes: 0, jobs: 0, internships: 0, applications: 0 });
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [placementResources, setPlacementResources] = useState([]);

  // Analytics Chart.js data states
  const [regTrendData, setRegTrendData] = useState({ labels: [], datasets: [] });
  const [appsBreakdownData, setAppsBreakdownData] = useState({ labels: [], datasets: [] });
  const [notesCatData, setNotesCatData] = useState({ labels: [], datasets: [] });
  const [postsBreakdownData, setPostsBreakdownData] = useState({ labels: [], datasets: [] });

  // Form states (Add/Edit modals)
  const [showModal, setShowModal] = useState(null); // 'course', 'job', 'internship', 'placement'
  const [editId, setEditId] = useState(null);
  
  const [courseForm, setCourseForm] = useState({ title: '', description: '', instructor: '', duration: '', category: 'Web Development', image_url: '' });
  const [jobForm, setJobForm] = useState({ title: '', company: '', description: '', requirements: '', salary: '', location: '', job_type: 'Full-time', deadline: '' });
  const [internForm, setInternForm] = useState({ title: '', company: '', description: '', requirements: '', duration: '', stipend: '', location: '', deadline: '' });
  const [placementForm, setPlacementForm] = useState({ title: '', category: 'dsa', content: '', resource_url: '' });

  // Load all admin data
  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, usersRes, appsRes, coursesRes, notesRes, projRes, jobsRes, intsRes, prepRes] = await Promise.all([
        api.get('/admin_dashboard.php'),
        api.get('/users.php'),
        api.get('/applications.php'),
        api.get('/courses.php'),
        api.get('/notes.php'),
        api.get('/projects.php'),
        api.get('/jobs.php'),
        api.get('/internships.php'),
        api.get('/placement.php')
      ]);

      // Counters & Lists
      if (dashRes.data.success) {
        setCounters(dashRes.data.counters);
        assembleCharts(dashRes.data);
      }
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (appsRes.data.success) setApplications(appsRes.data.applications);
      if (coursesRes.data.success) setCourses(coursesRes.data.courses);
      if (notesRes.data.success) setNotes(notesRes.data.notes);
      if (projRes.data.success) setProjects(projRes.data.projects);
      if (jobsRes.data.success) setJobs(jobsRes.data.jobs);
      if (intsRes.data.success) setInternships(intsRes.data.internships);
      if (prepRes.data.success) setPlacementResources(prepRes.data.resources);

    } catch (err) {
      console.error(err);
      setError('Error loading administrative assets. Verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  const assembleCharts = (data) => {
    // 1. User registrations trend
    const regLabels = data.reg_trend.map(t => t.reg_date);
    const regCounts = data.reg_trend.map(t => t.reg_count);
    setRegTrendData({
      labels: regLabels.length > 0 ? regLabels : ['Jan', 'Feb', 'Mar'],
      datasets: [{
        label: 'Registrations',
        data: regCounts.length > 0 ? regCounts : [2, 5, 8],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.3,
        fill: true,
      }]
    });

    // 2. Job vs Internship applications breakdown
    const appLabels = data.apps_breakdown.map(a => a.type === 'job' ? 'Jobs' : 'Internships');
    const appCounts = data.apps_breakdown.map(a => a.app_count);
    setAppsBreakdownData({
      labels: appLabels.length > 0 ? appLabels : ['Jobs', 'Internships'],
      datasets: [{
        data: appCounts.length > 0 ? appCounts : [1, 2],
        backgroundColor: ['#6366f1', '#14b8a6'],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }]
    });

    // 3. Notes Category upload trends
    const noteLabels = data.notes_categories.map(c => c.category);
    const noteCounts = data.notes_categories.map(c => c.upload_count);
    setNotesCatData({
      labels: noteLabels.length > 0 ? noteLabels : ['CS', 'Ecosystem', 'Electronics'],
      datasets: [{
        label: 'Uploads',
        data: noteCounts.length > 0 ? noteCounts : [4, 7, 3],
        backgroundColor: '#f59e0b',
        borderRadius: 6
      }]
    });

    // 4. Job vs Internship post metrics
    setPostsBreakdownData({
      labels: ['Jobs', 'Internships'],
      datasets: [{
        data: [data.posts_breakdown.jobs, data.posts_breakdown.internships],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }]
    });
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // CRUD Operations
  const handleUserRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      const res = await api.put(`/users.php?id=${userId}`, { role: nextRole });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        loadAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating role.');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user profile? All associated data will be deleted.')) return;
    try {
      const res = await api.delete(`/users.php?id=${userId}`);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        loadAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user.');
    }
  };

  const handleApplicationStatus = async (appId, status) => {
    try {
      const res = await api.put(`/applications.php?id=${appId}`, { status });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        loadAdminData();
      }
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleDeleteItem = async (endpoint, id) => {
    if (!window.confirm('Delete this item permanently?')) return;
    try {
      const res = await api.delete(`${endpoint}?id=${id}`);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        loadAdminData();
      }
    } catch (err) {
      setError('Delete request failed.');
    }
  };

  // Form submissions
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editId) {
        res = await api.put(`/courses.php?id=${editId}`, courseForm);
      } else {
        res = await api.post('/courses.php', courseForm);
      }
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setShowModal(null);
        setEditId(null);
        setCourseForm({ title: '', description: '', instructor: '', duration: '', category: 'Web Development', image_url: '' });
        loadAdminData();
      }
    } catch (err) {
      setError('Failed to save course.');
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editId) {
        res = await api.put(`/jobs.php?id=${editId}`, jobForm);
      } else {
        res = await api.post('/jobs.php', jobForm);
      }
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setShowModal(null);
        setEditId(null);
        setJobForm({ title: '', company: '', description: '', requirements: '', salary: '', location: '', job_type: 'Full-time', deadline: '' });
        loadAdminData();
      }
    } catch (err) {
      setError('Failed to save job posting.');
    }
  };

  const handleInternSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editId) {
        res = await api.put(`/internships.php?id=${editId}`, internForm);
      } else {
        res = await api.post('/internships.php', internForm);
      }
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setShowModal(null);
        setEditId(null);
        setInternForm({ title: '', company: '', description: '', requirements: '', duration: '', stipend: '', location: '', deadline: '' });
        loadAdminData();
      }
    } catch (err) {
      setError('Failed to save internship.');
    }
  };

  const handlePlacementSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/placement.php', placementForm);
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setShowModal(null);
        setPlacementForm({ title: '', category: 'dsa', content: '', resource_url: '' });
        loadAdminData();
      }
    } catch (err) {
      setError('Failed to create resource.');
    }
  };

  // Open Edit modes
  const openEditCourse = (course) => {
    setEditId(course.id);
    setCourseForm({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      category: course.category,
      image_url: course.image_url || ''
    });
    setShowModal('course');
  };

  const openEditJob = (job) => {
    setEditId(job.id);
    setJobForm({
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
      salary: job.salary,
      location: job.location,
      job_type: job.job_type,
      deadline: job.deadline
    });
    setShowModal('job');
  };

  const openEditIntern = (intern) => {
    setEditId(intern.id);
    setInternForm({
      title: intern.title,
      company: intern.company,
      description: intern.description,
      requirements: intern.requirements,
      duration: intern.duration,
      stipend: intern.stipend,
      location: intern.location,
      deadline: intern.deadline
    });
    setShowModal('internship');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-white" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-secondary">Gathering system logs & datasets...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1"><i className="bi bi-shield-lock-fill text-warning me-2"></i>Admin Dashboard</h2>
          <p className="text-secondary mb-0">Platform CRUD controls, analytics dashboard, and application validations.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button onClick={() => { setEditId(null); setShowModal('course'); }} className="btn btn-primary-custom btn-sm">Add Course</button>
          <button onClick={() => { setEditId(null); setShowModal('job'); }} className="btn btn-secondary-custom btn-sm">Add Job</button>
          <button onClick={() => { setEditId(null); setShowModal('internship'); }} className="btn btn-outline-light border-secondary text-white btn-sm">Add Internship</button>
          <button onClick={() => { setShowModal('placement'); }} className="btn btn-outline-warning border-warning text-warning btn-sm">Add Prep Resource</button>
        </div>
      </div>

      {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small mb-4">{error}</div>}
      {successMsg && (
        <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white py-2 small mb-4 d-flex justify-content-between align-items-center">
          <span>{successMsg}</span>
          <button className="btn btn-link p-0 text-white text-decoration-none" onClick={() => setSuccessMsg('')}>✕</button>
        </div>
      )}

      {/* Main Tab Controls */}
      <div className="glass-card-no-hover p-2 mb-4">
        <ul className="nav nav-pills gap-1 flex-wrap">
          <li className="nav-item">
            <button onClick={() => setActiveTab('analytics')} className={`nav-link text-white py-2 px-3 small ${activeTab === 'analytics' ? 'bg-primary' : ''}`}>
              <i className="bi bi-bar-chart-line me-1"></i> Analytics
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => setActiveTab('users')} className={`nav-link text-white py-2 px-3 small ${activeTab === 'users' ? 'bg-primary' : ''}`}>
              <i className="bi bi-people me-1"></i> Users
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => setActiveTab('apps')} className={`nav-link text-white py-2 px-3 small ${activeTab === 'apps' ? 'bg-primary' : ''}`}>
              <i className="bi bi-file-earmark-check me-1"></i> Applications
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => setActiveTab('courses')} className={`nav-link text-white py-2 px-3 small ${activeTab === 'courses' ? 'bg-primary' : ''}`}>
              <i className="bi bi-laptop me-1"></i> Courses
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => setActiveTab('notes')} className={`nav-link text-white py-2 px-3 small ${activeTab === 'notes' ? 'bg-primary' : ''}`}>
              <i className="bi bi-file-earmark-arrow-up me-1"></i> Notes & Projects
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => setActiveTab('jobs')} className={`nav-link text-white py-2 px-3 small ${activeTab === 'jobs' ? 'bg-primary' : ''}`}>
              <i className="bi bi-briefcase me-1"></i> Jobs & Interns
            </button>
          </li>
          <li className="nav-item">
            <button onClick={() => setActiveTab('prep')} className={`nav-link text-white py-2 px-3 small ${activeTab === 'prep' ? 'bg-primary' : ''}`}>
              <i className="bi bi-mortarboard me-1"></i> Placement Prep
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Panels */}
      
      {/* 1. ANALYTICS PANEL */}
      {activeTab === 'analytics' && (
        <div>
          {/* Global statistics widgets */}
          <div className="row g-3 mb-4">
            <div className="col-lg-2 col-md-4 col-6">
              <div className="glass-card p-3 text-center">
                <h3 className="fw-bold text-white mb-0">{counters.students}</h3>
                <small className="text-secondary small">Students</small>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className="glass-card p-3 text-center">
                <h3 className="fw-bold text-primary mb-0">{counters.courses}</h3>
                <small className="text-secondary small">Courses</small>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className="glass-card p-3 text-center">
                <h3 className="fw-bold text-success mb-0">{counters.applications}</h3>
                <small className="text-secondary small">Applications</small>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className="glass-card p-3 text-center">
                <h3 className="fw-bold text-warning mb-0">{counters.notes}</h3>
                <small className="text-secondary small">Notes Shared</small>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className="glass-card p-3 text-center">
                <h3 className="fw-bold text-info mb-0">{counters.jobs}</h3>
                <small className="text-secondary small">Job Posts</small>
              </div>
            </div>
            <div className="col-lg-2 col-md-4 col-6">
              <div className="glass-card p-3 text-center">
                <h3 className="fw-bold text-white mb-0">{counters.internships}</h3>
                <small className="text-secondary small">Internships</small>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Chart 1: User Registrations Trend */}
            <div className="col-lg-7">
              <div className="glass-card p-4 h-100">
                <h6 className="fw-semibold text-white mb-3">User Registration Trends</h6>
                <div style={{ height: '280px' }}>
                  <Line 
                    data={regTrendData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
                        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } }
                      },
                      plugins: { legend: { display: false } }
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Chart 2: Application Type distribution */}
            <div className="col-lg-5">
              <div className="glass-card p-4 h-100">
                <h6 className="fw-semibold text-white mb-3">Applications distribution</h6>
                <div className="d-flex justify-content-center align-items-center" style={{ height: '280px' }}>
                  <div style={{ width: '220px' }}>
                    <Doughnut 
                      data={appsBreakdownData}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 3: Notes category shares */}
            <div className="col-lg-6">
              <div className="glass-card p-4">
                <h6 className="fw-semibold text-white mb-3">Notes Shared by Category</h6>
                <div style={{ height: '260px' }}>
                  <Bar 
                    data={notesCatData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
                        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } }
                      },
                      plugins: { legend: { display: false } }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Chart 4: Jobs vs Internships postings comparison */}
            <div className="col-lg-6">
              <div className="glass-card p-4">
                <h6 className="fw-semibold text-white mb-3">Hiring Opportunities Ratio</h6>
                <div className="d-flex justify-content-center align-items-center" style={{ height: '260px' }}>
                  <div style={{ width: '200px' }}>
                    <Pie 
                      data={postsBreakdownData}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. USERS MANAGEMENT PANEL */}
      {activeTab === 'users' && (
        <div className="glass-card p-4">
          <h5 className="fw-semibold text-white mb-3"><i className="bi bi-people-fill me-2"></i>Ecosystem Users</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover border-secondary mb-0 align-middle">
              <thead>
                <tr className="text-secondary border-secondary">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-secondary">
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {u.profile_pic ? (
                          <img src={`http://localhost:8000/${u.profile_pic}`} alt="" className="rounded-circle object-fit-cover" style={{ width: '30px', height: '30px' }} />
                        ) : (
                          <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="fw-semibold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td className="text-capitalize">
                      <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'} badge-custom`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.is_verified == 1 ? (
                        <span className="text-success"><i className="bi bi-patch-check-fill me-1"></i>Verified</span>
                      ) : (
                        <span className="text-muted"><i className="bi bi-patch-minus me-1"></i>Pending</span>
                      )}
                    </td>
                    <td className="small text-secondary">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleUserRoleToggle(u.id, u.role)} 
                        className="btn btn-outline-light btn-sm border-secondary text-white me-2 py-1"
                        title="Toggle Admin Privilege"
                      >
                        Change Role
                      </button>
                      <button 
                        onClick={() => handleUserDelete(u.id)} 
                        className="btn btn-outline-danger btn-sm border-danger text-danger py-1"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. APPLICATIONS PANEL */}
      {activeTab === 'apps' && (
        <div className="glass-card p-4">
          <h5 className="fw-semibold text-white mb-3"><i className="bi bi-file-earmark-check-fill me-2"></i>Student Submissions</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover border-secondary mb-0 align-middle">
              <thead>
                <tr className="text-secondary border-secondary">
                  <th>Student</th>
                  <th>Role Applied</th>
                  <th>Company</th>
                  <th>Submitted Date</th>
                  <th>Resume</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} className="border-secondary">
                    <td>
                      <div className="fw-semibold text-white">{app.student_name}</div>
                      <div className="small text-secondary">{app.student_email}</div>
                    </td>
                    <td>
                      <span className={`badge me-1 ${app.type === 'job' ? 'bg-primary' : 'bg-success'} badge-custom`}>{app.type}</span>
                      <span className="fw-semibold text-white">{app.position_title}</span>
                    </td>
                    <td>{app.company_name}</td>
                    <td className="small text-secondary">{new Date(app.applied_at).toLocaleString()}</td>
                    <td>
                      <a href={`http://localhost:8000/${app.resume_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-warning btn-sm border-warning text-warning py-1 px-2">
                        <i className="bi bi-file-earmark-pdf"></i> Download
                      </a>
                    </td>
                    <td>
                      <span className={`badge bg-opacity-25 border badge-custom
                        ${app.status === 'accepted' ? 'bg-success text-success border-success' : ''}
                        ${app.status === 'rejected' ? 'bg-danger text-danger border-danger' : ''}
                        ${app.status === 'reviewed' ? 'bg-warning text-warning border-warning' : ''}
                        ${app.status === 'pending' ? 'bg-secondary text-white border-secondary' : ''}
                      `}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div className="dropdown">
                        <button className="btn btn-outline-light btn-sm border-secondary dropdown-toggle text-white py-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          Modify Status
                        </button>
                        <ul className="dropdown-menu dropdown-menu-dark border-secondary bg-dark">
                          <li><button onClick={() => handleApplicationStatus(app.id, 'reviewed')} className="dropdown-item">Mark Reviewed</button></li>
                          <li><button onClick={() => handleApplicationStatus(app.id, 'accepted')} className="dropdown-item text-success">Approve / Accept</button></li>
                          <li><button onClick={() => handleApplicationStatus(app.id, 'rejected')} className="dropdown-item text-danger">Reject</button></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. COURSES MANAGEMENT */}
      {activeTab === 'courses' && (
        <div className="glass-card p-4">
          <h5 className="fw-semibold text-white mb-3"><i className="bi bi-laptop-fill me-2"></i>Platform Courses</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover border-secondary mb-0 align-middle">
              <thead>
                <tr className="text-secondary border-secondary">
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id} className="border-secondary">
                    <td>
                      <div className="fw-semibold text-white">{course.title}</div>
                      <div className="small text-secondary text-truncate" style={{ maxWidth: '300px' }}>{course.description}</div>
                    </td>
                    <td>{course.instructor}</td>
                    <td><span className="badge bg-secondary badge-custom">{course.category}</span></td>
                    <td>{course.duration}</td>
                    <td>
                      <button onClick={() => openEditCourse(course)} className="btn btn-outline-light btn-sm border-secondary text-white me-2 py-1">Edit</button>
                      <button onClick={() => handleDeleteItem('/courses.php', course.id)} className="btn btn-outline-danger btn-sm border-danger text-danger py-1">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. NOTES & PROJECTS PANEL */}
      {activeTab === 'notes' && (
        <div>
          {/* Notes list */}
          <div className="glass-card p-4 mb-4">
            <h5 className="fw-semibold text-white mb-3"><i className="bi bi-file-earmark-text-fill me-2"></i>Shared Lecture Notes</h5>
            <div className="table-responsive">
              <table className="table table-dark table-hover border-secondary mb-0 align-middle">
                <thead>
                  <tr className="text-secondary border-secondary">
                    <th>Notes Title</th>
                    <th>Category</th>
                    <th>Uploaded By</th>
                    <th>File</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map(n => (
                    <tr key={n.id} className="border-secondary">
                      <td>
                        <div className="fw-semibold text-white">{n.title}</div>
                        <div className="small text-secondary">{n.description}</div>
                      </td>
                      <td><span className="badge bg-info bg-opacity-25 text-info border border-info badge-custom">{n.category}</span></td>
                      <td>{n.uploader_name}</td>
                      <td>
                        <a href={`http://localhost:8000/${n.file_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-sm border-secondary text-white py-1 px-2">
                          <i className="bi bi-file-earmark-arrow-down-fill text-warning"></i> View
                        </a>
                      </td>
                      <td>
                        <button onClick={() => handleDeleteItem('/notes.php', n.id)} className="btn btn-outline-danger btn-sm border-danger text-danger py-1">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Projects list */}
          <div className="glass-card p-4">
            <h5 className="fw-semibold text-white mb-3"><i className="bi bi-code-slash me-2"></i>Student Projects Showcase</h5>
            <div className="table-responsive">
              <table className="table table-dark table-hover border-secondary mb-0 align-middle">
                <thead>
                  <tr className="text-secondary border-secondary">
                    <th>Project</th>
                    <th>Tech Stack</th>
                    <th>Developer</th>
                    <th>External Links</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id} className="border-secondary">
                      <td>
                        <div className="fw-semibold text-white">{p.title}</div>
                        <div className="small text-secondary">{p.description}</div>
                      </td>
                      <td>{p.tech_stack}</td>
                      <td>{p.student_name}</td>
                      <td>
                        <div className="d-flex gap-2">
                          {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-sm border-secondary text-white py-1"><i className="bi bi-github"></i> Git</a>}
                          {p.demo_url && <a href={p.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-sm border-secondary text-white py-1"><i className="bi bi-globe"></i> Demo</a>}
                        </div>
                      </td>
                      <td>
                        <button onClick={() => handleDeleteItem('/projects.php', p.id)} className="btn btn-outline-danger btn-sm border-danger text-danger py-1">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. JOBS & INTERNSHIPS PANEL */}
      {activeTab === 'jobs' && (
        <div>
          {/* Jobs Listing */}
          <div className="glass-card p-4 mb-4">
            <h5 className="fw-semibold text-white mb-3"><i className="bi bi-briefcase-fill me-2"></i>Job Postings</h5>
            <div className="table-responsive">
              <table className="table table-dark table-hover border-secondary mb-0 align-middle">
                <thead>
                  <tr className="text-secondary border-secondary">
                    <th>Title</th>
                    <th>Company</th>
                    <th>Salary</th>
                    <th>Location & Type</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id} className="border-secondary">
                      <td><div className="fw-semibold text-white">{job.title}</div></td>
                      <td>{job.company}</td>
                      <td>{job.salary}</td>
                      <td>{job.location} | <span className="small text-secondary">{job.job_type}</span></td>
                      <td className="small text-secondary">{job.deadline}</td>
                      <td>
                        <button onClick={() => openEditJob(job)} className="btn btn-outline-light btn-sm border-secondary text-white me-2 py-1">Edit</button>
                        <button onClick={() => handleDeleteItem('/jobs.php', job.id)} className="btn btn-outline-danger btn-sm border-danger text-danger py-1">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Internships Listing */}
          <div className="glass-card p-4">
            <h5 className="fw-semibold text-white mb-3"><i className="bi bi-mortarboard-fill me-2"></i>Internship Postings</h5>
            <div className="table-responsive">
              <table className="table table-dark table-hover border-secondary mb-0 align-middle">
                <thead>
                  <tr className="text-secondary border-secondary">
                    <th>Title</th>
                    <th>Company</th>
                    <th>Stipend</th>
                    <th>Duration & Location</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {internships.map(intern => (
                    <tr key={intern.id} className="border-secondary">
                      <td><div className="fw-semibold text-white">{intern.title}</div></td>
                      <td>{intern.company}</td>
                      <td>{intern.stipend}</td>
                      <td>{intern.duration} | <span className="small text-secondary">{intern.location}</span></td>
                      <td className="small text-secondary">{intern.deadline}</td>
                      <td>
                        <button onClick={() => openEditIntern(intern)} className="btn btn-outline-light btn-sm border-secondary text-white me-2 py-1">Edit</button>
                        <button onClick={() => handleDeleteItem('/internships.php', intern.id)} className="btn btn-outline-danger btn-sm border-danger text-danger py-1">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. PLACEMENT PREP PANEL */}
      {activeTab === 'prep' && (
        <div className="glass-card p-4">
          <h5 className="fw-semibold text-white mb-3"><i className="bi bi-mortarboard-fill me-2"></i>Placement Prep Resources</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover border-secondary mb-0 align-middle">
              <thead>
                <tr className="text-secondary border-secondary">
                  <th>Title</th>
                  <th>Category</th>
                  <th>Content Summary</th>
                  <th>Url</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {placementResources.map(res => (
                  <tr key={res.id} className="border-secondary">
                    <td><div className="fw-semibold text-white">{res.title}</div></td>
                    <td className="text-uppercase"><span className="badge bg-secondary badge-custom">{res.category}</span></td>
                    <td><div className="small text-secondary text-truncate" style={{ maxWidth: '300px' }}>{res.content}</div></td>
                    <td>{res.resource_url ? <a href={res.resource_url} target="_blank" rel="noopener noreferrer" className="small text-primary">{res.resource_url}</a> : '-'}</td>
                    <td>
                      <button onClick={() => handleDeleteItem('/placement.php', res.id)} className="btn btn-outline-danger btn-sm border-danger text-danger py-1">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* CRUD MODALS (DYNAMICALLY OVERLAID) */}
      
      {/* 1. COURSE FORM MODAL */}
      {showModal === 'course' && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card-no-hover border-secondary text-white">
              <div className="modal-header border-secondary p-4">
                <h5 className="modal-title fw-bold">{editId ? 'Edit Course' : 'Create Course'}</h5>
                <button type="button" onClick={() => setShowModal(null)} className="btn-close btn-close-white"></button>
              </div>
              <form onSubmit={handleCourseSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small">Course Title</label>
                    <input type="text" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} className="form-control form-control-custom text-white" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Description</label>
                    <textarea rows="3" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} className="form-control form-control-custom text-white" required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small">Instructor Name</label>
                      <input type="text" value={courseForm.instructor} onChange={e => setCourseForm({ ...courseForm, instructor: e.target.value })} className="form-control form-control-custom text-white" required />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Duration</label>
                      <input type="text" value={courseForm.duration} onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })} className="form-control form-control-custom text-white" placeholder="e.g. 10 Weeks" required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Category</label>
                    <select value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })} className="form-select form-control-custom bg-dark text-white">
                      <option value="Web Development">Web Development</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Cloud Computing">Cloud Computing</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Course Image URL</label>
                    <input type="url" value={courseForm.image_url} onChange={e => setCourseForm({ ...courseForm, image_url: e.target.value })} className="form-control form-control-custom text-white" placeholder="https://unsplash.com/..." />
                  </div>
                </div>
                <div className="modal-footer border-secondary p-4">
                  <button type="button" onClick={() => setShowModal(null)} className="btn btn-outline-light border-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Save Course</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. JOB FORM MODAL */}
      {showModal === 'job' && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content glass-card-no-hover border-secondary text-white">
              <div className="modal-header border-secondary p-4">
                <h5 className="modal-title fw-bold">{editId ? 'Edit Job Posting' : 'Add Job Posting'}</h5>
                <button type="button" onClick={() => setShowModal(null)} className="btn-close btn-close-white"></button>
              </div>
              <form onSubmit={handleJobSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small">Job Title</label>
                      <input type="text" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} className="form-control form-control-custom text-white" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">Company Name</label>
                      <input type="text" value={jobForm.company} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} className="form-control form-control-custom text-white" required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Description</label>
                    <textarea rows="3" value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} className="form-control form-control-custom text-white" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Requirements</label>
                    <textarea rows="2" value={jobForm.requirements} onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })} className="form-control form-control-custom text-white" placeholder="HTML, CSS, Git, SQL..." required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small">Salary ($/Year)</label>
                      <input type="text" value={jobForm.salary} onChange={e => setJobForm({ ...jobForm, salary: e.target.value })} className="form-control form-control-custom text-white" placeholder="e.g. $70,000/Year" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Location</label>
                      <input type="text" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} className="form-control form-control-custom text-white" placeholder="e.g. San Francisco, CA" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Job Type</label>
                      <select value={jobForm.job_type} onChange={e => setJobForm({ ...jobForm, job_type: e.target.value })} className="form-select form-control-custom bg-dark text-white">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Deadline</label>
                    <input type="date" value={jobForm.deadline} onChange={e => setJobForm({ ...jobForm, deadline: e.target.value })} className="form-control form-control-custom text-white" required />
                  </div>
                </div>
                <div className="modal-footer border-secondary p-4">
                  <button type="button" onClick={() => setShowModal(null)} className="btn btn-outline-light border-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Save Job</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTERNSHIP FORM MODAL */}
      {showModal === 'internship' && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content glass-card-no-hover border-secondary text-white">
              <div className="modal-header border-secondary p-4">
                <h5 className="modal-title fw-bold">{editId ? 'Edit Internship Posting' : 'Add Internship Posting'}</h5>
                <button type="button" onClick={() => setShowModal(null)} className="btn-close btn-close-white"></button>
              </div>
              <form onSubmit={handleInternSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small">Internship Title</label>
                      <input type="text" value={internForm.title} onChange={e => setInternForm({ ...internForm, title: e.target.value })} className="form-control form-control-custom text-white" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">Company Name</label>
                      <input type="text" value={internForm.company} onChange={e => setInternForm({ ...internForm, company: e.target.value })} className="form-control form-control-custom text-white" required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Description</label>
                    <textarea rows="3" value={internForm.description} onChange={e => setInternForm({ ...internForm, description: e.target.value })} className="form-control form-control-custom text-white" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Requirements</label>
                    <textarea rows="2" value={internForm.requirements} onChange={e => setInternForm({ ...internForm, requirements: e.target.value })} className="form-control form-control-custom text-white" required />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small">Stipend ($/Month)</label>
                      <input type="text" value={internForm.stipend} onChange={e => setInternForm({ ...internForm, stipend: e.target.value })} className="form-control form-control-custom text-white" placeholder="e.g. $800/Month" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Duration</label>
                      <input type="text" value={internForm.duration} onChange={e => setInternForm({ ...internForm, duration: e.target.value })} className="form-control form-control-custom text-white" placeholder="e.g. 3 Months" required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Location</label>
                      <input type="text" value={internForm.location} onChange={e => setInternForm({ ...internForm, location: e.target.value })} className="form-control form-control-custom text-white" placeholder="e.g. Remote" required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Deadline</label>
                    <input type="date" value={internForm.deadline} onChange={e => setInternForm({ ...internForm, deadline: e.target.value })} className="form-control form-control-custom text-white" required />
                  </div>
                </div>
                <div className="modal-footer border-secondary p-4">
                  <button type="button" onClick={() => setShowModal(null)} className="btn btn-outline-light border-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Save Internship</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. PLACEMENT RESOURCE MODAL */}
      {showModal === 'placement' && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card-no-hover border-secondary text-white">
              <div className="modal-header border-secondary p-4">
                <h5 className="modal-title fw-bold">Add Prep Resource</h5>
                <button type="button" onClick={() => setShowModal(null)} className="btn-close btn-close-white"></button>
              </div>
              <form onSubmit={handlePlacementSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small">Resource Title</label>
                    <input type="text" value={placementForm.title} onChange={e => setPlacementForm({ ...placementForm, title: e.target.value })} className="form-control form-control-custom text-white" placeholder="e.g. Quantitative Shortcuts" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Category</label>
                    <select value={placementForm.category} onChange={e => setPlacementForm({ ...placementForm, category: e.target.value })} className="form-select form-control-custom bg-dark text-white">
                      <option value="dsa">DSA Resources</option>
                      <option value="aptitude">Aptitude Resources</option>
                      <option value="interview">Interview Questions</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Content (Markdown or Text)</label>
                    <textarea rows="4" value={placementForm.content} onChange={e => setPlacementForm({ ...placementForm, content: e.target.value })} className="form-control form-control-custom text-white" placeholder="Explain the resource in details..." required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">External Link URL (Optional)</label>
                    <input type="url" value={placementForm.resource_url} onChange={e => setPlacementForm({ ...placementForm, resource_url: e.target.value })} className="form-control form-control-custom text-white" placeholder="https://leetcode.com/..." />
                  </div>
                </div>
                <div className="modal-footer border-secondary p-4">
                  <button type="button" onClick={() => setShowModal(null)} className="btn btn-outline-light border-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Save Resource</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
