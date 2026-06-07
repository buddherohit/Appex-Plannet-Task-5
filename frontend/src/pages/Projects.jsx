import React, { useState, useEffect } from 'react';
import api from '../helpers/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search/Filters states
  const [search, setSearch] = useState('');

  // Upload states
  const [showUpload, setShowUpload] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tech_stack: '',
    github_url: '',
    demo_url: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/projects.php', {
        params: { search }
      });
      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (err) {
      console.error(err);
      setError('Error loading project showcase entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/projects.php', projectForm);
      if (response.data.success) {
        setSuccess('Project showcase uploaded and listed successfully!');
        setProjectForm({ title: '', description: '', tech_stack: '', github_url: '', demo_url: '' });
        setShowUpload(false);
        fetchProjects();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit project showcase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5 text-center text-md-start">
        <div>
          <span className="badge bg-secondary bg-opacity-25 border border-secondary text-white px-3 py-2 badge-custom mb-3 d-inline-block">
            💻 Capstone Showcase
          </span>
          <h1 className="fw-extrabold text-white mb-2">Student Project Portfolios</h1>
          <p className="text-secondary mb-0" style={{ maxWidth: '600px' }}>
            Browse through software development capstone codebases, view Live demos, inspect Github repositories, and contact creators.
          </p>
        </div>
        <div>
          <button onClick={() => { setShowUpload(true); setError(''); setSuccess(''); }} className="btn btn-primary-custom px-4 py-3 text-nowrap">
            <i className="bi bi-cloud-plus-fill me-1"></i> Showcase Project
          </button>
        </div>
      </div>

      {success && <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white py-2 small mb-4">{success}</div>}
      {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small mb-4">{error}</div>}

      {/* Global Search Header */}
      <div className="glass-card-no-hover p-4 mb-5">
        <div className="input-group">
          <span className="input-group-text bg-transparent border-secondary text-secondary border-end-0">
            <i className="bi bi-search"></i>
          </span>
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="form-control form-control-custom text-white border-start-0" 
            placeholder="Search projects by title, description, or technology stacks (e.g. React, Docker)..." 
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center text-muted py-5 glass-card p-5">
          <i className="bi bi-code-slash fs-1 d-block mb-3 text-secondary"></i>
          No student projects found matching your search.
        </div>
      ) : (
        <div className="row g-4">
          {projects.map((project) => (
            <div className="col-md-6 col-lg-4" key={project.id}>
              <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <h5 className="fw-bold text-white mb-1">{project.title}</h5>
                  <small className="text-muted d-block mb-3">By student: <span className="text-secondary">{project.student_name}</span></small>
                  
                  <p className="text-secondary small mb-3">{project.description}</p>
                  
                  <div className="mb-4">
                    <strong className="text-white small d-block mb-2">Technologies Used:</strong>
                    <div className="d-flex flex-wrap gap-1">
                      {project.tech_stack.split(',').map((tech, i) => (
                        <span key={i} className="badge bg-secondary bg-opacity-15 border border-secondary text-secondary badge-custom py-1 px-2">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-top border-secondary border-opacity-25 pt-3 d-flex align-items-center justify-content-between">
                  <span className="text-muted small">Released {new Date(project.created_at).toLocaleDateString()}</span>
                  
                  <div className="d-flex gap-2">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-sm border-secondary text-white">
                        <i className="bi bi-github"></i> Repository
                      </a>
                    )}
                    {project.demo_url && (
                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary-custom btn-sm">
                        <i className="bi bi-box-arrow-up-right"></i> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Project Showcase Modal */}
      {showUpload && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card-no-hover border-secondary text-white">
              <div className="modal-header border-secondary p-4">
                <h5 className="modal-title fw-bold">Showcase Your Project</h5>
                <button type="button" onClick={() => setShowUpload(false)} className="btn-close btn-close-white"></button>
              </div>
              <form onSubmit={handleUploadSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-white small">Project Title</label>
                    <input 
                      type="text" 
                      value={projectForm.title} 
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} 
                      className="form-control form-control-custom text-white" 
                      placeholder="e.g. ChatRoom App" 
                      required 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white small">Description</label>
                    <textarea 
                      rows="3" 
                      value={projectForm.description} 
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} 
                      className="form-control form-control-custom text-white" 
                      placeholder="Write details about your build..." 
                      required 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white small">Tech Stack (Comma-separated)</label>
                    <input 
                      type="text" 
                      value={projectForm.tech_stack} 
                      onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })} 
                      className="form-control form-control-custom text-white" 
                      placeholder="e.g. React, Node, Socket.io" 
                      required 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white small">GitHub Repository URL (Optional)</label>
                    <input 
                      type="url" 
                      value={projectForm.github_url} 
                      onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })} 
                      className="form-control form-control-custom text-white" 
                      placeholder="https://github.com/username/project" 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white small">Live Demo URL (Optional)</label>
                    <input 
                      type="url" 
                      value={projectForm.demo_url} 
                      onChange={(e) => setProjectForm({ ...projectForm, demo_url: e.target.value })} 
                      className="form-control form-control-custom text-white" 
                      placeholder="https://project-demo.vercel.app" 
                    />
                  </div>
                </div>
                <div className="modal-footer border-secondary p-4">
                  <button type="button" onClick={() => setShowUpload(false)} className="btn btn-outline-light border-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary-custom">
                    {submitting ? 'Submitting...' : 'Upload Showcase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Projects;
