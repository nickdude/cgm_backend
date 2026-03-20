const express = require('express');
const onboardingController = require('../../controllers/onboarding.controller');

const router = express.Router();

router.get('/questions', onboardingController.getOnboardingQuestions);
router.get('/:userId', onboardingController.getOnboardingAnswers);
router.put('/:userId', onboardingController.saveOnboardingAnswers);

module.exports = router;
