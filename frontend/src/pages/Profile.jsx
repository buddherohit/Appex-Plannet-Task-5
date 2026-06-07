import React, { useState, useEffect } from 'react';
import api from '../helpers/api';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('careerbridge_user') || '{}'));
  const [profileForm, setProfileForm] = useState({ name: user.name || '', email: user.email || '' });
  
  // Password change states
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  
  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Status logs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);

  const loadProfileData = async () => {
    try {
      const meRes = await api.get('/auth.php?action=me');
      if (meRes.data.success) {
        setUser(meRes.data.user);
        localStorage.setItem('careerbridge_user', JSON.stringify(meRes.data.user));
        setProfileForm({ name: meRes.data.user.name, email: meRes.data.user.email });
      }
      
      const logsRes = await api.get('/activity_logs.php');
      if (logsRes.data.success) {
        setActivityLogs(logsRes.data.logs.slice(0, 10));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePwdChange = (e) => {
    setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/profile.php?action=update', profileForm);
      if (res.data.success) {
        setSuccess('Profile details updated successfully.');
        const updatedUser = { ...user, name: profileForm.name, email: profileForm.email };
        setUser(updatedUser);
        localStorage.setItem('careerbridge_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('auth-change'));
        loadProfileData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setError('New password and password confirmation do not match.');
      setLoading(false);
      return;
    }

    if (pwdForm.new_password.length < 6) {
      setError('New password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/profile.php?action=change-password', {
        current_password: pwdForm.current_password,
        new_password: pwdForm.new_password
      });

      if (res.data.success) {
        setSuccess(res.data.message);
        setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
        loadProfileData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Avatar file exceeds 2MB limit.');
        return;
      }
      // Validate file extension
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['png', 'jpg', 'jpeg'].includes(ext)) {
        setError('Invalid image type. Only JPG, JPEG, and PNG are allowed.');
        return;
      }

      setAvatarFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const res = await api.post('/profile.php?action=upload-avatar', formData);
      if (res.data.success) {
        setSuccess('Avatar photo updated successfully!');
        setAvatarFile(null);
        setAvatarPreview('');
        
        const updatedUser = { ...user, profile_pic: res.data.profile_pic };
        setUser(updatedUser);
        localStorage.setItem('careerbridge_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('auth-change'));
        loadProfileData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading profile image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold text-white mb-1"><i className="bi bi-person-fill text-primary me-2"></i>My Profile</h2>
        <p className="text-secondary mb-0">Update your credentials, upload verification avatars, and track your activity logs.</p>
      </div>

      {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small mb-4">{error}</div>}
      {success && <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white py-2 small mb-4">{success}</div>}

      <div className="row g-4">
        {/* Left Side: Avatar Upload & Details Form */}
        <div className="col-lg-8">
          
          {/* Details Form Card */}
          <div className="glass-card p-4 mb-4">
            <h5 className="fw-semibold text-white mb-4"><i className="bi bi-card-text text-primary me-2"></i>Account Details</h5>
            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-white small">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={profileForm.name} 
                    onChange={handleProfileChange} 
                    className="form-control form-control-custom text-white" 
                    required 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white small">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={profileForm.email} 
                    onChange={handleProfileChange} 
                    className="form-control form-control-custom text-white" 
                    required 
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label text-white small">Account Role</label>
                <input 
                  type="text" 
                  value={user.role} 
                  className="form-control form-control-custom text-muted text-capitalize bg-dark bg-opacity-50 border-secondary" 
                  disabled 
                />
                <small className="text-muted">Role modification is restricted to platform administrators.</small>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary-custom px-4 py-2 mt-2">
                {loading ? 'Saving...' : 'Save Profile Details'}
              </button>
            </form>
          </div>

          {/* Password update Form */}
          <div className="glass-card p-4">
            <h5 className="fw-semibold text-white mb-4"><i className="bi bi-shield-lock-fill text-warning me-2"></i>Security Settings</h5>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label text-white small">Current Password</label>
                <input 
                  type="password" 
                  name="current_password" 
                  value={pwdForm.current_password} 
                  onChange={handlePwdChange} 
                  className="form-control form-control-custom text-white" 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label text-white small">New Password</label>
                  <input 
                    type="password" 
                    name="new_password" 
                    value={pwdForm.new_password} 
                    onChange={handlePwdChange} 
                    className="form-control form-control-custom text-white" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-white small">Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirm_password" 
                    value={pwdForm.confirm_password} 
                    onChange={handlePwdChange} 
                    className="form-control form-control-custom text-white" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-secondary-custom px-4 py-2 mt-2">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Profile Photo Upload Widget & Timeline */}
        <div className="col-lg-4">
          
          {/* Avatar Panel */}
          <div className="glass-card p-4 mb-4 text-center">
            <h6 className="fw-bold text-white mb-3 text-start">Profile Photo</h6>
            
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Preview" 
                className="rounded-circle object-fit-cover border border-secondary mx-auto mb-3"
                style={{ width: '120px', height: '120px' }}
              />
            ) : user.profile_pic ? (
              <img 
                src={`http://localhost:8000/${user.profile_pic}`} 
                alt="Avatar" 
                className="rounded-circle object-fit-cover border border-secondary mx-auto mb-3"
                style={{ width: '120px', height: '120px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop";
                }}
              />
            ) : (
              <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white border border-secondary mx-auto mb-3" style={{ width: '120px', height: '120px', fontSize: '3rem' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>
            )}

            <div className="mb-3">
              <label className="btn btn-outline-light border-secondary text-white btn-sm px-3 py-2 w-100">
                <i className="bi bi-camera me-1"></i> Choose New Photo
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept=".jpg,.jpeg,.png"
                  className="d-none" 
                />
              </label>
              <small className="text-muted d-block mt-2">Maximum file size: 2MB. Allowed: JPG, PNG.</small>
            </div>

            {avatarFile && (
              <button 
                onClick={handleAvatarUpload} 
                disabled={loading} 
                className="btn btn-success btn-sm w-100"
              >
                {loading ? 'Uploading...' : 'Save Avatar Photo'}
              </button>
            )}
          </div>

          {/* User Specific Timeline logs */}
          <div className="glass-card p-4">
            <h6 className="fw-bold text-white mb-3"><i className="bi bi-clock-history me-1 text-info"></i>My Activity Feed</h6>
            {activityLogs.length === 0 ? (
              <p className="text-muted small text-center py-2">No activity recorded.</p>
            ) : (
              <div className="d-flex flex-column gap-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {activityLogs.map((log) => (
                  <div key={log.id} className="d-flex gap-2">
                    <div className="mt-1"><i className="bi bi-check-circle-fill text-success" style={{ fontSize: '0.8rem' }}></i></div>
                    <div>
                      <span className="text-white d-block small fw-semibold" style={{ lineHeight: '1.2' }}>{log.action}</span>
                      <span className="text-secondary text-xxs d-block">{log.details}</span>
                      <small className="text-muted text-xxs" style={{ fontSize: '0.7rem' }}>{new Date(log.created_at).toLocaleDateString()}</small>
                    </div>
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

export default Profile;
