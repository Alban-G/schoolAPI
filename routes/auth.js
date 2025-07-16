const express = require('express');
const router = express.Router();
const loginController = require('../controller/login');

router.post('/register', loginController.registerAdmin);
router.post('/login', loginController.login)
router.get('/users', loginController.getAllUsers);

module.exports = router;