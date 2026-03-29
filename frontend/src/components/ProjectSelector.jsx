import React from 'react';

const ProjectSelector = ({ projects, selectedProject, onSelectProject }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label htmlFor="project-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>
        Select Project Context:
      </label>
      <select
        id="project-select"
        value={selectedProject}
        onChange={(e) => onSelectProject(e.target.value)}
        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
      >
        {projects.map((proj) => (
          <option key={proj} value={proj}>
            {proj}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProjectSelector;