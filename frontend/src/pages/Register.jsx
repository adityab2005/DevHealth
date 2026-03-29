import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, Lock, Mail, User, Briefcase, Users } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('developer');
  const [teamName, setTeamName] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name, email, password, role, role === 'admin' ? teamName : undefined);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-white relative overflow-hidden bg-bgDark">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full py-12 overflow-y-auto">
        
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
            <h2 className="text-2xl font-semibold mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm mb-8">Join your engineering organization.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <User className="h-5 w-5 text-gray-500" />
                   </div>
                   <input 
                     type="text" 
                     className="form-input pl-10" 
                     placeholder="John Doe" 
                     value={name} 
                     onChange={e => setName(e.target.value)} 
                     required 
                   />
                </div>
              </div>

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
                <label className="text-sm font-medium text-gray-300">Password</label>
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

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Role</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Briefcase className="h-5 w-5 text-gray-500" />
                   </div>
                   <select 
                     className="form-input pl-10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:10px_10px]" 
                     value={role} 
                     onChange={e => setRole(e.target.value)}
                   >
                     <option value="developer">Developer</option>
                     <option value="manager">Manager</option>
                     <option value="admin">Administrator (Team Creator)</option>
                   </select>
                </div>
              </div>

              {role === 'admin' && (
                <motion.div 
                   initial={{ opacity: 0, height: 0 }} 
                   animate={{ opacity: 1, height: 'auto' }} 
                   className="space-y-1 pt-2"
                >
                  <label className="text-sm font-medium text-gray-300">Team Name to Create</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Users className="h-5 w-5 text-secondary" />
                     </div>
                     <input 
                       type="text" 
                       className="form-input pl-10 border-secondary/30 focus:border-secondary/60 focus:ring-secondary/20" 
                       placeholder="Acme Corp Engineering" 
                       value={teamName} 
                       onChange={e => setTeamName(e.target.value)} 
                       required 
                     />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-1">You will be the sole administrator for this new team vault.</p>
                </motion.div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3 bg-gradient-to-r from-primary to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
              >
                {loading ? 'Registering...' : 'Create Account'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-indigo-300 font-medium transition-colors">
                Sign in here
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Register;