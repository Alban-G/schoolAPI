const express = require('express');
const router = express.Router();
const teachDashController = require('../controller/teacherDash');
// Import authentication and authorization middleware
const { authenticate, authorizeRoles } = require('../middleware/auth');

// stats
router.get('/', authenticate, authorizeRoles("teacher"), teachDashController.teacherDash);


module.exports = router;