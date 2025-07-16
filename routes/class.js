const express = require('express');
const router = express.Router();
const classroomController = require('../controller/classroom');
// Import authentication and authorization middleware
const { authenticate, authorizeRoles } = require('../middleware/auth');

router.post('/', classroomController.createClassroom);
//get
router.get('/', classroomController.getAllClassrooms);
router.get('/:id', authenticate, classroomController.getClassroomById);
// update
router.put('/:id', classroomController.updateClassroom);
// delete
router.delete('/:id', authenticate, authorizeRoles("admin"),classroomController.deleteClassroom);

module.exports = router;