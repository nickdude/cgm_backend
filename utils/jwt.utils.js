const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'cgm_secret_key_2025';
const JWT_EXPIRE = '7d';
const REFRESH_TOKEN_EXPIRE = '30d';

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });

  return { accessToken, refreshToken };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

module.exports = {
  generateOTP,
  generateTokens,
  verifyToken,
  generateRandomString,
  JWT_SECRET,
  JWT_EXPIRE,
};
