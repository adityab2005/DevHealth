import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, ShieldCheck, ShieldAlert, UserX, UserPlus, Check, Copy } from 'lucide-react';

const RoleBadge = ({ role }) => {
  const getColors = () => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';      
      case 'manager': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';       
      default: return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
  };
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getColors()} uppercase tracking-wider`}>{role}</span>;
};

const TeamManagement = () => {
  const { user } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');
  const [generatedLink, setGeneratedLink] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager') {
       fetchTeam();
    }
  }, [user]);

  const fetchTeam = async () => {
    try {
      const res = await apiClient.get('/team/members');
      setMembers(res.data.members || []);
      setPending(res.data.pendingInvites || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage('');
    setGeneratedLink('');

    try {
      const res = await apiClient.post('/team/invite', { email: inviteEmail, role: inviteRole });
      setGeneratedLink(res.data.inviteLink);
      setMessage({ type: 'success', text: 'Invite created successfully.' });
      setInviteEmail('');
      fetchTeam();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send invite.' });
    } finally {
        setSending(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
        await apiClient.patch(`/team/member/${userId}/role`, { role: newRole });
        fetchTeam();
    } catch (err) {
        alert(err.response?.data?.error || 'Failed to update role.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you certain you want to remove this user from the team? This cannot be undone.')) return;
    try {
        await apiClient.delete(`/team/member/${userId}`);
        fetchTeam();
    } catch (err) {
        alert(err.response?.data?.error || 'Failed to remove user.');
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (!window.confirm('Cancel this pending invitation?')) return;
    try {
        await apiClient.delete(`/team/invite/${inviteId}`);
        fetchTeam();
    } catch (err) {
        alert('Failed to cancel invite');
    }
  };

  const copyToClipboard = (text) => {
     navigator.clipboard.writeText(text);
     alert('Invite link copied to clipboard!');
  };

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      return (
          <div className="max-w-3xl mx-auto flex flex-col items-center justify-center p-20 glass-panel mt-10">
              <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-gray-400">Team management is restricted to administrators and managers.</p>
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="mb-8 border-b border-white/10 pb-6">
         <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <Users className="text-primary" />
             Team Management
         </h1>
         <p className="text-gray-400 mt-2">Manage your team members, send invitations, and configure roles.</p>
      </div>

      {message && (
          <div className={`p-4 rounded-xl mb-6 backdrop-blur-md border ${
              message.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
              {message.text}
          </div>
      )}

      {/* Invite Section (Admin Only) */}
      {user.role === 'admin' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-secondary" />
                Invite New Member
            </h3>
            <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="form-label">Email Address</label>
                    <div className="relative">
                       <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                       <input type="email" required className="form-input pl-10" placeholder="colleague@domain.com" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} />
                    </div>
                </div>
                <div className="w-full md:w-48">
                    <label className="form-label">Assign Role</label>
                    <select className="form-input appearance-none" value={inviteRole} onChange={e=>setInviteRole(e.target.value)}>
                        <option value="developer">Developer</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>
                <button type="submit" disabled={sending} className="btn-primary w-full md:w-auto h-11 flex items-center justify-center gap-2 px-6">
                    {sending ? 'Sending...' : 'Send Invite'}
                </button>
            </form>

            {generatedLink && (
                <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                    <div className="truncate text-sm text-primary font-mono mr-4">{generatedLink}</div>
                    <button type="button" onClick={() => copyToClipboard(generatedLink)} className="p-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-white transition-colors">
                        <Copy size={16} />
                    </button>
                </div>
            )}
        </motion.div>
      )}

      {/* Pending Invites */}
      {pending.length > 0 && (
          <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-white mb-4 text-gray-300">Pending Invitations ({pending.length})</h3>
              <div className="space-y-3">
                  {pending.map(inv => (
                      <div key={inv._id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                          <div>
                              <div className="text-white font-medium">{inv.email}</div>
                              <div className="text-xs text-gray-500">Invited role: <RoleBadge role={inv.role} /></div>
                          </div>
                          {user.role === 'admin' && (
                              <button onClick={() => handleCancelInvite(inv._id)} className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors">
                                  Revoke
                              </button>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Active Members */}
      <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Active Members ({members.length})</h3>
          
          {loading ? (
             <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : (
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead className="uppercase tracking-wider border-b border-white/10 text-gray-400">
                         <tr>
                             <th scope="col" className="px-6 py-4">User</th>
                             <th scope="col" className="px-6 py-4">Role</th>
                             <th scope="col" className="px-6 py-4 text-right">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {members.map(member => (
                             <tr key={member._id} className="hover:bg-white/5 transition-colors">
                                 <td className="px-6 py-4">
                                     <div className="font-semibold text-white">{member.name}</div>
                                     <div className="text-gray-400">{member.email}</div>
                                 </td>
                                 <td className="px-6 py-4">
                                     <RoleBadge role={member.role} />
                                     {member._id === user.id && <span className="ml-2 text-xs text-primary font-medium">(You)</span>}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     {user.role === 'admin' && member._id !== user.id && (
                                         <div className="flex items-center justify-end gap-2">
                                             <select 
                                                 className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                                                 value={member.role}
                                                 onChange={(e) => handleChangeRole(member._id, e.target.value)}
                                             >
                                                 <option value="developer">Developer</option>
                                                 <option value="manager">Manager</option>
                                                 <option value="admin">Admin</option>
                                             </select>
                                             <button 
                                                 title="Remove from team"
                                                 onClick={() => handleRemoveMember(member._id)}
                                                 className="p-1.5 text-red-400 hover:text-white hover:bg-red-500 rounded transition-all"
                                             >
                                                 <UserX size={16} />
                                             </button>
                                         </div>
                                     )}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          )}
      </div>

    </div>
  );
};

export default TeamManagement;