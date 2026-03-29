import React from 'react';
import { useAuth } from '../context/AuthContext';

const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
        <p><strong>Access Denied:</strong> You do not have permission to view this widget. Allowed roles: {allowedRoles.join(', ')}</p>
      </div>
    );
  }

  return children;
};

export default RoleGuard;