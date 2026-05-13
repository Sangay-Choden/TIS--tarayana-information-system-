export const userService = {
  getUsers: async () => {
    // Mock API call
    return [
      { id: 1, name: 'Admin User', role: 'Admin' },
      { id: 2, name: 'Field Officer', role: 'Field Officer' }
    ];
  }
};

export default userService;
