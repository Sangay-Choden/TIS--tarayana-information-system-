import { authAPI } from '../auth/services/authAPI';

export const authService = {
  login: authAPI.login,
  logout: authAPI.logout,
  resetPassword: authAPI.resetPassword
};

export default authService;
