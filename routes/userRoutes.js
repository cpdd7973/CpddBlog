const express = require('express');
const authController = require('../controllers/userController');
const router = express.Router();

// Route to handle user registration
router.post('/signup', authController.registerUser);

// Route to handle user login
router.post('/login', authController.loginUser);

// Route to handle user logout
router.get('/logout', authController.logoutUser);

// Route to update user's bio
router.patch('/:id/bio', authController.updateUserBio);

module.exports = router;