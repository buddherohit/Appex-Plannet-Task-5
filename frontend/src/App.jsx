import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Courses from './pages/Courses';
import Notes from './pages/Notes';
import Internships from './pages/Internships';
import Jobs from './pages/Jobs';
import Projects from './pages/Projects';
import PlacementPrep from './pages/PlacementPrep';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-slate text-light">
        {/* Navigation Bar */}
        <Navbar />

        {/* Primary Page Layout */}
        <main className="flex-grow-1">
          <Routes>
            {/* Public Access Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated Student/Admin Shared Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Courses />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notes" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Notes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Jobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/internships" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Internships />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Projects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/placement" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <PlacementPrep />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Restricted Administrative Controller Route */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all Fallback redirection */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Ecosystem Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
