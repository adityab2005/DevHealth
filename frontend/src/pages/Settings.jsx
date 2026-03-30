import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import RoleGuard from '../components/RoleGuard';
import { motion } from 'framer-motion';
import { Save, GitBranch, CheckSquare, Layers, Shield } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [form, setForm] = useState({
    github: { token: '', repositories: '' },
    jira: { domain: '', email: '', token: '', projects: '' },
    jenkins: { baseUrl: '', username: '', token: '', jobs: '' },
    permissions: {
      manager: ['commit_frequency', 'build_success', 'issue_resolution'],
      developer: ['commit_frequency', 'issue_resolution']
    }
  });

  useEffect(() => {
    if (user?.team_id) {
       fetchConfig();
    }
  }, [user]);

  const fetchConfig = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await apiClient.get(`/integrations`);
      if (response.data) {
        // Since we are getting team configurations
        const config = response.data;
        setForm({
          github: config.github || { token: '', repositories: '' },
          jira: config.jira || { domain: '', email: '', token: '', projects: '' },
          jenkins: config.jenkins || { baseUrl: '', username: '', token: '', jobs: '' },
          permissions: config.permissions || {
            manager: ['commit_frequency', 'build_success', 'issue_resolution'],
            developer: ['commit_frequency', 'issue_resolution']
          }
        });
      }
    } catch (error) {
      console.error('Failed to load settings', error);
      // If fetching fails, clear it
      setForm({
        github: { token: '', repositories: '' },
        jira: { domain: '', email: '', token: '', projects: '' },
        jenkins: { baseUrl: '', username: '', token: '', jobs: '' },
        permissions: {
          manager: ['commit_frequency', 'build_success', 'issue_resolution'],
          developer: ['commit_frequency', 'issue_resolution']
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
        await apiClient.post('/integrations', form);
        setMessage({ text: 'Configuration saved successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
        console.error('Failed to save config', error);
        setMessage({ text: 'Failed to save configuration.', type: 'error' });
    } finally {
        setSaving(false);
    }
  };

  const handleChange = (provider, field, value) => {
    setForm(prev => ({
        ...prev,
        [provider]: {
            ...prev[provider],
            [field]: value
        }
    }));
  };

  const handlePermissionChange = (role, view_id, checked) => {
    setForm(prev => {
      const currentViews = prev.permissions?.[role] || [];
      const newViews = checked
        ? [...currentViews, view_id]
        : currentViews.filter(v => v !== view_id);
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [role]: newViews
        }
      };
    });
  };

  if (!user || user.role === 'developer') {
      return (
          <div className="max-w-3xl mx-auto flex flex-col items-center justify-center p-20 glass-panel mt-10">
              <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-gray-400">You do not have permission to view or manage integrations.</p>
          </div>
      );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
         <h1 className="text-3xl font-bold text-white tracking-tight">Team Integration Settings</h1>
         <p className="text-gray-400 mt-1">Configure external data sources to aggregate metrics.</p>
      </div>
      
      {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-6 backdrop-blur-md border ${
                message.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}
          >
              {message.text}
          </motion.div>
      )}

      {loading ? (
          <div className="flex items-center justify-center p-20 glass-panel">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
      ) : (
          <motion.form 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            onSubmit={handleSave}
            className="space-y-6"
          >
              {/* GitHub */}
              <motion.div variants={itemVariants} className="glass-panel p-6">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <GitBranch className="text-white" size={24} />
                    <h3 className="text-xl font-semibold text-white m-0">GitHub</h3>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="form-label">Personal Access Token (PAT)</label>
                          <input className="form-input" type="password" placeholder="ghp_..." value={form.github.token || ''} onChange={e => handleChange('github', 'token', e.target.value)} />
                      </div>
                      <div>
                          <label className="form-label">Repositories (comma-separated: owner/repo)</label>
                          <input className="form-input" type="text" placeholder="facebook/react, adobe/react-native" value={form.github.repositories || ''} onChange={e => handleChange('github', 'repositories', e.target.value)} />
                      </div>
                  </div>
              </motion.div>

              {/* Jira */}
              <motion.div variants={itemVariants} className="glass-panel p-6">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <CheckSquare className="text-secondary" size={24} />
                    <h3 className="text-xl font-semibold text-white m-0">Jira</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="form-label">Domain</label>
                          <input className="form-input" type="text" placeholder="yourcompany.atlassian.net" value={form.jira.domain || ''} onChange={e => handleChange('jira', 'domain', e.target.value)} />
                      </div>
                      <div>
                          <label className="form-label">Email Address</label>
                          <input className="form-input" type="email" placeholder="user@company.com" value={form.jira.email || ''} onChange={e => handleChange('jira', 'email', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                          <label className="form-label">API Token</label>
                          <input className="form-input" type="password" placeholder="Jira API Token" value={form.jira.token || ''} onChange={e => handleChange('jira', 'token', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                          <label className="form-label">Projects (comma-separated keys)</label>
                          <input className="form-input" type="text" placeholder="PROJ, ENG" value={form.jira.projects || ''} onChange={e => handleChange('jira', 'projects', e.target.value)} />
                      </div>
                  </div>
              </motion.div>

              {/* Jenkins */}
              <motion.div variants={itemVariants} className="glass-panel p-6">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <Layers className="text-accent" size={24} />
                    <h3 className="text-xl font-semibold text-white m-0">Jenkins</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                          <label className="form-label">Base URL</label>
                          <input className="form-input" type="text" placeholder="https://jenkins.company.com" value={form.jenkins.baseUrl || ''} onChange={e => handleChange('jenkins', 'baseUrl', e.target.value)} />
                      </div>
                      <div>
                          <label className="form-label">Username</label>
                          <input className="form-input" type="text" placeholder="admin" value={form.jenkins.username || ''} onChange={e => handleChange('jenkins', 'username', e.target.value)} />
                      </div>
                      <div>
                          <label className="form-label">API Token / Password</label>
                          <input className="form-input" type="password" placeholder="Jenkins Token" value={form.jenkins.token || ''} onChange={e => handleChange('jenkins', 'token', e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                          <label className="form-label">Jobs (comma-separated)</label>
                          <input className="form-input" type="text" placeholder="Backend-Deploy, Frontend-Build" value={form.jenkins.jobs || ''} onChange={e => handleChange('jenkins', 'jobs', e.target.value)} />
                      </div>
                  </div>
              </motion.div>

              {/* View Permissions */}
              <RoleGuard allowedRoles={['admin']}>
                <motion.div variants={itemVariants} className="glass-panel p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                      <Shield className="text-white" size={24} />
                      <h3 className="text-xl font-semibold text-white m-0">Dashboard View Permissions</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-lg font-medium text-white mb-3">Manager Role View</h4>
                            <div className="space-y-3">
                                {[
                                  { id: 'commit_frequency', label: 'Commit Frequency Chart' },
                                  { id: 'build_success', label: 'Build Success Rate' },
                                  { id: 'issue_resolution', label: 'Issue Resolution Chart' }
                                ].map(view => (
                                    <label key={`manager-${view.id}`} className="flex items-center gap-3 text-gray-300">
                                        <input 
                                          type="checkbox" 
                                          className="form-checkbox h-5 w-5 text-primary rounded border-white/20 bg-dark-bg focus:ring-primary focus:ring-offset-dark-bg"
                                          checked={form.permissions?.manager?.includes(view.id) || false}
                                          onChange={(e) => handlePermissionChange('manager', view.id, e.target.checked)}
                                        />
                                        {view.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-white mb-3">Developer Role View</h4>
                            <div className="space-y-3">
                                {[
                                  { id: 'commit_frequency', label: 'Commit Frequency Chart' },
                                  { id: 'build_success', label: 'Build Success Rate' },
                                  { id: 'issue_resolution', label: 'Issue Resolution Chart' }
                                ].map(view => (
                                    <label key={`developer-${view.id}`} className="flex items-center gap-3 text-gray-300">
                                        <input 
                                          type="checkbox" 
                                          className="form-checkbox h-5 w-5 text-primary rounded border-white/20 bg-dark-bg focus:ring-primary focus:ring-offset-dark-bg"
                                          checked={form.permissions?.developer?.includes(view.id) || false}
                                          onChange={(e) => handlePermissionChange('developer', view.id, e.target.checked)}
                                        />
                                        {view.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
              </RoleGuard>

              <RoleGuard allowedRoles={['admin']}>
                  <motion.div variants={itemVariants} className="flex justify-end pt-4 pb-12">
                      <button 
                        type="submit" 
                        disabled={saving} 
                        className="btn-primary flex items-center gap-2 px-6 py-3"
                      >
                          <Save size={18} />
                          {saving ? 'Saving...' : 'Save Configuration'}
                      </button>
                  </motion.div>
              </RoleGuard>
          </motion.form>
      )}
    </div>
  );
};

export default Settings;