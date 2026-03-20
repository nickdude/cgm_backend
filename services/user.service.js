const User = require('../models/user.model');
const ApiError = require('../utils/apiError');

const mapUserProfile = (user) => ({
  _id: user._id,
  email: user.email || '',
  phone: user.mobile || null,
  fullName: user.name || '',
  photoUrl: user.profileImage || null,
  signUpMethod: user.signUpMethod || null,
  onboardingComplete: Boolean(user.onboardingComplete),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getProfileById = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  return mapUserProfile(user);
};

const updateProfileById = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  if (updateData.email && updateData.email !== user.email) {
    const existingEmail = await User.findOne({ email: updateData.email, _id: { $ne: userId } });
    if (existingEmail) {
      throw new ApiError(409, 'Email already in use');
    }
  }

  if (updateData.mobile && updateData.mobile !== user.mobile) {
    const existingMobile = await User.findOne({ mobile: updateData.mobile, _id: { $ne: userId } });
    if (existingMobile) {
      throw new ApiError(409, 'Mobile number already in use');
    }
  }

  Object.assign(user, updateData);
  await user.save();

  return mapUserProfile(user);
};

const updateProfilePhotoById = async (userId, photoUrl) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  user.profileImage = photoUrl;
  await user.save();

  return mapUserProfile(user);
};

module.exports = {
  getProfileById,
  updateProfileById,
  updateProfilePhotoById,
};
