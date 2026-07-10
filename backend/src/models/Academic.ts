import mongoose, { Schema, Document } from 'mongoose';

// --- DEPARTMENT ---
export interface IDepartment extends Document {
  name: string;
  code: string;
  head: string;
  description?: string;
}
const DepartmentSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  head: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);

// --- SEMESTER ---
export interface ISemester extends Document {
  semesterNumber: number;
  department: mongoose.Types.ObjectId;
  academicYear: string;
}
const SemesterSchema: Schema = new Schema({
  semesterNumber: { type: Number, required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  academicYear: { type: String, required: true }
}, { timestamps: true });

export const Semester = mongoose.model<ISemester>('Semester', SemesterSchema);

// --- FACULTY ---
export interface IFaculty extends Document {
  user?: mongoose.Types.ObjectId;
  name: string;
  department: string;
  email: string;
  phone: string;
  subjects: string[];
  timetable?: string;
  photoUrl?: string;
}
const FacultySchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  subjects: [{ type: String }],
  timetable: { type: String },
  photoUrl: { type: String }
}, { timestamps: true });

export const Faculty = mongoose.model<IFaculty>('Faculty', FacultySchema);

// --- SUBJECT ---
export interface ISubject extends Document {
  name: string;
  code: string;
  semester: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  credits: number;
}
const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
  faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
  credits: { type: Number, required: true, default: 4 }
}, { timestamps: true });

export const Subject = mongoose.model<ISubject>('Subject', SubjectSchema);

// --- TIMETABLE ---
export interface ITimetable extends Document {
  subject: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  semester: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  section: string;
  room: string;
  camera: mongoose.Types.ObjectId;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  dayOfWeek: string;  // e.g. "Monday", "Tuesday"
}
const TimetableSchema: Schema = new Schema({
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
  semester: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  section: { type: String, required: true, uppercase: true },
  room: { type: String, required: true },
  camera: { type: Schema.Types.ObjectId, ref: 'Camera', required: true },
  startTime: { type: String, required: true }, // Format "HH:MM"
  endTime: { type: String, required: true },   // Format "HH:MM"
  dayOfWeek: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }
}, { timestamps: true });

export const Timetable = mongoose.model<ITimetable>('Timetable', TimetableSchema);
