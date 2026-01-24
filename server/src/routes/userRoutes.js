const express = require('express');
const router = express.Router();
// 1. Import the entire object as 'userController'
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);           // Fetch all users
router.post('/', userController.createUser);        // Create/Sign up user
router.put('/:id', userController.updateUser);      // Update user
router.delete('/:id', userController.deleteUser);   // Delete user

// 4. Add the Login/Logout routes
router.post('/login', userController.login);
router.post('/logout', userController.logout);

module.exports = router;