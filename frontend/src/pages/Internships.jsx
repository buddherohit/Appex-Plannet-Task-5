import React, { useState, useEffect } from 'react';
import api from '../helpers/api';

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Apply Modal states
  const [applyItem, setApplyItem] = useState(null); // the internship currently being applied to
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);

  const locations = ['All', 'Remote', 'Bangalore, India', 'Noida, India', 'New York, NY', 'San Francisco, CA'];

  const fetchInternships = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/internships.php', {
        params: { search, location }
      });
      if (response.data.success) {
        setInternships(response.data.internships);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load internships catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInternships();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, location]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Resume size too large. Max 5MB allowed.');
        return;
      }
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx'].includes(ext)) {
        setError('Invalid file format. Only PDF and DOCX files are allowed.');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Please choose a resume file to upload.');
      return;
    }
    setApplying(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('type', 'internship');
    formData.append('post_id', applyItem.id);
    formData.append('resume', resumeFile);

    try {
      const response = await api.post('/applications.php', formData);
      if (response.data.success) {
        setSuccess(`Application submitted successfully for ${applyItem.title} at ${applyItem.company}!`);
        setApplyItem(null);
        setResumeFile(null);
        // Clear message after 3 seconds
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <span className="badge bg-secondary bg-opacity-25 border border-secondary text-white px-3 py-2 badge-custom mb-3">
          💼 Internship Portal
        </span>
        <h1 className="fw-extrabold text-white mb-2">Explore Internships</h1>
        <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '600px' }}>
          Kickstart your career path with industry-level internship postings from tech and marketing companies globally.
        </p>
      </div>

      {success && <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white py-2 small mb-4">{success}</div>}
      {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small mb-4">{error}</div>}

      {/* Filter Options */}
      <div className="glass-card-no-hover p-4 mb-5">
        <div className="row g-3">
          <div className="col-md-7">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-secondary text-secondary border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="form-control form-control-custom text-white border-start-0" 
                placeholder="Search positions, companies, or requirements..." 
              />
            </div>
          </div>
          <div className="col-md-5">
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small text-nowrap">Location:</span>
              <select 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                className="form-select form-control-custom bg-dark text-white"
              >
                {locations.map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : internships.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-briefcase fs-1 d-block mb-3 text-secondary"></i>
          No internship postings found.
        </div>
      ) : (
        <div className="row g-4">
          {internships.map((intern) => (
            <div className="col-lg-6" key={intern.id}>
              <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold text-white mb-0">{intern.title}</h5>
                      <span className="text-primary small fw-semibold">{intern.company}</span>
                    </div>
                    <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary badge-custom">
                      <i className="bi bi-geo-alt me-1 text-primary"></i>{intern.location}
                    </span>
                  </div>

                  <p className="text-secondary small mb-3">{intern.description}</p>
                  
                  <div className="mb-4">
                    <strong className="text-white small d-block mb-2">Requirements:</strong>
                    <div className="d-flex flex-wrap gap-1">
                      {intern.requirements.split(',').map((req, i) => (
                        <span key={i} className="badge bg-dark border border-secondary text-secondary badge-custom py-1 px-2">
                          {req.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-top border-secondary border-opacity-25 pt-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex gap-4">
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Stipend</small>
                      <span className="text-success small fw-bold">{intern.stipend}</span>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Duration</small>
                      <span className="text-white small fw-semibold">{intern.duration}</span>
                    </div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Apply Before</small>
                      <span className="text-danger small fw-semibold">{new Date(intern.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setApplyItem(intern); setError(''); }} 
                    className="btn btn-primary-custom btn-sm px-3"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Form Modal */}
      {applyItem && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card-no-hover border-secondary text-white">
              <div className="modal-header border-secondary p-4">
                <h5 className="modal-title fw-bold">Apply for Position</h5>
                <button type="button" onClick={() => setApplyItem(null)} className="btn-close btn-close-white"></button>
              </div>
              <form onSubmit={handleApplySubmit}>
                <div className="modal-body p-4">
                  <p className="text-secondary small mb-3">
                    You are applying to <strong>{applyItem.title}</strong> at <strong>{applyItem.company}</strong>.
                  </p>
                  
                  {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small mb-3">{error}</div>}

                  <div className="mb-4">
                    <label className="form-label text-white small">Upload Resume (PDF, DOCX)</label>
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      className="form-control form-control-custom text-white" 
                      accept=".pdf,.docx"
                      required 
                    />
                    <small className="text-muted d-block mt-2">Maximum file size allowed: 5MB.</small>
                  </div>
                </div>
                <div className="modal-footer border-secondary p-4">
                  <button type="button" onClick={() => setApplyItem(null)} className="btn btn-outline-light border-secondary">Cancel</button>
                  <button type="submit" disabled={applying} className="btn btn-primary-custom">
                    {applying ? 'Submitting...' : 'Submit Application'}
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

export default Internships;
