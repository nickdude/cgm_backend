const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const onboardingService = require('../services/onboarding.service');
const {
  validateUserId,
  validateOnboardingPayload,
} = require('../validations/onboarding.validation');

const getOnboardingQuestions = async (req, res, next) => {
  try {
    const result = await onboardingService.getQuestions();
    const response = new ApiResponse(200, 'Onboarding questions fetched successfully', result);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const getOnboardingAnswers = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    const result = await onboardingService.getAnswersByUserId(userId);
    const response = new ApiResponse(200, 'Onboarding answers fetched successfully', result);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const saveOnboardingAnswers = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    const bodyValidation = validateOnboardingPayload(req.body);
    if (!bodyValidation.isValid) {
      throw new ApiError(400, JSON.stringify(bodyValidation.errors));
    }

    const result = await onboardingService.saveAnswersByUserId(
      userId,
      bodyValidation.sanitizedData
    );

    const response = new ApiResponse(200, 'Onboarding answers saved successfully', result);
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOnboardingQuestions,
  getOnboardingAnswers,
  saveOnboardingAnswers,
};
