import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../helpers/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync authentication user state
  const checkUserSession = () => {
    const userJson = localStorage.getItem('careerbridge_user');
    if (userJson) {
      try {
        setUser(JSON.parse(userJson));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUserSession();
    // Listen for custom login/logout events to sync navbar
    window.addEventListener('auth-change', checkUserSession);
    return () => window.removeEventListener('auth-change', checkUserSession);
  }, []);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load notifications if user is logged in
  const fetchNotifications = async () => {
    if (!localStorage.getItem('careerbridge_token')) return;
    try {
      const response = await api.get('/notifications.php');
      if (response.data.success) {
        const list = response.data.notifications;
        setNotifications(list);
        setUnreadCount(list.filter(n => n.is_read == 0).length);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    let interval = null;
    if (user) {
      // Poll notifications every 30 seconds
      interval = setInterval(fetchNotifications, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    localStorage.removeItem('careerbridge_token');
    localStorage.removeItem('careerbridge_user');
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications.php?action=read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper for notification icons
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job': return <i className="bi bi-briefcase-fill text-primary"></i>;
      case 'internship': return <i className="bi bi-mortarboard-fill text-success"></i>;
      case 'notes': return <i className="bi bi-file-earmark-pdf-fill text-warning"></i>;
      default: return <i className="bi bi-bell-fill text-secondary"></i>;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg glass-navbar navbar-dark sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-4 text-white" to="/">
          <i className="bi bi-link-45deg me-2 text-gradient-primary fs-3"></i>
          <span className="text-gradient-primary">Career</span>Bridge
        </Link>

        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#careerBridgeNav" 
          aria-controls="careerBridgeNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="careerBridgeNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-2">
            <li className="nav-item">
              <Link className={`nav-link text-white px-3 ${location.pathname === '/' ? 'active fw-semibold' : 'opacity-75'}`} to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link text-white px-3 ${location.pathname === '/about' ? 'active fw-semibold' : 'opacity-75'}`} to="/about">
                About
              </Link>
            </li>

            {user && (
              <>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle text-white px-3 opacity-75" 
                    href="#" 
                    id="resourcesDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    Resources
                  </a>
                  <ul className="dropdown-menu dropdown-menu-dark border-secondary bg-dark" aria-labelledby="resourcesDropdown">
                    <li><Link className="dropdown-item py-2" to="/courses"><i className="bi bi-laptop me-2"></i>Courses</Link></li>
                    <li><Link className="dropdown-item py-2" to="/notes"><i className="bi bi-file-earmark-text me-2"></i>Study Notes</Link></li>
                    <li><Link className="dropdown-item py-2" to="/placement"><i className="bi bi-mortarboard me-2"></i>Placement Prep</Link></li>
                    <li><Link className="dropdown-item py-2" to="/projects"><i className="bi bi-code-slash me-2"></i>Project Showcase</Link></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white px-3 ${location.pathname === '/jobs' ? 'active fw-semibold' : 'opacity-75'}`} to="/jobs">
                    Jobs
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white px-3 ${location.pathname === '/internships' ? 'active fw-semibold' : 'opacity-75'}`} to="/internships">
                    Internships
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="btn btn-outline-light border-0 rounded-circle p-2" 
              type="button" 
              title="Toggle Theme"
              style={{ width: '40px', height: '40px' }}
            >
              {theme === 'dark' ? <i className="bi bi-sun-fill text-warning"></i> : <i className="bi bi-moon-fill text-dark"></i>}
            </button>

            {user ? (
              <>
                {/* Notifications Dropdown */}
                <div className="dropdown">
                  <button 
                    className="btn btn-outline-light border-0 rounded-circle position-relative p-2" 
                    type="button" 
                    id="notificationsDrop" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <i className="bi bi-bell-fill"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark border-secondary bg-dark py-0" aria-labelledby="notificationsDrop" style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                    <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
                      <span className="fw-semibold">Alerts</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="btn btn-link text-decoration-none text-primary p-0" style={{ fontSize: '0.85rem' }}>
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted">
                        <i className="bi bi-bell-slash fs-4 d-block mb-2"></i>
                        No new notifications.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <li key={n.id} className={`p-3 border-bottom border-secondary ${n.is_read == 0 ? 'bg-secondary bg-opacity-25' : ''}`}>
                          <div className="d-flex gap-2">
                            <div className="mt-1">{getNotificationIcon(n.type)}</div>
                            <div>
                              <p className="mb-0 text-white" style={{ fontSize: '0.9rem' }}>{n.message}</p>
                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {new Date(n.created_at).toLocaleString()}
                              </small>
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Profile Avatar / User Settings */}
                <div className="dropdown">
                  <button 
                    className="btn btn-link text-decoration-none text-white d-flex align-items-center gap-2 dropdown-toggle p-0" 
                    type="button" 
                    id="userDropdown" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    {user.profile_pic ? (
                      <img 
                        src={`http://localhost:8000/${user.profile_pic}`} 
                        alt="Avatar" 
                        className="rounded-circle object-fit-cover border border-secondary"
                        style={{ width: '35px', height: '35px' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white border border-secondary" style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="d-none d-md-inline" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark border-secondary bg-dark" aria-labelledby="userDropdown">
                    <li>
                      <Link className="dropdown-item py-2" to="/dashboard">
                        <i className="bi bi-grid-1x2-fill me-2 text-primary"></i>Dashboard
                      </Link>
                    </li>
                    {user.role === 'admin' && (
                      <li>
                        <Link className="dropdown-item py-2" to="/admin">
                          <i className="bi bi-shield-lock-fill me-2 text-warning"></i>Admin Panel
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link className="dropdown-item py-2" to="/profile">
                        <i className="bi bi-person-fill me-2 text-info"></i>My Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider border-secondary" /></li>
                    <li>
                      <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn btn-outline-light px-3 border-secondary" to="/login">Sign In</Link>
                <Link className="btn btn-primary-custom" to="/register">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
