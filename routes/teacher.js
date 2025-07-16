const express = require('express');
const router = express.Router();
const teacherController = require('../controller/teacher');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Add a new teacher
router.post('/', authenticate, authorizeRoles("admin"), teacherController.addTeacher);
//get
router.get('/', authenticate, teacherController.getAllTeachers);
router.get('/classes', authenticate, teacherController.getMyClasses);
router.get('/:id', authenticate, teacherController.getTeacherById);
// update
router.put('/:id', authenticate, authorizeRoles("admin", "teacher"), teacherController.updateTeacher);
router.put('/self', authenticate, authorizeRoles("teacher"), teacherController.updateTeacher);
// delete
router.delete('/:id', authenticate, authorizeRoles("admin"),teacherController.deleteTeacher);



module.exports = router;