import mongoose, { Schema, Document } from 'mongoose';

// --- ATTENDANCE SESSION ---
export interface IAttendanceSession extends Document {
  timetable: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  camera: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'completed';
}
const AttendanceSessionSchema: Schema = new Schema({
  timetable: { type: Schema.Types.ObjectId, ref: 'Timetable', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  camera: { type: Schema.Types.ObjectId, ref: 'Camera', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' }
}, { timestamps: true });

export const AttendanceSession = mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema);

// --- ATTENDANCE ---
export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  usn: string;
  studentName: string;
  semester: string;
  department: string;
  subject: string;
  faculty: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM:SS"
  camera?: mongoose.Types.ObjectId;
  location: string;
  confidence: number;
  snapshot?: string;
  status: 'Present' | 'Absent' | 'Late';
}
const AttendanceSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  usn: { type: String, required: true },
  studentName: { type: String, required: true },
  semester: { type: String, required: true },
  department: { type: String, required: true },
  subject: { type: String, required: true },
  faculty: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  camera: { type: Schema.Types.ObjectId, ref: 'Camera' },
  location: { type: String, required: true },
  confidence: { type: Number, required: true },
  snapshot: { type: String },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true }
}, { timestamps: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);

// --- UNKNOWN FACE ---
export interface IUnknownFace extends Document {
  image: string; // File URL or base64
  camera?: mongoose.Types.ObjectId;
  location: string;
  date: string;
  time: string;
  confidence: number;
}
const UnknownFaceSchema: Schema = new Schema({
  image: { type: String, required: true },
  camera: { type: Schema.Types.ObjectId, ref: 'Camera' },
  location: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  confidence: { type: Number, required: true }
}, { timestamps: true });

export const UnknownFace = mongoose.model<IUnknownFace>('UnknownFace', UnknownFaceSchema);

// --- NOTIFICATION ---
export interface INotification extends Document {
  user?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'Email' | 'SMS' | 'WhatsApp';
  status: 'Sent' | 'Failed';
}
const NotificationSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Email', 'SMS', 'WhatsApp'], required: true },
  status: { type: String, enum: ['Sent', 'Failed'], default: 'Sent' }
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

// --- MESSAGES ---
export interface IMessage extends Document {
  sender: string;
  recipient: string;
  content: string;
  type: 'Individual' | 'Bulk' | 'Broadcast';
  channel: 'SMS' | 'WhatsApp' | 'Email';
}
const MessageSchema: Schema = new Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['Individual', 'Bulk', 'Broadcast'], required: true },
  channel: { type: String, enum: ['SMS', 'WhatsApp', 'Email'], required: true }
}, { timestamps: true });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);

// --- AUDIT LOG ---
export interface IAuditLog extends Document {
  user?: mongoose.Types.ObjectId;
  email: string;
  action: string;
  details: string;
  ipAddress?: string;
}
const AuditLogSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  ipAddress: { type: String }
}, { timestamps: true });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

// --- SETTINGS ---
export interface ISettings extends Document {
  recognitionConfidence: number;
  cameraFPS: number;
  recognitionInterval: number;
  storageLimit: number;
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    smtpFrom: string;
  };
  smsSettings: {
    twilioSid: string;
    twilioToken: string;
    twilioPhone: string;
  };
  whatsAppSettings: {
    providerUrl: string;
    providerToken: string;
  };
  theme: 'light' | 'dark';
  language: string;
}
const SettingsSchema: Schema = new Schema({
  recognitionConfidence: { type: Number, default: 90 },
  cameraFPS: { type: Number, default: 10 },
  recognitionInterval: { type: Number, default: 5 }, // in seconds
  storageLimit: { type: Number, default: 100 }, // in GB
  emailSettings: {
    smtpHost: { type: String, default: 'smtp.mailtrap.io' },
    smtpPort: { type: Number, default: 2525 },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    smtpFrom: { type: String, default: 'noreply@collegesystem.com' }
  },
  smsSettings: {
    twilioSid: { type: String, default: '' },
    twilioToken: { type: String, default: '' },
    twilioPhone: { type: String, default: '' }
  },
  whatsAppSettings: {
    providerUrl: { type: String, default: '' },
    providerToken: { type: String, default: '' }
  },
  theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
  language: { type: String, default: 'en' }
}, { timestamps: true });

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
