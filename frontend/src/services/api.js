// Placeholder for API service
const api = {
  get: async (url) => {
    console.log(`GET ${url}`);
    return { data: [] };
  },
  post: async (url, data) => {
    console.log(`POST ${url}`, data);
    return { data: {} };
  }
};

export default api;
