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