import mongoose, { Schema, Document } from 'mongoose';

export interface ICamera extends Document {
  name: string;
  rtspUrl: string;
  ipAddress?: string;
  username?: string;
  password?: string;
  department: string;
  building: string;
  floor: string;
  room: string;
  status: 'online' | 'offline';
  lastSeen?: Date;
  fps?: number;
  resolution?: string;
  healthStatus?: string;
}

const CameraSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    rtspUrl: { type: String, required: true },
    ipAddress: { type: String },
    username: { type: String },
    password: { type: String },
    department: { type: String, required: true },
    building: { type: String, required: true },
    floor: { type: String, required: true },
    room: { type: String, required: true },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    lastSeen: { type: Date, default: Date.now },
    fps: { type: Number, default: 10 },
    resolution: { type: String, default: '1920x1080' },
    healthStatus: { type: String, default: 'Healthy' }
  },
  { timestamps: true }
);

export default mongoose.model<ICamera>('Camera', CameraSchema);
