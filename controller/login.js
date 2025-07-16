const { User } = require('../models/model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registration
exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password, secretKey } = req.body;

        // Validate admin secret key
        if (secretKey !== process.env.secretKey) {
            return res.status(403).json({ message: 'Unauthorised Account Creation' });
        }
        // Check if the admin account already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin Account Already Exists' });
        }
        // harshing password
        const hashedPassword = await bcrypt.hash(password,10);
        // create admin
        const newUser = new User ({
            name,
            email,
            password: hashedPassword,
            isActive: true
        });
        await newUser.save();
        res.status(200).json({ message: 'Admin Account Created Successfully', newUser });
    } catch (error) {
        console.error('Error creating admin account:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User Not Found' });
        }
        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Password' });
        }
        // Generate JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login Successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isActive: user.isActive,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// get users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};