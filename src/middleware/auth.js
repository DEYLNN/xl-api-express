export function requireAuth(req, res, next) {
  const { accessToken, tokenExpiry } = req.session;
  
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated. Please login first.'
    });
  }
  
  // Check if token is expired
  if (tokenExpiry && Date.now() > tokenExpiry) {
    return res.status(401).json({
      success: false,
      error: 'Token expired. Please refresh or login again.'
    });
  }
  
  next();
}

export default { requireAuth };
