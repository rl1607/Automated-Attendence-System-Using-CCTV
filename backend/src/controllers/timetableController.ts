import { Request, Response } from 'express';
import { Department, Semester, Subject, Timetable } from '../models/Academic';

// --- DEPARTMENTS ---
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const dep = await Department.create(req.body);
    return res.status(201).json(dep);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const list = await Department.find();
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// --- SEMESTERS ---
export const createSemester = async (req: Request, res: Response) => {
  try {
    const sem = await Semester.create(req.body);
    return res.status(201).json(sem);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSemesters = async (req: Request, res: Response) => {
  try {
    const list = await Semester.find().populate('department');
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// --- SUBJECTS ---
export const createSubject = async (req: Request, res: Response) => {
  try {
    const sub = await Subject.create(req.body);
    return res.status(201).json(sub);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const list = await Subject.find().populate('semester').populate('faculty');
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// --- TIMETABLE ---
export const createTimetable = async (req: Request, res: Response) => {
  try {
    const item = await Timetable.create(req.body);
    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTimetable = async (req: Request, res: Response) => {
  try {
    const list = await Timetable.find()
      .populate('subject')
      .populate('faculty')
      .populate('semester')
      .populate('department')
      .populate('camera');
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// --- BULK TIMETABLE CSV/EXCEL UPLOAD ---
export const uploadTimetableBulk = async (req: Request, res: Response) => {
  const { entries } = req.body; // Expects array of timetable records
  try {
    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ message: 'Invalid data format. Expected an array of entries.' });
    }

    const inserted = await Timetable.insertMany(entries);
    return res.status(201).json({
      message: `Successfully uploaded ${inserted.length} timetable schedules`,
      data: inserted
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
