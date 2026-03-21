const express = require('express');
const healthRoute = require('./health.route');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const onboardingRoute = require('./onboarding.route');
const quickActionRoute = require('./quickAction.route');
const dashboardRoute = require('./dashboard.route');

const router = express.Router();

router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/onboarding', onboardingRoute);
router.use('/quick-actions', quickActionRoute);
router.use('/dashboard', dashboardRoute);

module.exports = router;
