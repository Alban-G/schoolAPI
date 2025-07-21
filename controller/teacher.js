const { Teacher, User, Classroom , Assignment } = require('../models/model');
const bcrypt = require('bcrypt');

// add teacher
exports.addTeacher = async (req, res) => {
    try {
        const { email } = req.body;
        // Check if the teacher already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Check if the teacher already exists in the Teacher collection
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ message: 'Teacher already exists in the Teacher collection' });
        }
        // Create a new teacher
        const newTeacher = new Teacher(req.body);
        const savedTeacher = await newTeacher.save();

        // we create a corresponding user docs
        // default password
        const defaultPassword = 'teacher123';
        const password = await bcrypt.hash(defaultPassword, 10);

        const newUser = new User({
            name: savedTeacher.name,
            email: savedTeacher.email,
            password: password,
            role: 'teacher',
            teacher: savedTeacher._id
        });
        await newUser.save();
        res.status(201).json({ message: 'Teacher added successfully', teacher: savedTeacher });
    } catch (error) {
        console.error('Error adding teacher:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json({ teachers });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json({ teacher });
    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// // update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const requestingUser = req.user;
    const { role, userId } = requestingUser;
 
    let targetTeacherId = req.params.id;
 
    // If teacher is updating themselves, get their own teacher ID
    if (role === 'teacher') {
        const linkedUser = await User.findById(userId);
        if (!linkedUser || !linkedUser.teacher) {
            return res.status(404).json({ message: 'Linked teacher not found' });
        }
        targetTeacherId = linkedUser.teacher; // Use the teacher ID linked to the user+
    }
    // Step 1: Get the teacher
    const teacher = await Teacher.findById(targetTeacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    // Step 2: Get the linked user
    const linkedUser = await User.findOne({ teacher: targetTeacherId });
    if (!linkedUser) {
      return res.status(404).json({ message: 'Linked user not found' });
    }
    // Step 3: Check if the user is authorized to update
    // Check if the user is an admin or updating their own profile
    // If the user is a teacher, they can only update their own profile
    const isAdmin = role === 'admin';
    const isSelf = linkedUser._id.toString() === userId.toString();
    if (!isAdmin && !isSelf) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }
    // Step 4: Update Teacher and user info
    // email change
    if (req.body.email) {
        // restrict email change to self
        if (!isSelf) {
            return res.status(403).json({ message: 'Forbidden: You can only change your own email.' });
        }
        // Check if the new email already exists
        const existingUser = await User.find({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
    };
    // role change
    if (req.body.role) {
        // restrict role change to admin
        if (!isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Only admins can change roles.' });
        }
        // Validate the new role
        const validRoles = ['admin', 'teacher'];
        if (!validRoles.includes(req.body.role)) {
            return res.status(400).json({ message: 'Invalid role specified.' });
        }
    }
    // password change
    if (req.body.password) {
        // restrict password change to self
        if (!isSelf) {
            return res.status(403).json({ message: 'Forbidden: You can only change your own password.' });
        }
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashPassword;
    };
    // save the updated teacher and user
    const updatedTeacher = await Teacher.findByIdAndUpdate(targetTeacherId, req.body, { new: true });
    const updatedUser = await User.findOneAndUpdate(
      { teacher: targetTeacherId },
        req.body ,
      { new: true });
    res.status(200).json({
      message: 'Teacher and user profile updated successfully',
      teacher: updatedTeacher,
      user: updatedUser
    });

 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// delete teacher
exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        // delete the teacher
        await Teacher.findByIdAndDelete(id);
        // delete the corresponding user
        await User.findOneAndDelete({ teacher: id });
        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// teachers get their classes
exports.getMyClasses = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Find the teacher linked to the user
        const teacher = await User.findById(userId);
        if (!teacher || !teacher.teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        // Get the classes associated with the teacher
        const classes = await Classroom.find({ teacher: teacher.teacher }).populate('students');
        res.status(200).json({ classes });
    } catch (error) {
        console.error('Error fetching classes for teacher:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
// teachers get their assignments
exports.getMyAssignment = async (req, res) => {
    try {
        // logged-In user
        const userId = req.user.userId
        const user = await User.findById(userId).populate('teacher');

        const assignments = await Assignment.find({postedBy: user.teacher._id})
        .populate ('classroom', 'name grade classyear')
        res.status(200).json(assignments)
    } catch {
        res.status(500).json({ message: 'internal server error', error: error.message })
    }
};