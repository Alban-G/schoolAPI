const express = require('express');
const router = express.Router();
const assignmentController = require('../controller/assignment')
const { authenticate, authorizeRoles } = require('../middleware/auth');

//get
router.get('/',authenticate ,authorizeRoles('admin') , assignmentController.getAllAssignment)
router.get('/:id', authenticate, assignmentController.getAssignmentById)
// post
router.post('/', authenticate, assignmentController.addAssignment)
// put
router.put('/:id', authenticate, authorizeRoles('teacher'), assignmentController.updateAssignment)
// delete
router.delete('/:id', authenticate, authorizeRoles("teacher"),assignmentController.deleteAssignment);

module.exports = router;