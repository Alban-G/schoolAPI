const express = require('express');
const router = express.Router();
const adminDashController = require('../controller/adminDash');
// Import authentication and authorization middleware
const { authenticate, authorizeRoles } = require('../middleware/auth');

// stats
router.get('/', authenticate, authorizeRoles("admin"), adminDashController.adminDashStats);


module.exports = router;