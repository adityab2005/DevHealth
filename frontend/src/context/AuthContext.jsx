import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Mocked state for role-based access control. Change 'admin' to 'manager' or 'developer' to test.
  const [user, setUser] = useState({
    name: 'Demo User',
    role: 'admin', // allowed roles: 'admin', 'manager', 'developer'
  });

  const login = (role) => setUser({ name: `Test ${role}`, role });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);