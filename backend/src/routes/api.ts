import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { logAudit } from '../middleware/audit';
import * as authController from '../controllers/authController';
import * as studentController from '../controllers/studentController';
import * as facultyController from '../controllers/facultyController';
import * as timetableController from '../controllers/timetableController';
import * as cameraController from '../controllers/cameraController';
import * as attendanceController from '../controllers/attendanceController';
import * as systemController from '../controllers/systemController';

const router = Router();

// ==========================================
// AUTHENTICATION APIs
// ==========================================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// ==========================================
// STUDENT APIs
// ==========================================
router.get('/students', authenticateToken, studentController.getStudents);
router.get('/students/:usn', authenticateToken, studentController.getStudentByUsn);
router.post('/students', 
  authenticateToken, 
  requireRole(['super_admin', 'admin']), 
  logAudit('STUDENT_ADD', req => `Registered student USN=${req.body.usn}`),
  studentController.createStudent
);
router.put('/students/:usn', 
  authenticateToken, 
  requireRole(['super_admin', 'admin']), 
  logAudit('STUDENT_UPDATE', req => `Updated student USN=${req.params.usn}`),
  studentController.updateStudent
);
router.delete('/students/:usn', 
  authenticateToken, 
  requireRole(['super_admin', 'admin']), 
  logAudit('STUDENT_DELETE', req => `Deleted student USN=${req.params.usn}`),
  studentController.deleteStudent
);

// ==========================================
// FACULTY APIs
// ==========================================
router.get('/faculty', authenticateToken, facultyController.getFacultyList);
router.get('/faculty/:id', authenticateToken, facultyController.getFacultyById);
router.post('/faculty', 
  authenticateToken, 
  requireRole(['super_admin', 'admin']), 
  logAudit('FACULTY_ADD', req => `Added faculty email=${req.body.email}`),
  facultyController.createFaculty
);
router.put('/faculty/:id', 
  authenticateToken, 
  requireRole(['super_admin', 'admin']), 
  facultyController.updateFaculty
);
router.delete('/faculty/:id', 
  authenticateToken, 
  requireRole(['super_admin', 'admin']), 
  logAudit('FACULTY_DELETE', req => `Deleted faculty ID=${req.params.id}`),
  facultyController.deleteFaculty
);

// ==========================================
// CAMERA APIs
// ==========================================
router.get('/cameras', authenticateToken, cameraController.getCameras);
router.get('/cameras/:id', authenticateToken, cameraController.getCameraById);
router.post('/cameras', 
  authenticateToken, 
  requireRole(['super_admin', 'admin']), 
  logAudit('CAMERA_ADD', req => `Configured camera name=${req.body.name}`),
  cameraController.createCamera
);
router.put('/cameras/:id', 
  authenticateToken, 
  requireRole(['super_admin', 'admin']), 
  cameraController.updateCamera
);
router.delete('/cameras/:id', 
  authenticateToken, 
  requireRole(['super_admin', 'admin']), 
  cameraController.deleteCamera
);
router.get('/cameras/:id/preview', authenticateToken, cameraController.previewCameraStream);

// ==========================================
// TIMETABLE & STRUCTURE APIs
// ==========================================
router.post('/departments', authenticateToken, requireRole(['super_admin', 'admin']), timetableController.createDepartment);
router.get('/departments', authenticateToken, timetableController.getDepartments);

router.post('/semesters', authenticateToken, requireRole(['super_admin', 'admin']), timetableController.createSemester);
router.get('/semesters', authenticateToken, timetableController.getSemesters);

router.post('/subjects', authenticateToken, requireRole(['super_admin', 'admin']), timetableController.createSubject);
router.get('/subjects', authenticateToken, timetableController.getSubjects);

router.post('/timetable', authenticateToken, requireRole(['super_admin', 'admin']), timetableController.createTimetable);
router.get('/timetable', authenticateToken, timetableController.getTimetable);
router.post('/timetable/bulk', authenticateToken, requireRole(['super_admin', 'admin']), timetableController.uploadTimetableBulk);

// ==========================================
// ATTENDANCE & WEBHOOK APIs
// ==========================================
router.post('/attendance/session/start', authenticateToken, requireRole(['super_admin', 'admin', 'faculty']), attendanceController.startAttendanceSession);
router.post('/attendance/session/:sessionId/stop', authenticateToken, requireRole(['super_admin', 'admin', 'faculty']), attendanceController.stopAttendanceSession);
router.post('/attendance/record', attendanceController.recordAttendance); // Webhook called by Python AI microservice
router.get('/attendance/logs', authenticateToken, attendanceController.getAttendanceLogs);
router.post('/attendance/unknown-face', attendanceController.recordUnknownFace); // Called by AI service
router.get('/attendance/unknown-faces', authenticateToken, attendanceController.getUnknownFaces);

// Export/Report triggers
router.get('/attendance/export/csv', attendanceController.exportCSV);
router.get('/attendance/export/xlsx', attendanceController.exportExcel);
router.get('/attendance/export/pdf', attendanceController.exportPDF);

// ==========================================
// SYSTEM SETTINGS & TELEMETRY APIs
// ==========================================
router.get('/system/settings', authenticateToken, systemController.getSettings);
router.put('/system/settings', 
  authenticateToken, 
  requireRole(['super_admin']), 
  logAudit('SETTINGS_UPDATE', () => 'Updated system settings'),
  systemController.updateSettings
);
router.get('/system/audit-logs', authenticateToken, requireRole(['super_admin']), systemController.getAuditLogs);
router.post('/system/message', authenticateToken, requireRole(['super_admin', 'admin', 'faculty']), systemController.sendMessage);
router.get('/system/messages', authenticateToken, systemController.getMessages);
router.get('/system/dashboard-stats', authenticateToken, systemController.getDashboardStats);
router.get('/system/analytics', authenticateToken, systemController.getAnalyticsData);

export default router;
