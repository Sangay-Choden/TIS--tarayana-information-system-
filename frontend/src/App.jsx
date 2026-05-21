import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import AppRoutes from './routes/AppRoutes';
import AuthRoutes from './routes/AuthRoutes';

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/*" element={<AuthRoutes />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </BrowserRouter>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
