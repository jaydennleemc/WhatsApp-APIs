// Middleware to handle base path routing
const basePathMiddleware = (req, res, next) => {
  // Get base path from environment variable, fallback to empty string
  const basePath = process.env.BASE_PATH || process.env.BUILD_BASE_PATH || '';
  
  // Normalize the base path (ensure it starts with / and doesn't end with / unless it's just /)
  let normalizedBasePath = basePath;
  if (normalizedBasePath && !normalizedBasePath.startsWith('/')) {
    normalizedBasePath = '/' + normalizedBasePath;
  }
  if (normalizedBasePath.length > 1 && normalizedBasePath.endsWith('/')) {
    normalizedBasePath = normalizedBasePath.slice(0, -1);
  }

  // Store the normalized base path in the request object for later use
  req.basePath = normalizedBasePath;
  
  // If there's a base path configured, ensure the request path starts with it
  if (normalizedBasePath && normalizedBasePath !== '/') {
    if (req.url.startsWith(normalizedBasePath)) {
      // Remove the base path prefix from the URL for routing
      req.url = req.url.substring(normalizedBasePath.length);
      if (req.url === '' || req.url === '/') {
        req.url = '/'; // Ensure root path
      }
    } else {
      // If the request doesn't include the base path, set basePath to empty 
      // so the middleware doesn't interfere with routing
      req.basePath = '';
    }
  }
  
  next();
};

module.exports = basePathMiddleware;