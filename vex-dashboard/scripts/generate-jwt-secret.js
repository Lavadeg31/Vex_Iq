const crypto = require('crypto');

// Generate a random 64-character hex string
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('Your JWT Secret:', jwtSecret); 