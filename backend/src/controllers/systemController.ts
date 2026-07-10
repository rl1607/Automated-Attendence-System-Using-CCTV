import { Request, Response } from 'express';
import { Settings, AuditLog, Message, Attendance, UnknownFace } from '../models/System';
import Student from '../models/Student';
import { Faculty, Timetable, Department } from '../models/Academic';
import Camera from '../models/Camera';

// --- SYSTEM SETTINGS ---
export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return res.json(settings);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    return res.json({ message: 'Settings updated successfully', settings });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// --- AUDIT LOGS ---
export const getAuditLogs = async (req: Request, res: Response) => {
  const { search } = req.query;
  const filter: any = {};
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: 'i' } },
      { action: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } }
    ];
  }
  try {
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.json(logs);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

import { AuthRequest } from '../middleware/auth';

// --- MESSAGING ---
export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { recipient, content, type, channel } = req.body;
  try {
    const msg = await Message.create({
      sender: req.user ? req.user.email : 'System',
      recipient,
      content,
      type: type || 'Individual',
      channel: channel || 'Email'
    });

    // Mock Gateway Transmission Trigger
    console.log(`[Notification Dispatch] channel=${channel} recipient=${recipient} msg=${content}`);

    return res.status(201).json({ message: 'Message dispatched successfully (Mocked)', data: msg });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const list = await Message.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// --- DASHBOARD METRICS ---
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const activeCameras = await Camera.countDocuments({ status: 'online' });
    const offlineCameras = await Camera.countDocuments({ status: 'offline' });
    
    const today = new Date().toISOString().split('T')[0];
    const presentToday = await Attendance.countDocuments({ date: today, status: 'Present' });
    const lateToday = await Attendance.countDocuments({ date: today, status: 'Late' });
    const absentToday = totalStudents - (presentToday + lateToday);

    const unknownFaces = await UnknownFace.countDocuments();
    const todayClasses = await Timetable.countDocuments();

    // Mock chart dataset helper (averages and rates)
    const analytics = {
      attendancePercentage: totalStudents > 0 ? Math.round(((presentToday + lateToday) / totalStudents) * 100) : 85,
      recognitionAccuracy: 98.4,
      falsePositiveRate: 0.2,
      falseNegativeRate: 1.4,
      avgRecognitionTime: 1.2 // seconds
    };

    return res.json({
      metrics: {
        totalStudents,
        totalFaculty,
        activeCameras,
        offlineCameras,
        presentToday: presentToday + lateToday,
        absentToday: Math.max(0, absentToday),
        unknownFaces,
        todayClasses
      },
      analytics
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// --- ANALYTICS DETAILED CHARTS ---
export const getAnalyticsData = async (req: Request, res: Response) => {
  try {
    // Generate static mockup charts since dynamic logs are built incrementally in sandbox
    const dailyAttendance = [
      { name: 'Mon', attendance: 88, accuracy: 98.2 },
      { name: 'Tue', attendance: 92, accuracy: 98.5 },
      { name: 'Wed', attendance: 90, accuracy: 99.0 },
      { name: 'Thu', attendance: 94, accuracy: 97.9 },
      { name: 'Fri', attendance: 89, accuracy: 98.4 }
    ];

    const departmentWise = [
      { name: 'Computer Science', attendance: 94 },
      { name: 'Electronics', attendance: 88 },
      { name: 'Mechanical', attendance: 82 },
      { name: 'Civil Engineering', attendance: 78 },
      { name: 'Information Science', attendance: 91 }
    ];

    const attendanceTrend = [
      { week: 'Week 1', rate: 86 },
      { week: 'Week 2', rate: 89 },
      { week: 'Week 3', rate: 91 },
      { week: 'Week 4', rate: 93 }
    ];

    const cameraUptime = [
      { name: 'Gate 1 Cam', uptime: 99.8 },
      { name: 'Gate 2 Cam', uptime: 98.5 },
      { name: 'Class 101 Cam', uptime: 95.0 },
      { name: 'Class 102 Cam', uptime: 96.2 },
      { name: 'Lab 1 Cam', uptime: 99.1 }
    ];

    const recognitionTimes = [
      { size: '1 Face', timeMs: 400 },
      { size: '5 Faces', timeMs: 800 },
      { size: '10 Faces', timeMs: 1200 },
      { size: '20 Faces', timeMs: 1900 }
    ];

    return res.json({
      dailyAttendance,
      departmentWise,
      attendanceTrend,
      cameraUptime,
      recognitionTimes
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
