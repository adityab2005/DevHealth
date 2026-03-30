import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, Lock, User, ShieldCheck } from 'lucide-react';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, token: authToken, login } = useAuth(); // getting logged in user context
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteDetails, setInviteDetails] = useState(null);
  
  // Form for new users
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await apiClient.get(`/team/invite/${token}`);
        setInviteDetails(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid or expired invite token.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  const handleAccept = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = { token };
      if (!inviteDetails?.userExists) {
        if (!name || !password) {
           setError("Name and password are required.");
           setSubmitting(false);
           return;
        }
        payload.name = name;
        payload.password = password;
      }

      // apiClient will automatically append the Bearer token if the user is already logged in
      const res = await apiClient.post('/team/invite/accept', payload);
      
      // If we got a new token/re-issued token, set it and redirect
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      window.location.href = '/'; // force reload to refresh auth context
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept invite.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgDark">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine what view to show based on auth state and existing user
  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center">
           <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
           </div>
           <Link to="/login" className="btn-primary inline-flex items-center gap-2">Return to Login</Link>
        </div>
      );
    }

    if (inviteDetails.userExists) {
       if (!user) {
          // Exists but not logged in
          return (
             <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                  <User className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Welcome Back!</h2>
                <p className="text-gray-400 text-sm mb-6">
                  An account already exists for <strong>{inviteDetails.email}</strong>. 
                  Please log in first to accept this invitation to <strong>{inviteDetails.team_name}</strong>.
                </p>
                <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                   Log In to Continue
                </Link>
             </div>
          );
       } else if (user.email !== inviteDetails.email) {
          // Logged in softly but wrong email
          return (
             <div className="text-center">
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                   You are logged in as {user.email}, but this invite is for {inviteDetails.email}. Please log out and sign in with the correct account.
                </div>
             </div>
          );
       } else {
          // Fully good to go for existing user!
          return (
             <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                   <ShieldCheck className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">You're ready to join!</h2>
                <p className="text-gray-400 text-sm mb-8">
                  <strong>{inviteDetails.invited_by}</strong> has invited you to join <strong>{inviteDetails.team_name}</strong> as a <strong>{inviteDetails.role}</strong>.
                </p>
                <button 
                  onClick={handleAccept}
                  disabled={submitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
                >
                  {submitting ? 'Joining Team...' : 'Accept Invitation & Join Team'}
                  {!submitting && <ArrowRight className="w-5 h-5" />}
                </button>
             </div>
          );
       }
    }

    // Completely new user flow
    return (
      <>
        <div className="text-center mb-6">
           <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
              <ShieldCheck className="w-8 h-8 text-green-400" />
           </div>
           <h2 className="text-2xl font-semibold mb-2">You've been invited!</h2>
           <p className="text-gray-400 text-sm">
             <strong>{inviteDetails.invited_by}</strong> has invited you to join <strong>{inviteDetails.team_name}</strong> as a <strong>{inviteDetails.role}</strong>.
           </p>
        </div>

        <form onSubmit={handleAccept} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Email Address</label>
            <input 
              type="text" 
              className="form-input opacity-70 cursor-not-allowed" 
              value={inviteDetails.email} 
              disabled
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Your Name</label>
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <User className="h-5 w-5 text-gray-500" />
               </div>
               <input 
                 type="text" 
                 className="form-input pl-10" 
                 placeholder="Jane Doe" 
                 value={name} 
                 onChange={e => setName(e.target.value)} 
                 required 
               />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Set Password</label>
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
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4 py-3 bg-gradient-to-r from-primary to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
          >
            {submitting ? 'Creating Account & Joining...' : 'Accept Invitation'}
            {!submitting && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </>
    );
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
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AcceptInvite;