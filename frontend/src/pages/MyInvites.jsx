import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const MyInvites = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInvites();
    }, []);

    const fetchInvites = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get('/team/my-invites');
            setInvites(data.invites);
        } catch (err) {
            console.error('Failed to fetch invites', err);
            setError('Failed to load your invites.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (token) => {
        setActionLoading(token);
        try {
            const { data } = await apiClient.post('/team/invite/accept', { token });
            if (data.token) {
                // re-auth with new token
                localStorage.setItem('token', data.token);
                // Force a page reload or update context
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/dashboard';
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to accept invite');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async (token) => {
        setActionLoading(token);
        try {
            await apiClient.post(`/team/invite/${token}/decline`);
            setInvites(prev => prev.filter(inv => inv.invite_token !== token));
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to decline invite');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">My Team Invites</h1>
                <p className="text-gray-400 mt-1">Review your pending team invitations below.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {invites.length === 0 ? (
                <div className="glass-panel p-10 text-center flex flex-col items-center justify-center">
                    <Mail size={48} className="text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No pending invitations</h3>
                    <p className="text-gray-400">You don't have any pending invites to join a team.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {invites.map((invite) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={invite._id} 
                            className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    {invite.team_id?.name || 'A Team'} has invited you
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    Role: <span className="text-primary-light capitalize font-medium">{invite.role}</span>
                                </p>
                                <p className="text-gray-500 text-xs mt-2">
                                    Sent: {new Date(invite.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleDecline(invite.invite_token)}
                                    disabled={actionLoading === invite.invite_token}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                    Decline
                                </button>
                                <button
                                    onClick={() => handleAccept(invite.invite_token)}
                                    disabled={actionLoading === invite.invite_token}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-secondary-dark hover:bg-primary-light font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                                >
                                    {actionLoading === invite.invite_token ? (
                                        <div className="w-5 h-5 border-2 border-secondary-dark border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Accept Invite
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyInvites;