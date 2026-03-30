import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { fetchMetrics } from '../api/metrics';
import CommitFrequencyChart from '../components/charts/CommitFrequencyChart';
import BuildSuccessRateChart from '../components/charts/BuildSuccessRateChart';
import IssuesChart from '../components/charts/IssuesChart';
import RoleGuard from '../components/RoleGuard';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();

  const [commitsData, setCommitsData] = useState([]);
  const [buildsData, setBuildsData] = useState([]);
  const [issuesData, setIssuesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [permissions, setPermissions] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [commits, builds, issues, configRes] = await Promise.all([
        fetchMetrics('commit_frequency'),
        fetchMetrics('build_success_rate'),
        fetchMetrics(['issues_opened', 'issues_closed']),
        apiClient.get('/integrations').catch(() => null)
      ]);

      setCommitsData(commits);
      setBuildsData(builds);
      setIssuesData(issues);

      if (configRes && configRes.data) {
        setLastSynced(configRes.data.last_synced || null);
        setPermissions(configRes.data.permissions || {
          manager: ['commit_frequency', 'build_success', 'issue_resolution'],
          developer: ['commit_frequency', 'issue_resolution']
        });
      } else {
        setLastSynced(null);
        setPermissions({
          manager: ['commit_frequency', 'build_success', 'issue_resolution'],
          developer: ['commit_frequency', 'issue_resolution']
        });
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.team_id) {
       loadData();
    }
  }, [user]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post('/integrations/sync');
      await loadData();
    } catch (error) {
      console.error('Failed to sync', error);
      alert('Failed to complete sync.');
    } finally {
      setSyncing(false);
    }
  };

  const hasPermission = (view_id) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (!permissions) return false;
    return permissions[user.role]?.includes(view_id) || false;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">Here's what's happening in your team's repositories.</p>
        </div>

        <div className="glass-panel px-4 py-2 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock size={16} className="text-primary" />
            {lastSynced ? `Synced: ${new Date(lastSynced).toLocaleTimeString()}` : 'Never synced'}
          </div>
          <div className="w-px h-6 bg-white/10" />
          <button 
            type="button" 
            onClick={handleSync} 
            disabled={syncing} 
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/40 text-primary-light border border-primary/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm text-white"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {hasPermission('commit_frequency') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="lg:col-span-2 glass-panel p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Commit Frequency
                </h3>
                <div className="h-[300px] w-full">
                  <CommitFrequencyChart data={commitsData} />
                </div>
              </motion.div>
            )}

            {hasPermission('build_success') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-panel p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    Build Success
                </h3>
                <div className="h-[300px] w-full">
                    <BuildSuccessRateChart data={buildsData} />
                </div>
              </motion.div>
            )}
          </div>

          {hasPermission('issue_resolution') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="glass-panel p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Issue Resolution
              </h3>
              <div className="h-[350px] w-full">
                <IssuesChart data={issuesData} />
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;