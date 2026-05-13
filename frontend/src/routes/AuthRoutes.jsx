import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../auth/components/AuthLayout';
import Login from '../auth/pages/Login';
import OTP from '../auth/pages/OTP';
import ForgotPassword from '../auth/pages/ForgotPassword';
import ResetPassword from '../auth/pages/ResetPassword';
import ConfirmPassword from '../auth/pages/ConfirmPassword';

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="otp" element={<OTP />} />
      <Route path="forgot-password" element={<ResetPassword />} />
      <Route path="confirm-password" element={<ConfirmPassword />} />
      <Route path="*" element={<Navigate to="login" replace />} />
    </Routes>
  );
};

export default AuthRoutes;
