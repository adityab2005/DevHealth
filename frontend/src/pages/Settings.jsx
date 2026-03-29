import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const Settings = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [availableProjects, setAvailableProjects] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [form, setForm] = useState({
    github: { token: '', repositories: '' },
    jira: { domain: '', email: '', token: '', projects: '' },
    jenkins: { baseUrl: '', username: '', token: '', jobs: '' }
  });

  // Fetch project list
  useEffect(() => {
    const init = async () => {
       try {
           const res = await apiClient.get('/integrations');
           if (res.data && res.data.length > 0) {
               setAvailableProjects(res.data);
               setSelectedProject(res.data[0]);
           }
       } catch (err) { }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedProject) fetchConfig();
  }, [selectedProject]);

  const fetchConfig = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await apiClient.get(`/integrations/${selectedProject}`);
      if (response.data) {
        setForm({
          github: response.data.github || { token: '', repositories: '' },
          jira: response.data.jira || { domain: '', email: '', token: '', projects: '' },
          jenkins: response.data.jenkins || { baseUrl: '', username: '', token: '', jobs: '' }
        });
      }
    } catch (error) {
      // If fetching new generic ID, just clear it
      setForm({
        github: { token: '', repositories: '' },
        jira: { domain: '', email: '', token: '', projects: '' },
        jenkins: { baseUrl: '', username: '', token: '', jobs: '' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedProject.trim()) {
        setMessage({ text: 'Project Name is required!', type: 'error' });
        return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
        await apiClient.post('/integrations', {
            project_id: selectedProject,
            ...form
        });
        setMessage({ text: 'Configuration saved successfully!', type: 'success' });
        
        // Refresh project list to include any new manually typed ones
        const res = await apiClient.get('/integrations');
        setAvailableProjects(res.data);

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

  // UI styles
  const sectionStyle = {
      background: 'white',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '20px'
  };
  
  const inputStyle = {
      display: 'block',
      width: '100%',
      padding: '8px 12px',
      marginTop: '5px',
      marginBottom: '15px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
         <h1 style={{ margin: 0, color: '#111827' }}>Integration Settings</h1>
         
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
             <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Create or Select Project Context:</label>
             <input 
                type="text"
                list="projects-datalist"
                placeholder="Enter new project name..."
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '200px' }}
             />
             <datalist id="projects-datalist">
                {availableProjects.map(p => <option key={p} value={p} />)}
             </datalist>
         </div>
      </div>
      
      {message.text && (
          <div style={{ padding: '12px', borderRadius: '4px', marginBottom: '20px', 
                        backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                        color: message.type === 'success' ? '#065f46' : '#991b1b' }}>
              {message.text}
          </div>
      )}

      {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading settings...</div>
      ) : (
          <form onSubmit={handleSave}>
              <div style={sectionStyle}>
                  <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>GitHub</h3>
                  <label>Personal Access Token (PAT)</label>
                  <input style={inputStyle} type="password" placeholder="ghp_..." value={form.github.token || ''} onChange={e => handleChange('github', 'token', e.target.value)} />
                  <label>Repositories (comma-separated: owner/repo)</label>
                  <input style={inputStyle} type="text" placeholder="facebook/react, adobe/react-native" value={form.github.repositories || ''} onChange={e => handleChange('github', 'repositories', e.target.value)} />
              </div>

              <div style={sectionStyle}>
                  <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Jira</h3>
                  <label>Domain</label>
                  <input style={inputStyle} type="text" placeholder="yourcompany.atlassian.net" value={form.jira.domain || ''} onChange={e => handleChange('jira', 'domain', e.target.value)} />
                  <label>Email Address</label>
                  <input style={inputStyle} type="email" placeholder="user@company.com" value={form.jira.email || ''} onChange={e => handleChange('jira', 'email', e.target.value)} />
                  <label>API Token</label>
                  <input style={inputStyle} type="password" placeholder="Jira API Token" value={form.jira.token || ''} onChange={e => handleChange('jira', 'token', e.target.value)} />
                  <label>Projects (comma-separated keys)</label>
                  <input style={inputStyle} type="text" placeholder="PROJ, ENG" value={form.jira.projects || ''} onChange={e => handleChange('jira', 'projects', e.target.value)} />
              </div>

              <div style={sectionStyle}>
                  <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Jenkins</h3>
                  <label>Base URL</label>
                  <input style={inputStyle} type="text" placeholder="https://jenkins.company.com" value={form.jenkins.baseUrl || ''} onChange={e => handleChange('jenkins', 'baseUrl', e.target.value)} />
                  <label>Username</label>
                  <input style={inputStyle} type="text" placeholder="admin" value={form.jenkins.username || ''} onChange={e => handleChange('jenkins', 'username', e.target.value)} />
                  <label>API Token / Password</label>
                  <input style={inputStyle} type="password" placeholder="Jenkins Token" value={form.jenkins.token || ''} onChange={e => handleChange('jenkins', 'token', e.target.value)} />
                  <label>Jobs (comma-separated)</label>
                  <input style={inputStyle} type="text" placeholder="Backend-Deploy, Frontend-Build" value={form.jenkins.jobs || ''} onChange={e => handleChange('jenkins', 'jobs', e.target.value)} />
              </div>

              <div style={{ textAlign: 'right', marginBottom: '40px' }}>
                  <button type="submit" disabled={saving} style={{ 
                      padding: '10px 24px', 
                      background: saving ? '#9ca3af' : '#2563eb', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px'
                  }}>
                      {saving ? 'Saving...' : 'Save Configuration'}
                  </button>
              </div>
          </form>
      )}
    </div>
  );
};

export default Settings;