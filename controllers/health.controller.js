const ApiResponse = require('../utils/apiResponse');

const getHealth = (req, res) => {
  const response = new ApiResponse(200, 'Backend is running', {
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json(response);
};

module.exports = {
  getHealth,
};
