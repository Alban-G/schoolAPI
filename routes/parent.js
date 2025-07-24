const express = require('express');
const router = express.Router();
const parentController = require('../controller/parent');
// Import authentication and authorization middleware
const { authenticate, authorizeRoles } = require('../middleware/auth');

// post
router.post('/', authenticate, authorizeRoles("admin"), parentController.addParent);
// get
router.get('/', authenticate, authorizeRoles("admin"), parentController.getAllParents);
// put
router.put('/:id', authenticate, authorizeRoles("admin"), parentController.updateParent);
router.put('/self', authenticate, authorizeRoles("parent"), parentController.updateParent);

module.exports = router;