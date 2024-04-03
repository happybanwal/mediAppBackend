const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    console.log('Token:', token); // Log the token
    if (!token) {
      return res.status(401).json({ error: 'Token is missing' });
    }
  
    jwt.verify(token.split(' ')[1], 'your-secret-key', (err, decodedToken) => { // Extract token value
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.user = decodedToken;
      next();
    });
  };
  
module.exports = verifyToken;
