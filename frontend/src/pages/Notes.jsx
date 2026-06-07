import React, { useState, useEffect } from 'react';
import api from '../helpers/api';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search/Filters states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Upload notes states
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', category: 'Computer Science' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const categories = ['All', 'Computer Science', 'Web Development', 'Mathematics', 'Aptitude & Logical', 'Electronics'];
  const formCategories = ['Computer Science', 'Web Development', 'Mathematics', 'Aptitude & Logical', 'Electronics'];

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/notes.php', {
        params: { search, category }
      });
      if (response.data.success) {
        setNotes(response.data.notes);
      }
    } catch (err) {
      console.error(err);
      setError('Error loading study notes catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotes();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Max allowed: 10MB.');
        return;
      }
      // Validate extension
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'pptx', 'jpg', 'png'].includes(ext)) {
        setError('Invalid file type. Allowed: PDF, DOCX, PPTX, JPG, PNG.');
        return;
      }
      setUploadFile(file);
      setError('');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setError('Please choose a file to upload.');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('category', uploadForm.category);
    formData.append('file', uploadFile);

    try {
      const response = await api.post('/notes.php', formData);
      if (response.data.success) {
        setSuccess('Notes document uploaded and shared successfully!');
        setUploadForm({ title: '', description: '', category: 'Computer Science' });
        setUploadFile(null);
        // Clear input element
        document.getElementById('noteFileInput').value = '';
        fetchNotes();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return <i className="bi bi-file-earmark-pdf-fill text-danger fs-1"></i>;
      case 'docx': return <i className="bi bi-file-earmark-word-fill text-primary fs-1"></i>;
      case 'pptx': return <i className="bi bi-file-earmark-ppt-fill text-warning fs-1"></i>;
      case 'jpg':
      case 'png':
      case 'jpeg': return <i className="bi bi-file-earmark-image-fill text-info fs-1"></i>;
      default: return <i className="bi bi-file-earmark-text-fill text-secondary fs-1"></i>;
    }
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <span className="badge bg-secondary bg-opacity-25 border border-secondary text-white px-3 py-2 badge-custom mb-3">
          📚 Study Notes Portal
        </span>
        <h1 className="fw-extrabold text-white mb-2">Academic & Tech Resources</h1>
        <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '600px' }}>
          Explore shared lectures, exam questions, cheatsheets, and upload your own study worksheets to help colleagues.
        </p>
      </div>

      {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small mb-4">{error}</div>}
      {success && <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white py-2 small mb-4">{success}</div>}

      <div className="row g-4">
        {/* Left column: List of notes */}
        <div className="col-lg-8">
          
          {/* Filters card */}
          <div className="glass-card-no-hover p-4 mb-4">
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
                    placeholder="Search by title or description..." 
                  />
                </div>
              </div>
              <div className="col-md-5">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-secondary small text-nowrap">Category:</span>
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

          {loading ? (
            <div className="text-center text-white py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center text-muted py-5 glass-card p-5">
              <i className="bi bi-file-earmark-lock fs-1 d-block mb-3 text-secondary"></i>
              No study files found. Be the first to share one!
            </div>
          ) : (
            <div className="row g-3">
              {notes.map((note) => (
                <div className="col-md-6" key={note.id}>
                  <div className="glass-card p-4 h-100 d-flex gap-3 align-items-start justify-content-between">
                    <div className="d-flex gap-3 align-items-start">
                      <div className="mt-1">{getFileIcon(note.file_type)}</div>
                      <div>
                        <span className="badge bg-secondary bg-opacity-25 text-white border border-secondary badge-custom mb-2">
                          {note.category}
                        </span>
                        <h6 className="fw-bold text-white mb-1">{note.title}</h6>
                        <p className="text-secondary small mb-3">{note.description}</p>
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                          Uploaded by: <span className="text-secondary">{note.uploader_name}</span>
                        </small>
                      </div>
                    </div>

                    <a 
                      href={`http://localhost:8000/${note.file_path}`} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary-custom p-2 rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ width: '40px', height: '40px' }}
                      title="Download Resource"
                    >
                      <i className="bi bi-arrow-down-short fs-4"></i>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right column: Note submission */}
        <div className="col-lg-4">
          <div className="glass-card p-4 sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold text-white mb-3"><i className="bi bi-cloud-arrow-up text-primary me-2"></i>Share Study Notes</h5>
            <p className="text-secondary small mb-4">
              Help your peers by sharing verified lectures, books, cheatsheets, or formulas. Allowed: PDF, DOCX, PPTX, JPG, PNG.
            </p>

            <form onSubmit={handleUploadSubmit}>
              <div className="mb-3">
                <label className="form-label text-white small">Title</label>
                <input 
                  type="text" 
                  value={uploadForm.title} 
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} 
                  className="form-control form-control-custom text-white" 
                  placeholder="e.g. OS Memory Management Guide" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-white small">Description</label>
                <textarea 
                  rows="3" 
                  value={uploadForm.description} 
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} 
                  className="form-control form-control-custom text-white" 
                  placeholder="Briefly describe topics covered..." 
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-white small">Category</label>
                <select 
                  value={uploadForm.category} 
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })} 
                  className="form-select form-control-custom bg-dark text-white"
                >
                  {formCategories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label text-white small">Select File</label>
                <input 
                  type="file" 
                  id="noteFileInput"
                  onChange={handleFileChange} 
                  className="form-control form-control-custom text-white" 
                  required 
                />
              </div>

              <button type="submit" disabled={uploading} className="btn btn-primary-custom w-100 py-3">
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Uploading file...
                  </>
                ) : 'Upload & Share'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
