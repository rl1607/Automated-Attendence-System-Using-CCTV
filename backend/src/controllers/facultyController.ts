import { Request, Response } from 'express';
import { Faculty } from '../models/Academic';
import User from '../models/User';
import bcrypt from 'bcryptjs';

export const createFaculty = async (req: Request, res: Response) => {
  const { name, department, email, phone, subjects, timetable, photoUrl } = req.body;
  try {
    const existing = await Faculty.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Faculty with this email already exists' });
    }

    // Create corresponding User
    const passwordHash = await bcrypt.hash('faculty123', 10);
    const user = await User.create({
      email,
      passwordHash,
      role: 'faculty',
      name,
      isVerified: true
    });

    const faculty = await Faculty.create({
      user: user._id,
      name,
      department,
      email,
      phone,
      subjects: subjects || [],
      timetable,
      photoUrl
    });

    return res.status(201).json({ message: 'Faculty created successfully', faculty });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFacultyList = async (req: Request, res: Response) => {
  const { search } = req.query;
  const filter: any = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  try {
    const list = await Faculty.find(filter);
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFacultyById = async (req: Request, res: Response) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    return res.json(faculty);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateFaculty = async (req: Request, res: Response) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    return res.json({ message: 'Faculty updated successfully', faculty });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteFaculty = async (req: Request, res: Response) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    if (faculty.user) {
      await User.findByIdAndDelete(faculty.user);
    }
    await Faculty.findByIdAndDelete(faculty._id);
    return res.json({ message: 'Faculty deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
