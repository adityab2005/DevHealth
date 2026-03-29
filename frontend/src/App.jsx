import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutDashboard, Settings as SettingsIcon, LogOut, Menu, X, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

const RoleBadge = ({ role }) => {
  const getColors = () => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'manager': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getColors()} uppercase tracking-wider`}>
      {role || 'Developer'}
    </span>
  );
};

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-l-0 border-t-0 border-b-0 rounded-none flex flex-col transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg">
              <Cpu size={18} className="text-white" />
            </div>
            DevHealth
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pb-6 border-b border-white/5">
          <div className="flex flex-col gap-1 inline-flex items-start">
            <span className="text-sm font-medium text-white">{user?.name || 'User'}</span>
            <RoleBadge role={user?.role} />
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/20 text-primary font-semibold shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

const Topbar = ({ setIsMobileOpen }) => {
  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-t-0 border-r-0 border-l-0 rounded-none flex items-center px-4 lg:hidden">
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="text-gray-300 hover:text-white p-2"
      >
        <Menu size={24} />
      </button>
      <div className="flex-1 text-center font-bold text-lg text-white pr-8">
        DevHealth
      </div>
    </header>
  );
};

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    return user ? children : <Navigate to="/login" />;
}

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex text-primary items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    return !user ? children : <Navigate to="/" />;
}

const Layout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <Topbar setIsMobileOpen={setIsMobileOpen} />
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
          </main>
        </div>
    </div>
  );
}

const AppContent = () => {
  return (
    <Routes>
        <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
        <Route path='/register' element={<PublicRoute><Register /></PublicRoute>} />
        
        <Route path='/' element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path='/settings' element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
        <Route path='*' element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;