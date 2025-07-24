const express = require('express');
const router = express.Router();
const studentController = require('../controller/student');
// Import authentication and authorization middleware
const { authenticate, authorizeRoles } = require('../middleware/auth');


// post
router.post('/', authenticate, authorizeRoles("admin"), studentController.uploadStudentImage, studentController.addStudent);
// get
router.get('/', authenticate, authorizeRoles("admin"), studentController.getAllStudents);
router.get('/:id', authenticate, studentController.getStudentById);
// put
router.put('/:id', studentController.updateStudent);
// delete
router.delete('/:id', authenticate, authorizeRoles("admin"), studentController.deleteStudent);

module.exports = router;