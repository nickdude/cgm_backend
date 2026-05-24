const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const cgmService = require('../services/cgm.service');
const { validateUserId, validateCgmReadingsPayload, validateCgmQueryParams } = require('../validations/cgm.validation');

const saveReadings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    const bodyValidation = validateCgmReadingsPayload(req.body);
    if (!bodyValidation.isValid) {
      throw new ApiError(400, JSON.stringify(bodyValidation.errors));
    }

    console.log(
      `📥 CGM readings request: userId=${userId}, count=${bodyValidation.sanitizedData.readings.length}`
    );

    const result = await cgmService.saveCgmReadings(userId, bodyValidation.sanitizedData.readings);
    console.log(
      `✅ CGM readings stored: userId=${userId}, inserted=${result.insertedCount}, matched=${result.matchedCount}, modified=${result.modifiedCount}`
    );
    const response = new ApiResponse(201, 'CGM readings stored successfully', result);
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const getReadings = async (req, res, next) => {
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

    const readings = await cgmService.getCgmReadings(userId, queryValidation.sanitizedData);
    const response = new ApiResponse(200, 'CGM readings retrieved successfully', {
      count: readings.length,
      data: readings,
    });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveReadings,
  getReadings,
};
