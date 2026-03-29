import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-white relative overflow-hidden bg-bgDark">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full">
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="w-full max-w-md"
        >
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Layers className="text-primary w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              DevHealth
            </h1>
          </div>

          <div className="glass-panel p-8">
            <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
            <p className="text-gray-400 text-sm mb-8">Sign in to orchestrate your engineering metrics.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Mail className="h-5 w-5 text-gray-500" />
                   </div>
                   <input 
                     type="email" 
                     className="form-input pl-10" 
                     placeholder="you@company.com" 
                     value={email} 
                     onChange={e => setEmail(e.target.value)} 
                     required 
                   />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                   <label className="text-sm font-medium text-gray-300">Password</label>
                </div>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Lock className="h-5 w-5 text-gray-500" />
                   </div>
                   <input 
                     type="password" 
                     className="form-input pl-10" 
                     placeholder="••••••••" 
                     value={password} 
                     onChange={e => setPassword(e.target.value)} 
                     required 
                   />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-4 py-3 bg-gradient-to-r from-primary to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-indigo-300 font-medium transition-colors">
                Register here
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Login;