const express = require('express');
const router = express.Router();
const parentDashController = require('../controller/parentDash');
// Import authentication and authorization middleware
const { authenticate, authorizeRoles } = require('../middleware/auth');

// stats
router.get('/', authenticate, authorizeRoles("parent"), parentDashController.parentDash);
router.get('/:id', parentDashController.getStudentAssignments);


module.exports = router;