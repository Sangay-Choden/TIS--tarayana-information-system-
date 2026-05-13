// Mock Auth API
export const authAPI = {
  login: async (credentials) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      user: {
        id: '1',
        email: credentials.email,
        role: credentials.role || 'Field Officer'
      },
      token: 'mock-jwt-token'
    };
  },
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
  resetPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }
};
