const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const userService = require('../services/user.service');
const { validateUserId, validateUpdateProfile } = require('../validations/user.validation');

const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    const user = await userService.getProfileById(userId);

    const response = new ApiResponse(200, 'Profile fetched successfully', { user });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    const bodyValidation = validateUpdateProfile(req.body);
    if (!bodyValidation.isValid) {
      throw new ApiError(400, JSON.stringify(bodyValidation.errors));
    }

    const user = await userService.updateProfileById(userId, bodyValidation.sanitizedData);

    const response = new ApiResponse(200, 'Profile updated successfully', { user });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const uploadProfilePhoto = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.isValid) {
      throw new ApiError(400, JSON.stringify(userIdValidation.errors));
    }

    if (!req.file) {
      throw new ApiError(400, 'Image file is required');
    }

    const relativePath = `/uploads/${req.file.filename}`;
    const photoUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

    const user = await userService.updateProfilePhotoById(userId, photoUrl);

    const response = new ApiResponse(200, 'Profile photo uploaded successfully', { user });
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
};
