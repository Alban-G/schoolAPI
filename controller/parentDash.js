const { User, Parent, Student, Classroom, Assignment } = require('../models/model');

// parent's Dashboard
exports.parentDash = async (req, res) => {
    try {
        // get the logged_in User
        const userId = req.user.userId;
        // fetch the parent object using userId
        const user = await User.findById(userId).populate('parent');
        // extract parent ID from user
        const parent = user.parent
        // get childern of the parent
        const children = await Student.find({parent: parent._id}).populate('classroom', '_id name grade teacher');
        res.status(200).json({parent, children});
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// get students assignments
exports.getStudentAssignments = async (req, res) => {
    try {
        const assignment = await Assignment.find({classroom: req.params.id}).populate('postedBy').sort({dueDate: 1});
        res.json(assignment);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
