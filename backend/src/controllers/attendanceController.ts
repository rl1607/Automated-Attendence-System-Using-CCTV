import { Request, Response } from 'express';
import { Attendance, AttendanceSession, UnknownFace } from '../models/System';
import Student from '../models/Student';
import { Timetable, Subject } from '../models/Academic';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { io } from '../app';

export const startAttendanceSession = async (req: Request, res: Response) => {
  const { timetableId } = req.body;
  try {
    const slot = await Timetable.findById(timetableId).populate('subject').populate('camera');
    if (!slot) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    const session = await AttendanceSession.create({
      timetable: slot._id,
      subject: slot.subject._id,
      camera: slot.camera._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // default 1 hour
      status: 'active'
    });

    // Notify clients via Socket.IO
    if (io) {
      io.emit('session_status', { status: 'started', sessionId: session._id, timetable: slot });
    }

    return res.status(201).json({ message: 'Attendance session started successfully', session });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const stopAttendanceSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const session = await AttendanceSession.findByIdAndUpdate(
      sessionId,
      { status: 'completed', endTime: new Date() },
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (io) {
      io.emit('session_status', { status: 'stopped', sessionId: session._id });
    }

    return res.json({ message: 'Attendance session stopped successfully', session });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Main webhook receiver for AI service to post attendance markings
export const recordAttendance = async (req: Request, res: Response) => {
  const { studentUsn, confidence, cameraId, snapshotUrl } = req.body;
  try {
    const student = await Student.findOne({ usn: studentUsn.toUpperCase() });
    if (!student) {
      return res.status(404).json({ message: `Student with USN ${studentUsn} not found` });
    }

    // Determine current active sessions matching the department/semester or class slot
    const activeSession = await AttendanceSession.findOne({ status: 'active' })
      .populate({
        path: 'timetable',
        populate: { path: 'subject faculty' }
      });

    let subjectName = 'General Class';
    let facultyName = 'System Automated';
    let semester = student.semester.toString();
    let department = student.department;

    if (activeSession) {
      const timetable: any = activeSession.timetable;
      subjectName = timetable.subject?.name || subjectName;
      facultyName = timetable.faculty?.name || facultyName;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    
    // Prevent duplicate attendance for the same subject on the same day
    const existing = await Attendance.findOne({
      student: student._id,
      subject: subjectName,
      date: todayDate
    });

    if (existing) {
      return res.status(200).json({ message: 'Attendance already recorded for today', record: existing });
    }

    // Check if late (e.g. if marked 15 minutes after session starts)
    const sessionStartTime = activeSession ? new Date(activeSession.startTime) : new Date();
    const timeDiffMinutes = (Date.now() - sessionStartTime.getTime()) / 60000;
    const status = timeDiffMinutes > 15 ? 'Late' : 'Present';

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // "HH:MM:SS"

    const record = await Attendance.create({
      student: student._id,
      usn: student.usn,
      studentName: student.name,
      semester,
      department,
      subject: subjectName,
      faculty: facultyName,
      date: todayDate,
      time: timeStr,
      camera: cameraId || activeSession?.camera,
      location: activeSession ? 'Classroom' : 'Campus Gate',
      confidence: confidence || 95,
      snapshot: snapshotUrl,
      status
    });

    // Notify clients in real-time
    if (io) {
      io.emit('new_attendance', {
        id: record._id,
        studentName: student.name,
        usn: student.usn,
        department: student.department,
        semester: student.semester,
        time: timeStr,
        status: record.status,
        confidence: record.confidence
      });
    }

    return res.status(201).json({ message: 'Attendance recorded successfully', record });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Retrieve Attendance logs with filtering
export const getAttendanceLogs = async (req: Request, res: Response) => {
  const { name, usn, department, semester, subject, date, status } = req.query;
  const filter: any = {};

  if (usn) filter.usn = { $regex: usn, $options: 'i' };
  if (name) filter.studentName = { $regex: name, $options: 'i' };
  if (department) filter.department = department;
  if (semester) filter.semester = semester;
  if (subject) filter.subject = { $regex: subject, $options: 'i' };
  if (date) filter.date = date;
  if (status) filter.status = status;

  try {
    const list = await Attendance.find(filter).sort({ createdAt: -1 });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Record Unknown Face detected in stream
export const recordUnknownFace = async (req: Request, res: Response) => {
  const { image, cameraId, location, confidence } = req.body;
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const record = await UnknownFace.create({
      image,
      camera: cameraId,
      location: location || 'Classroom Corridor',
      date: dateStr,
      time: timeStr,
      confidence: confidence || 75
    });

    // Socket alert
    if (io) {
      io.emit('unknown_face_alert', {
        id: record._id,
        location: record.location,
        time: record.time,
        confidence: record.confidence,
        image: record.image
      });
    }

    return res.status(201).json({ message: 'Unknown face reported successfully', record });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUnknownFaces = async (req: Request, res: Response) => {
  try {
    const list = await UnknownFace.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Export to CSV
export const exportCSV = async (req: Request, res: Response) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    let csv = 'Student Name,USN,Semester,Department,Subject,Faculty,Date,Time,Location,Confidence %,Status\n';
    
    records.forEach(r => {
      csv += `"${r.studentName}","${r.usn}","${r.semester}","${r.department}","${r.subject}","${r.faculty}","${r.date}","${r.time}","${r.location}",${r.confidence},"${r.status}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_report.csv');
    return res.send(csv);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Export to Excel
export const exportExcel = async (req: Request, res: Response) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Logs');

    worksheet.columns = [
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'USN', key: 'usn', width: 15 },
      { header: 'Semester', key: 'semester', width: 10 },
      { header: 'Department', key: 'dept', width: 15 },
      { header: 'Subject', key: 'subject', width: 25 },
      { header: 'Faculty', key: 'faculty', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 12 },
      { header: 'Location', key: 'location', width: 15 },
      { header: 'Confidence %', key: 'confidence', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    records.forEach(r => {
      worksheet.addRow({
        name: r.studentName,
        usn: r.usn,
        semester: r.semester,
        dept: r.department,
        subject: r.subject,
        faculty: r.faculty,
        date: r.date,
        time: r.time,
        location: r.location,
        confidence: r.confidence,
        status: r.status
      });
    });

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('attendance_report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Export to PDF
export const exportPDF = async (req: Request, res: Response) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    const doc = new PDFDocument({ margin: 30 });

    res.header('Content-Type', 'application/pdf');
    res.attachment('attendance_report.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Automated Attendance Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    // Draw simple text table
    records.forEach((r, idx) => {
      doc.text(
        `${idx + 1}. ${r.studentName} (${r.usn}) | Subj: ${r.subject} | Date: ${r.date} | Status: ${r.status}`,
        { paragraphGap: 5 }
      );
    });

    doc.end();
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
