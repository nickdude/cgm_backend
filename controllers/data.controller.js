const ApiResponse = require('../utils/apiResponse');
const dataService = require('../services/data.service');

const getDataPage = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await dataService.getDataPageByUserId(userId);
    const response = new ApiResponse(200, 'Data page fetched successfully', result);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDataPage,
};
