import React, { useState, useEffect } from 'react';
import api from '../helpers/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');

  const categories = ['All', 'Web Development', 'Computer Science', 'Data Science', 'Cloud Computing'];

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/courses.php', {
        params: { search, category }
      });
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search input
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <span className="badge bg-secondary bg-opacity-25 border border-secondary text-white px-3 py-2 badge-custom mb-3">
          📚 Learning Catalog
        </span>
        <h1 className="fw-extrabold text-white mb-2">Explore Technical Courses</h1>
        <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '600px' }}>
          Accelerate your skills with curated engineering tracks focusing on frontend, backend, computer science algorithms, and cloud systems.
        </p>
      </div>

      {/* Search & Category Filter Header */}
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
                placeholder="Search course title, description, or instructor..." 
              />
            </div>
          </div>
          <div className="col-md-5">
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small text-nowrap">Filter by:</span>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="form-select form-control-custom bg-dark text-white"
              >
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small mb-4">{error}</div>}

      {loading ? (
        <div className="text-center text-white py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-secondary">Loading courses list...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-folder-symlink fs-1 d-block mb-3"></i>
          No courses found matching your query.
        </div>
      ) : (
        <div className="row g-4">
          {courses.map((course) => (
            <div className="col-md-6 col-lg-4" key={course.id}>
              <div className="glass-card h-100 overflow-hidden d-flex flex-column justify-content-between">
                
                {/* Course Image Wrapper */}
                <div className="position-relative" style={{ height: '180px' }}>
                  {course.image_url ? (
                    <img 
                      src={course.image_url} 
                      alt={course.title} 
                      className="w-100 h-100 object-fit-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="w-100 h-100 bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center">
                      <i className="bi bi-laptop fs-1 text-secondary opacity-50"></i>
                    </div>
                  )}
                  <span className="position-absolute top-3 start-3 badge bg-primary badge-custom">
                    {course.category}
                  </span>
                </div>

                {/* Course Info */}
                <div className="p-4 flex-grow-1 d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold text-white mb-2">{course.title}</h5>
                    <p className="text-secondary small mb-4" style={{ lineClamp: '3', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description}
                    </p>
                  </div>

                  <div className="border-top border-secondary border-opacity-25 pt-3 d-flex align-items-center justify-content-between">
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Instructor</small>
                      <span className="fw-semibold text-white small">{course.instructor}</span>
                    </div>
                    <div className="text-end">
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Duration</small>
                      <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary badge-custom">
                        <i className="bi bi-clock me-1 text-primary"></i>{course.duration}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
