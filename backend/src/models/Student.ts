import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  user?: mongoose.Types.ObjectId;
  name: string;
  usn: string;
  rollNumber: string;
  department: string;
  semester: number;
  section: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  address: string;
  dob: Date;
  bloodGroup: string;
  gender: string;
  photoUrls: string[];
  isActive: boolean;
}

const StudentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    usn: { type: String, required: true, unique: true, uppercase: true, trim: true },
    rollNumber: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    section: { type: String, required: true, uppercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    address: { type: String, required: true },
    dob: { type: Date, required: true },
    bloodGroup: { type: String, required: true },
    gender: { type: String, required: true },
    photoUrls: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>('Student', StudentSchema);
