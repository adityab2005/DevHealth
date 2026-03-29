import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import './index.css';

const Header = () => {
  const { logout } = useAuth();
  const location = useLocation();
  return (
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#111827' }}>DevHealth</div>
            <nav style={{ display: 'flex', gap: '15px' }}>
                <Link to='/' style={{ textDecoration: 'none', color: location.pathname === '/' ? '#2563eb' : '#4b5563', fontWeight: location.pathname === '/' ? 'bold' : 'normal' }}>Dashboard</Link>
                <Link to='/settings' style={{ textDecoration: 'none', color: location.pathname === '/settings' ? '#2563eb' : '#4b5563', fontWeight: location.pathname === '/settings' ? 'bold' : 'normal' }}>Settings</Link>
            </nav>
        </div>
        <button onClick={logout} style={{ ...btnStyle, background: '#ef4444' }}>Log Out</button>
      </header>
  );
};

const AppContent = () => {
  const { user, login } = useAuth();

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f3f4f6' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2>DevHealth Login</h2>
          <p style={{ color: '#4b5563' }}>Select a role to demo RBAC:</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => login('admin')} style={btnStyle}>Log in Admin</button>
            <button onClick={() => login('manager')} style={btnStyle}>Log in Manager</button>
            <button onClick={() => login('developer')} style={btnStyle}>Log in Developer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
        <Header />
        <main>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/settings' element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const btnStyle = {
  padding: '8px 16px',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '500'
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
