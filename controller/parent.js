const { Parent, User } = require('../models/model');
const bcrypt = require('bcrypt');

// Add parent
exports.addParent = async (req, res) => {
    try {
        // destructure required fields from req.body
        const { name ,email, nationalId } = req.body;
        // check if email exists
        const existingUser = await User.findOne({ email});
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        };
        // check if national ID exists
        const existingParent = await Parent.findOne({ nationalId});
        if (existingParent) {
            return res.status(400).json({ message: 'National ID already exists' });
        };
        // create new parent
        const newParent = new Parent(req.body);
        await newParent.save();
        // create a new user with role 'parent'
        const defaultPassword = 'parent123'; // default password for parent
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'parent',
            parent: newParent._id
        });
        await newUser.save();
        res.status(201).json({ message: 'Parent added successfully', parent: newParent });
    } catch (error) {
        res.status(500).json({ message: 'Error adding parent', error: error.message });
    }
}

// get all parents
exports.getAllParents = async (req, res) => {
    try {
        const parents = await Parent.find();
        res.status(200).json(parents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching parents', error: error.message });
    }
};

// update parent
// // update teacher
exports.updateParent = async (req, res) => {
  try {
    const requestingUser = req.user;
    const { role, userId } = requestingUser;
 
    let targetParentId = req.params.id;
 
    // If teacher is updating themselves, get their own teacher ID
    if (role === 'parent') {
        const linkedUser = await User.findById(userId);
        if (!linkedUser || !linkedUser.parent) {
            return res.status(404).json({ message: 'Linked parent not found' });
        }
        targetParentId = linkedUser.parent; // Use the parent ID linked to the user+
    }
    // Step 1: Get the teacher
    const parent = await Parent.findById(targetParentId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    // Step 2: Get the linked user
    const linkedUser = await User.findOne({ parent: targetParentId });
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
        const validRoles = ['admin', 'parent'];
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
    const updatedParent = await Parent.findByIdAndUpdate(targetParentId, req.body, { new: true });
    const updatedUser = await User.findOneAndUpdate(
      { parent: targetParentId },
        req.body ,
      { new: true });
    res.status(200).json({
      message: 'Teacher and user profile updated successfully',
      parent: updatedParent,
      user: updatedUser
    });
    } catch (error) {
        res.status(500).json({ message: 'Error updating parent', error: error.message });
    }
}