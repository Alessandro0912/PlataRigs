// authMiddleware.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Kein Token bereitgestellt' });
  }
  const token = authHeader.split(' ')[1];
  const { data: user, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Ungültiges oder abgelaufenes Token' });
  }

  // Optional: Rolle prüfen
  // if (!['admin','lagerist'].includes(user.role)) { ... }

  req.user = user; 
  next();
};
