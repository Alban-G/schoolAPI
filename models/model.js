const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// user schema
const userSchema = new Schema({ 
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: [ 'admin', 'teacher', 'parent' ], default: 'admin' },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', default: null },
    parent: { type: Schema.Types.ObjectId, ref: 'Parent', default: null }
}, { timestamps: true });

// teacher schema
const teacherSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    subjects: { type: String }
}, { timestamps: true });

// parent schema
const parentSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    nationalId: { type: String, required: true, unique: true },
}, { timestamps: true });

// classroom schema
const classroomSchema = new Schema({
    name: { type: String, required: true },
    grade: { type: String, required: true },
    classYear: { type: String },
    teacher: [{ type: Schema.Types.ObjectId, ref: 'Teacher', default: null }],
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

// student schema
const studentSchema = new Schema({
    name: { type: String, required: true },
    admissionNumber: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: [ 'male', 'female' ], required: true },
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Parent', required: true }
}, { timestamps: true });

// assignment schema
const assignmentSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    classroom: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'Teacher' }
}, { timestamps:true });



const User = mongoose.model('User', userSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Parent = mongoose.model('Parent', parentSchema);
const Classroom = mongoose.model('Classroom', classroomSchema);
const Student = mongoose.model('Student', studentSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = { User, Teacher, Parent, Classroom, Student, Assignment };