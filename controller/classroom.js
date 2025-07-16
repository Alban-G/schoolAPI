const { Classroom } = require('../models/model');

// Create a new classroom
exports.createClassroom = async (req, res) => {
    try {
        const newClassroom = req.body;
        // check if classroom already exists
        const existingClassroom = await Classroom.findOne({ name: newClassroom.name, grade: newClassroom.grade });
        if (existingClassroom) {
            return res.status(400).json({ message: 'Classroom already exists' });
        };
        // Extract classroom details from the request body
        const classroom = new Classroom(newClassroom);
        await classroom.save();
        res.status(201).json({ message: 'Classroom created successfully', classroom });
    } catch (error) {
        console.error('Error creating classroom:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get classrooms
exports.getAllClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find().populate('teacher', 'name email phone').populate('students', 'name admissionNumber');
        res.status(200).json({ classrooms });
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getClassroomById = async (req, res) => {
    try {
        const { id } = req.params;
        const classroom = await Classroom.findById(id).populate('teacher', 'name email phone').populate('students', 'name admissionNumber');
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.status(200).json({ classroom });
    } catch (error) {
        console.error('Error fetching classroom:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Update a classroom
exports.updateClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const classroom = await Classroom.findByIdAndUpdate(id, updatedData, { new: true });
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.status(200).json({ message: 'Classroom updated successfully', classroom });
    } catch (error) {
        console.error('Error updating classroom:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete a classroom
exports.deleteClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        const classroom = await Classroom.findByIdAndDelete(id);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }
        res.status(200).json({ message: 'Classroom deleted successfully' });
    } catch (error) {
        console.error('Error deleting classroom:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};