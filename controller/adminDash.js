const { Student, Teacher, Parent, Classroom, User } = require('../models/model');

// get dashboard stats
exports.adminDashStats = async (req, res) => {
    try {
        // we will run all count operation parallel for better performance
        const [ totalStudents, totalTeachers, totalParents, totalClassrooms, activeUsers ] = await Promise.all([
            Student.countDocuments(),
            Teacher.countDocuments(),
            Parent.countDocuments(),
            Classroom.countDocuments(),
            User.countDocuments({isActive: true})
        ]);
        // get the most recent student to be registered(sort by newest)
        const recentStudent = await Student.find().sort({createdAt: -1}).limit(5);
        // get recent teachers 
        const recentTeachers = await Teacher.find().sort({createdAt: -1}).limit(5);
        // return all stats
        res.status(200).json({
            totalStudents, 
            totalTeachers, 
            totalParents, 
            totalClassrooms, 
            activeUsers,
            recentStudent,
            recentTeachers
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};