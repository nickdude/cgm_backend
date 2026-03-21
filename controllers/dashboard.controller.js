const ApiResponse = require('../utils/apiResponse');
const dashboardService = require('../services/dashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await dashboardService.getDashboardByUserId(userId);
    const response = new ApiResponse(200, 'Dashboard data fetched successfully', result);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};
