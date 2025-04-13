const express = require('express');

const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');
const assignmentController = require('./../controllers/assignmentController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/finduser', authController.getUserData);

router.route('/mentors').get(userController.getAllMentors);
router.route('/startup').get(userController.getAllStartUp);

router.patch(
  '/updateMe',
  userController.upoadsUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.route('/startups/:startupId').get(userController.getStartupWithJobs);

module.exports = router;
