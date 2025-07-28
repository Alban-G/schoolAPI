// entry file for the Express application
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// static files middleware
app.use("/uploads", express.static("uploads"));

// Import routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const classroomRoutes = require('./routes/class');
app.use('/api/classroom', classroomRoutes);
const teacherRoutes = require('./routes/teacher');
app.use('/api/teacher', teacherRoutes);
const assignmentRoutes = require('./routes/assignment');
app.use('/api/assignment', assignmentRoutes);
const parentRoutes = require('./routes/parent');
app.use('/api/parent', parentRoutes);
const studentRoles = require('./routes/student');
app.use('/api/student', studentRoles);
// Admin Dashboard
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
// teacher Dashboard
const teachRoutes = require('./routes/teachDash');
app.use('/api/teachdash', teachRoutes);
// parent Dashboard
const wazaeRoutes = require('./routes/parentDash');
app.use('/api/parentdash/', wazaeRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Server listening
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});