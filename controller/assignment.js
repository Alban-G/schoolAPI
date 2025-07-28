const { Assignment, User, Classroom } = require('../models/model');

// get all assignments (Admin view)
// includes classroom and teacher information
exports.getAllAssignment = async (req, res) => {
    try {
        const assignments = await Assignment.find()
        .populate ('classroom', 'name grade classyear')
        .populate ('postedBy', 'name email phone')
        res.status(200).json(assignments)
    } catch {
        res.status(500).json({ message: 'internal server error', error: error.message })
    }
};

// get one assignment
exports.getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
        .populate ('classroom', 'name grade classyear')
        .populate ('postedBy', 'name email phone')
        if (!assignment) {
            res.status(500).json({ message: 'Internal server error', error: error.message })
        } 
        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
};
// add assignments (only Teachers)
exports.addAssignment = async (req, res) => {
    try {
        // get logged-in user
        const userId = req.user.userId;
        // fetch the user and populate the teacher field
        const user = await User.findById(userId).populate('teacher');
        // restrict to only teacher access
        if (!user || !user.teacher) return res.status(403).json({ message: 'Only teachers can post'});

        // extract classroomId from the request
        const {classroom: classroomId} = req.body;
        // fetch classroom
        const classroom = await Classroom.findById(classroomId)
        if(!classroom) {
            return res.status(404).json({message: 'Classroom not found'})
        }
        // data append
        const assignmentData = {
            ...req.body,
            postedBy: user.teacher._id
        };
        // save
        const newAssignment = new Assignment(assignmentData)
        await newAssignment.save();
        res.status(201).json({message: 'Assignment added successfully', assignments: newAssignment })
    } catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message })
    }
};

// update assignment
exports.updateAssignment = async (req, res) => {
    try {
        // find assignment first
        const updateAssignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        )
        if (!updateAssignment) return res.status(404).json({message: 'Assignment not found'})
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
};

// delete assignment
exports.deleteAssignment = async (req, res) => {
    try {
        // find assignment first
        const deleteAssignment = await Assignment.findByIdAndDelete(
            req.params.id
        )
        if (!deleteAssignment) return res.status(404).json({message: 'Assignment not found'})
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
};