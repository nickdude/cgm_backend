const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const cgmService = require('../services/cgm.service');
const { validateUserId, validateCgmQueryParams } = require('../validations/cgm.validation');

const getEvents = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    const queryValidation = validateCgmQueryParams(req.query);
    if (!queryValidation.isValid) {
      throw new ApiError(400, JSON.stringify(queryValidation.errors));
    }

    const events = await cgmService.getCgmEvents(userId, queryValidation.sanitizedData);
    const response = new ApiResponse(200, 'Glucose events retrieved successfully', {
      count: events.length,
      data: events,
    });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
};
