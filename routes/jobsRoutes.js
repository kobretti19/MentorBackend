const express = require('express');
const authController = require('./../controllers/authController');
const jobsController = require('./../controllers/jobsController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(jobsController.getAllJobs)
  .post(authController.restrictTo('startup'), jobsController.createJob);

router.get('/overview', jobsController.getOverview);
router.get('/user/:id', jobsController.getJobWithUserId);

router
  .route('/:id')
  .get(jobsController.getJobWithAcceptedStatus)
  .patch(authController.protect, jobsController.updateJob)
  .delete(authController.protect, jobsController.deleteJob);

module.exports = router;
