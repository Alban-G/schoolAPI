const { Student, Classroom, Parent } = require('../models/model');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// where to store the uploaded files
const uploads = multer({dest: 'uploads/'})
exports.uploadStudentImage = uploads.single('image');

exports.addStudent = async (req, res) => {
    try {
        // destructuring the request body
        const { name, dateOfBirth, gender, admissionNumber, parentNationalId, classroomId } = req.body;
        // check if parent exists
        const parent = await Parent.findOne({ nationalId: parentNationalId });
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        };
        // check if student already exists
        const existingStudent = await Student.findOne({ admissionNumber });
        if (existingStudent) {
            return res.status(404).json({ message: "Admission Number has been assigned to someone else" });
        }
        // check if classroom exists
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }
        // prepare the upload file
        let image = null;
        if (req.file) {
            const ext = path.extname(req.file.originalname)
            const newFileName = Date.now()+ext
            const newPath = path.join('uploads', newFileName)
            fs.renameSync(req.file.path, newPath)
            image = newPath.replace(/\\/g, '/')
        }

        // create student
        const newStudent = new Student({
            name,
            dateOfBirth,
            gender,admissionNumber,
            parent: parent._id,
            classroom: classroom._id,
            image
        });
        const savedStudent = await newStudent.save();
    // add the student to the respective class using $addToSet to prevent duplication
        await Classroom.findByIdAndUpdate(classroom._id, { $addToSet: { students: savedStudent._id } });
        return res.status(201).json({ message: "Student added successfully", student: savedStudent });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// get students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('classroom', 'name grade teacher').populate('parent', 'name email phone');
        res.status(200).json({ students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id).populate('classroom', 'name grade teacher').populate('parent', 'name email phone');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ student });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// updating student
exports.updateStudent = async (req, res) => {
    try {
        const updateStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updateStudent) {
            return res.status(404).json({ message: "Student not found" })
        }
        res.status(200).json({ message: 'Student updated successfully', updateStudent });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }  
};

// delete student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletestudent = await Student.findByIdAndDelete(id);
        if (!deletestudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        // remove the image file if it exists
        if (deletestudent.image) {
            const imagePath = path.join(__dirname, '..', deletestudent.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        // remove the student from classroom
        await Classroom.updateMany(
            { students: deleteStudent._id },
            { $pull: {students: deleteStudent._id} }
        )
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting classroom:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};