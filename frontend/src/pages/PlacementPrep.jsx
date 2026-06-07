import React, { useState, useEffect } from 'react';
import api from '../helpers/api';

const PlacementPrep = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('dsa'); // 'dsa', 'aptitude', 'interview'
  const [error, setError] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/placement.php', {
        params: { search, category }
      });
      if (response.data.success) {
        setResources(response.data.resources);
      }
    } catch (err) {
      console.error(err);
      setError('Error loading placement preparation assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResources();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <span className="badge bg-secondary bg-opacity-25 border border-secondary text-white px-3 py-2 badge-custom mb-3">
          🎓 Placement Readiness
        </span>
        <h1 className="fw-extrabold text-white mb-2">Placement Preparation Hub</h1>
        <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '600px' }}>
          Master technical examinations with data structures tutorials, quantitative screening sheets, and standard software engineering interview solutions.
        </p>
      </div>

      {/* Tabs list */}
      <div className="glass-card-no-hover p-2 mb-4 d-flex justify-content-center">
        <ul className="nav nav-pills gap-2 flex-nowrap" style={{ overflowX: 'auto' }}>
          <li className="nav-item">
            <button 
              onClick={() => { setCategory('dsa'); setSearch(''); }} 
              className={`nav-link text-white px-4 py-2 small fw-semibold ${category === 'dsa' ? 'bg-primary' : 'bg-transparent'}`}
            >
              <i className="bi bi-code-square me-2"></i> DSA Resources
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => { setCategory('aptitude'); setSearch(''); }} 
              className={`nav-link text-white px-4 py-2 small fw-semibold ${category === 'aptitude' ? 'bg-primary' : 'bg-transparent'}`}
            >
              <i className="bi bi-calculator me-2"></i> Aptitude Resources
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => { setCategory('interview'); setSearch(''); }} 
              className={`nav-link text-white px-4 py-2 small fw-semibold ${category === 'interview' ? 'bg-primary' : 'bg-transparent'}`}
            >
              <i className="bi bi-chat-left-quote me-2"></i> Interview Prep
            </button>
          </li>
        </ul>
      </div>

      {/* Search Bar */}
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
            placeholder={`Search titles or solutions within ${category.toUpperCase()} category...`} 
          />
        </div>
      </div>

      {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small mb-4">{error}</div>}

      {loading ? (
        <div className="text-center text-white py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center text-muted py-5 glass-card p-5">
          <i className="bi bi-journal-code fs-1 d-block mb-3 text-secondary"></i>
          No prep resources found for the active filter.
        </div>
      ) : (
        <div className="row g-4">
          {resources.map((res) => (
            <div className="col-12" key={res.id}>
              <div className="glass-card p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h5 className="fw-bold text-white mb-1">{res.title}</h5>
                    <span className="text-capitalize small text-primary fw-semibold"><i className="bi bi-hash text-warning me-1"></i>Track: {res.category}</span>
                  </div>
                  {res.resource_url && (
                    <a 
                      href={res.resource_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary-custom btn-sm px-3"
                    >
                      Open Worksheets <i className="bi bi-box-arrow-up-right ms-1"></i>
                    </a>
                  )}
                </div>
                
                {/* Preformatted Content displaying code snippets or formulas cleanly */}
                <div className="p-3 bg-dark bg-opacity-50 border border-secondary rounded text-secondary" style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {res.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default PlacementPrep;
