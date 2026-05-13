const logActivity = require('../utils/logger');

const activityMiddleware = (req, res, next) => {
  const monitoredMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (monitoredMethods.includes(req.method)) {
    res.on('finish', () => {
      // Only log if the request was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        
        // Ensure userId is either a valid ID or null (never a random string)
        const userId = req.user && req.user.id ? req.user.id : null;
        const userName = req.user && req.user.name ? req.user.name : 'System';
        
        const entity = req.originalUrl.split('/')[2] || 'system';
        
        const actionMap = {
          'POST': 'Created',
          'PUT': 'Updated',
          'PATCH': 'Updated',
          'DELETE': 'Deleted'
        };

        logActivity(
          userId,
          actionMap[req.method],
          entity,
          null, // entityId
          `${actionMap[req.method]} a ${entity}`,
          userName
        );
      }
    });
  }
  next();
};

module.exports = activityMiddleware;