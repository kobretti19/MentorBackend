const express = require('express');
const assignmentController = require('./../controllers/assignmentController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(assignmentController.createAssignment)
  .get(assignmentController.getAllAssignments);

router.get('/user/:userId', assignmentController.getAssignmentsByUserId);
router.get(
  '/user/noreject/:userId',
  assignmentController.getAssignmentsByUserIdNoRejected
);

router.patch(
  '/:assignmentId/status',
  assignmentController.updateAssignmentStatus
);
router.use(authController.protect);
router.get('/:assignmentId', assignmentController.getAssignment);

module.exports = router;
