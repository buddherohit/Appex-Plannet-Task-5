import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../helpers/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });

  const [otpCode, setOtpCode] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [debugOtp, setDebugOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth.php?action=register', formData);
      if (response.data.success) {
        setMessage(response.data.message);
        if (response.data.debug_otp) {
          setDebugOtp(response.data.debug_otp);
        }
        setIsOtpMode(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth.php?action=verify-otp', {
        email: formData.email,
        otp_code: otpCode,
      });

      if (response.data.success) {
        setMessage('Account verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card p-5 w-100" style={{ maxWidth: '500px' }}>
        
        {!isOtpMode ? (
          <>
            <h2 className="fw-bold text-white mb-2 text-center">Create Account</h2>
            <p className="text-secondary text-center mb-4">Join the Student Career & Placement Ecosystem</p>

            {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small">{error}</div>}

            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-3">
                <label className="form-label text-white small">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="form-control form-control-custom text-white" 
                  placeholder="John Doe" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-white small">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="form-control form-control-custom text-white" 
                  placeholder="john@example.com" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-white small">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="form-control form-control-custom text-white" 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-white small">Account Role</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  className="form-select form-control-custom text-white bg-dark"
                >
                  <option value="student">Student</option>
                  <option value="admin">Administrator (Admin)</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary-custom w-100 py-3 mb-3">
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <p className="text-secondary text-center mb-0 small">
              Already have an account? <Link to="/login" className="text-primary text-decoration-none">Sign In</Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="fw-bold text-white mb-2 text-center">Verify Email</h2>
            <p className="text-secondary text-center mb-4">We've sent a simulated 6-digit OTP verification code.</p>

            {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small">{error}</div>}
            {message && <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white py-2 small">{message}</div>}

            {debugOtp && (
              <div className="alert alert-info border-0 bg-info bg-opacity-25 text-white py-3 mb-4 text-center">
                <i className="bi bi-info-circle-fill me-2"></i>
                Simulated OTP: <strong className="fs-5">{debugOtp}</strong>
                <p className="mb-0 small text-secondary mt-1">Copy and paste this code below to verify.</p>
              </div>
            )}

            <form onSubmit={handleOtpSubmit}>
              <div className="mb-4">
                <label className="form-label text-white small">Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)} 
                  maxLength="6"
                  className="form-control form-control-custom text-center text-white fs-4 fw-semibold" 
                  placeholder="000000" 
                  required 
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary-custom w-100 py-3 mb-3">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <p className="text-secondary text-center mb-0 small">
              Need assistance? Contact <span className="text-primary">support@careerbridge.com</span>
            </p>
          </>
        )}

      </div>
    </div>
  );
};

export default Register;
