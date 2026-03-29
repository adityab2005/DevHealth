import React, { useState, useEffect } from 'react';
import { fetchMetrics } from '../api/metrics';
import ProjectSelector from '../components/ProjectSelector';
import CommitFrequencyChart from '../components/charts/CommitFrequencyChart';
import BuildSuccessRateChart from '../components/charts/BuildSuccessRateChart';
import IssuesChart from '../components/charts/IssuesChart';
import RoleGuard from '../components/RoleGuard';
import { useAuth } from '../context/AuthContext';

// Hardcoded for demo - could also be fetched from another API
const AVAILABLE_PROJECTS = ['devhealth_core', 'Deploy_DevHealth_Backend', 'DEFAULT_PROJECT'];

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState(AVAILABLE_PROJECTS[0]);
  
  const [commitsData, setCommitsData] = useState([]);
  const [buildsData, setBuildsData] = useState([]);
  const [issuesData, setIssuesData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [commits, builds, issues] = await Promise.all([
          fetchMetrics(selectedProject, 'commit_frequency'),
          fetchMetrics(selectedProject, 'build_success_rate'),
          fetchMetrics(selectedProject, ['issues_opened', 'issues_closed'])
        ]);
        
        setCommitsData(commits);
        setBuildsData(builds);
        setIssuesData(issues);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    // In a real app, you might want to set up an interval for live polling here
  }, [selectedProject]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#111827' }}>DevHealth Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>Welcome back, {user?.name} ({user?.role})</p>
        </div>
        <ProjectSelector 
          projects={AVAILABLE_PROJECTS} 
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
        />
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading metrics...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Top Row: Commits and Builds */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '20px' }}>
            
            <RoleGuard allowedRoles={['admin', 'manager', 'developer']}>
              <CommitFrequencyChart data={commitsData} />
            </RoleGuard>

            {/* Let's pretend only admins and managers care about build health */}
            <RoleGuard allowedRoles={['admin', 'manager']}>
                <BuildSuccessRateChart data={buildsData} />
            </RoleGuard>

          </div>

          {/* Bottom Row: Issues */}
          <div style={{ paddingBottom: '40px' }}>
             {/* Read-access to product managers, admins, developers */}
            <RoleGuard allowedRoles={['admin', 'manager', 'developer']}>
              <IssuesChart data={issuesData} />
            </RoleGuard>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;