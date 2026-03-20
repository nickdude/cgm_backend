const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const quickActionService = require('../services/quickAction.service');
const {
  validateUserId,
  validateDietPayload,
  validateInsulinPayload,
  validateMedicinePayload,
  validateExercisePayload,
  validateFingerBloodPayload,
} = require('../validations/quickAction.validation');

const buildUploadedImageUrls = (req) => {
  if (!Array.isArray(req.files) || req.files.length === 0) {
    return [];
  }

  return req.files.map((file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
};

const saveDiet = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    const bodyValidation = validateDietPayload(req.body);
    if (!bodyValidation.isValid) {
      throw new ApiError(400, JSON.stringify(bodyValidation.errors));
    }

    const uploadedImageUrls = buildUploadedImageUrls(req);
    const payload = {
      ...bodyValidation.sanitizedData,
      imageUrls: uploadedImageUrls.length
        ? uploadedImageUrls
        : bodyValidation.sanitizedData.imageUrls,
    };

    const entry = await quickActionService.saveDietEntry(userId, payload);

    const response = new ApiResponse(201, 'Diet entry saved successfully', { entry });
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const saveInsulin = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    const bodyValidation = validateInsulinPayload(req.body);
    if (!bodyValidation.isValid) {
      throw new ApiError(400, JSON.stringify(bodyValidation.errors));
    }

    const uploadedImageUrls = buildUploadedImageUrls(req);
    const payload = {
      ...bodyValidation.sanitizedData,
      imageUrls: uploadedImageUrls.length
        ? uploadedImageUrls
        : bodyValidation.sanitizedData.imageUrls,
    };

    const entry = await quickActionService.saveInsulinEntry(userId, payload);

    const response = new ApiResponse(201, 'Insulin entry saved successfully', { entry });
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const saveMedicine = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    const bodyValidation = validateMedicinePayload(req.body);
    if (!bodyValidation.isValid) {
      throw new ApiError(400, JSON.stringify(bodyValidation.errors));
    }

    const uploadedImageUrls = buildUploadedImageUrls(req);
    const payload = {
      ...bodyValidation.sanitizedData,
      imageUrls: uploadedImageUrls.length
        ? uploadedImageUrls
        : bodyValidation.sanitizedData.imageUrls,
    };

    const entry = await quickActionService.saveMedicineEntry(userId, payload);

    const response = new ApiResponse(201, 'Medicine entry saved successfully', { entry });
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const saveExercise = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    const bodyValidation = validateExercisePayload(req.body);
    if (!bodyValidation.isValid) {
      throw new ApiError(400, JSON.stringify(bodyValidation.errors));
    }

    const uploadedImageUrls = buildUploadedImageUrls(req);
    const payload = {
      ...bodyValidation.sanitizedData,
      imageUrls: uploadedImageUrls.length
        ? uploadedImageUrls
        : bodyValidation.sanitizedData.imageUrls,
    };

    const entry = await quickActionService.saveExerciseEntry(userId, payload);

    const response = new ApiResponse(201, 'Exercise entry saved successfully', { entry });
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const saveFingerBlood = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    const bodyValidation = validateFingerBloodPayload(req.body);
    if (!bodyValidation.isValid) {
      throw new ApiError(400, JSON.stringify(bodyValidation.errors));
    }

    const entry = await quickActionService.saveFingerBloodEntry(
      userId,
      bodyValidation.sanitizedData
    );

    const response = new ApiResponse(201, 'Finger blood entry saved successfully', { entry });
    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveDiet,
  saveInsulin,
  saveMedicine,
  saveExercise,
  saveFingerBlood,
};
