import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../helpers/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Forgot Password / Reset Password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [forgotDebugOtp, setForgotDebugOtp] = useState('');

  // Unverified account state redirection
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [unverifiedOtp, setUnverifiedOtp] = useState('');
  const [isUnverifiedOtpMode, setIsUnverifiedOtpMode] = useState(false);
  const [unverifiedDebugOtp, setUnverifiedDebugOtp] = useState('');

  useEffect(() => {
    if (searchParams.get('expired')) {
      setError('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth.php?action=login', formData);
      if (response.data.success) {
        localStorage.setItem('careerbridge_token', response.data.token);
        localStorage.setItem('careerbridge_user', JSON.stringify(response.data.user));
        
        // Dispatch auth change event for Navbar
        window.dispatchEvent(new Event('auth-change'));
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const resp = err.response;
      if (resp && resp.status === 403 && resp.data.verified === false) {
        // Account unverified, trigger OTP verify
        setUnverifiedEmail(formData.email);
        if (resp.data.debug_otp) {
          setUnverifiedDebugOtp(resp.data.debug_otp);
        }
        setIsUnverifiedOtpMode(true);
        setError('This account is not verified. Please verify using the OTP below.');
      } else {
        setError(resp?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth.php?action=forgot-password', { email: forgotEmail });
      if (response.data.success) {
        setMessage('Reset code sent to email.');
        if (response.data.debug_otp) {
          setForgotDebugOtp(response.data.debug_otp);
        }
        setIsResetMode(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth.php?action=reset-password', {
        email: forgotEmail,
        otp_code: resetOtp,
        new_password: newPassword
      });

      if (response.data.success) {
        setMessage('Password reset successful! You can now log in.');
        setTimeout(() => {
          setShowForgot(false);
          setIsResetMode(false);
          setForgotEmail('');
          setResetOtp('');
          setNewPassword('');
          setForgotDebugOtp('');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnverifiedOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth.php?action=verify-otp', {
        email: unverifiedEmail,
        otp_code: unverifiedOtp,
      });

      if (response.data.success) {
        setMessage('Account verified successfully! You can now log in.');
        setTimeout(() => {
          setIsUnverifiedOtpMode(false);
          setUnverifiedEmail('');
          setUnverifiedOtp('');
          setUnverifiedDebugOtp('');
          setError('');
          setMessage('');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card p-5 w-100" style={{ maxWidth: '500px' }}>
        
        {/* Unverified Account Verification Form */}
        {isUnverifiedOtpMode ? (
          <>
            <h2 className="fw-bold text-white mb-2 text-center">Verify Account</h2>
            <p className="text-secondary text-center mb-4">Complete registration verification for {unverifiedEmail}</p>

            {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small">{error}</div>}
            {message && <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white py-2 small">{message}</div>}

            {unverifiedDebugOtp && (
              <div className="alert alert-info border-0 bg-info bg-opacity-25 text-white py-3 mb-4 text-center">
                <i className="bi bi-info-circle-fill me-2"></i>
                Simulated OTP: <strong className="fs-5">{unverifiedDebugOtp}</strong>
                <p className="mb-0 small text-secondary mt-1">Copy and paste this code below to verify.</p>
              </div>
            )}

            <form onSubmit={handleUnverifiedOtpSubmit}>
              <div className="mb-4">
                <label className="form-label text-white small">Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  value={unverifiedOtp} 
                  onChange={(e) => setUnverifiedOtp(e.target.value)} 
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

            <button onClick={() => setIsUnverifiedOtpMode(false)} className="btn btn-link w-100 text-decoration-none text-secondary small">
              Back to Login
            </button>
          </>
        ) : (
          /* Normal Authentication / Forgot Password Forms */
          <>
            {!showForgot ? (
              <>
                <h2 className="fw-bold text-white mb-2 text-center">Welcome Back</h2>
                <p className="text-secondary text-center mb-4">Sign in to access your student career dashboard</p>

                {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small">{error}</div>}
                {message && <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white py-2 small">{message}</div>}

                <form onSubmit={handleLoginSubmit}>
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
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="form-label text-white small">Password</label>
                      <button 
                        type="button" 
                        onClick={() => { setShowForgot(true); setError(''); setMessage(''); }} 
                        className="btn btn-link text-primary text-decoration-none p-0 small"
                      >
                        Forgot Password?
                      </button>
                    </div>
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

                  <button type="submit" disabled={loading} className="btn btn-primary-custom w-100 py-3 mb-3 mt-2">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                <p className="text-secondary text-center mb-0 small">
                  Don't have an account? <Link to="/register" className="text-primary text-decoration-none">Register</Link>
                </p>
              </>
            ) : (
              <>
                <h2 className="fw-bold text-white mb-2 text-center">Reset Password</h2>
                <p className="text-secondary text-center mb-4">
                  {!isResetMode ? 'Enter your registered email to request a reset code.' : 'Enter the OTP and set a new password.'}
                </p>

                {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white py-2 small">{error}</div>}
                {message && <div className="alert alert-success border-0 bg-success bg-opacity-25 text-white py-2 small">{message}</div>}

                {isResetMode && forgotDebugOtp && (
                  <div className="alert alert-info border-0 bg-info bg-opacity-25 text-white py-3 mb-4 text-center">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Reset OTP: <strong className="fs-5">{forgotDebugOtp}</strong>
                    <p className="mb-0 small text-secondary mt-1">Copy and paste this code below to reset password.</p>
                  </div>
                )}

                {!isResetMode ? (
                  <form onSubmit={handleForgotSubmit}>
                    <div className="mb-4">
                      <label className="form-label text-white small">Email Address</label>
                      <input 
                        type="email" 
                        value={forgotEmail} 
                        onChange={(e) => setForgotEmail(e.target.value)} 
                        className="form-control form-control-custom text-white" 
                        placeholder="john@example.com" 
                        required 
                      />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary-custom w-100 py-3 mb-3">
                      {loading ? 'Requesting...' : 'Request Reset OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetSubmit}>
                    <div className="mb-3">
                      <label className="form-label text-white small">Enter 6-Digit OTP</label>
                      <input 
                        type="text" 
                        value={resetOtp} 
                        onChange={(e) => setResetOtp(e.target.value)} 
                        maxLength="6"
                        className="form-control form-control-custom text-center text-white fs-4 fw-semibold" 
                        placeholder="000000" 
                        required 
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-white small">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="form-control form-control-custom text-white" 
                        placeholder="••••••••" 
                        required 
                      />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary-custom w-100 py-3 mb-3">
                      {loading ? 'Saving new password...' : 'Save New Password'}
                    </button>
                  </form>
                )}

                <button onClick={() => { setShowForgot(false); setIsResetMode(false); setError(''); setMessage(''); }} className="btn btn-link w-100 text-decoration-none text-secondary small">
                  Back to Login
                </button>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Login;
