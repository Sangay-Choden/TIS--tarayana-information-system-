const logActivity = require('../utils/logger');

/**
 * Maps API routes to meaningful business actions
 */
const routeActionMap = {
  'POST /api/projects': { entity: 'Project', action: 'Created' },
  'PUT /api/projects': { entity: 'Project', action: 'Updated' },
  'PATCH /api/projects': { entity: 'Project', action: 'Updated' },
  'DELETE /api/projects': { entity: 'Project', action: 'Deleted' },

  'POST /api/programmes': { entity: 'Programme', action: 'Created' },
  'PUT /api/programmes': { entity: 'Programme', action: 'Updated' },
  'PATCH /api/programmes': { entity: 'Programme', action: 'Updated' },
  'DELETE /api/programmes': { entity: 'Programme', action: 'Deleted' },

  'POST /api/beneficiaries': { entity: 'Beneficiary', action: 'Registered' },
  'PUT /api/beneficiaries': { entity: 'Beneficiary', action: 'Updated' },
  'PATCH /api/beneficiaries': { entity: 'Beneficiary', action: 'Updated' },
  'DELETE /api/beneficiaries': { entity: 'Beneficiary', action: 'Deleted' },

  'POST /api/auth/register': { entity: 'User', action: 'Registered' },
  'POST /api/roles/create': { entity: 'UserRole', action: 'Created' },
  // 'DELETE /api/user/:id': { entity: 'User', action: 'Deleted' },
  // 'DELETE /api/roles/delete/:id': { entity: 'UserRole', action: 'Deleted' }
};

/**
 * Normalize role into readable format
 */
const formatUserRole = (roleName) => {
  if (!roleName) return 'UnknownRole';

  const roleMap = {
    programmeOfficer: 'Programme Officer',
    fieldOfficer: 'Field Officer',
    management: 'Management',
    'C&D Officer': 'C&D Officer',
    'M&R Officer': 'M&R Officer'
  };

  return roleMap[roleName] || roleName;
};

const activityMiddleware = (req, res, next) => {
  const monitoredMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (!monitoredMethods.includes(req.method)) {
    return next();
  }

  res.on('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 300) return;

  const routeKey = `${req.method} ${req.originalUrl.split('?')[0]}`;

const match = Object.entries(routeActionMap).find(([key]) => {
  const [method, path] = key.split(' ');

  if (method !== req.method) return false;

  const regex = new RegExp(
    '^' + path.replace(/:\w+/g, '[^/]+') + '$'
  );

  return regex.test(req.originalUrl.split('?')[0]);
})?.[1];

    if (!match) return;

    const userId = req.user?.id || null;
    const userName = req.user?.email || 'System';

    // Context-aware message
    let description = '';

   if (match.entity === 'UserRole') {
  const roleName = req.body?.roleName || req.body?.name || req.body?.role;

  const role = formatUserRole(roleName);

  description = `Created role: ${role}`;
}else if (match.entity === 'User' && req.originalUrl.includes('/auth/register')) {
const roleName = req.body?.roleName || req.body?.name || req.body?.role;

  const role = formatUserRole(roleName);
  description = `Registered ${role}`;
}


else {
  const entityLower = match.entity.toLowerCase();
  description = `${match.action} a ${entityLower}`;
}

    logActivity(
      userId,
      match.action,
      match.entity,
      req.params?.id || null,
      description,
      userName
    );
  });

  next();

};

module.exports = activityMiddleware;