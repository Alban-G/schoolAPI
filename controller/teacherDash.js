const { User, Assignment, Classroom } = require('../models/model');

// teacher's Dashboard
exports.teacherDash = async (req, res) => {
    try {
        // the logged-in user who is teach
        const userId = req.user.userId;
        // fetch the teacher object using uderId
        const user = await User.findById(userId);
        // check if user is a teacher
        if (!user || !user.teacher) return res.status(403).json({ message: "Teacher not found in the linked user" });

        // extract teacher ID from user
        const teacherId = user.teacher

        // aggregate classroom  to get class count and students
        const classStats = await Classroom.aggregate([
            {$match: {teacher: teacherId}},
            {
                $group: {
                    _id: null,
                    totalClasses: { $sum: 1 },
                    totalStudents: { $sum: {$size: "$students"}}
                }
            }
        ]);
        // count Assignments
        const totalAssignments = await Assignment.countDocuments({ postedBy: teacherId });
        // prepare results
        const results = {
            totalClasses: classStats[0]?.totalClasses || 0,
            totalStudents: classStats[0]?.totalStudents || 0,
            totalAssignments
        };
        res.status(200).json(results)
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}