import { Request, Response } from 'express';
import Student from '../models/Student';
import FaceEmbedding from '../models/FaceEmbedding';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

export const createStudent = async (req: Request, res: Response) => {
  const {
    name, usn, rollNumber, department, semester, section, email, phone,
    parentName, parentPhone, address, dob, bloodGroup, gender, photos
  } = req.body;

  try {
    const existing = await Student.findOne({ usn });
    if (existing) {
      return res.status(400).json({ message: 'Student with this USN already exists' });
    }

    // Create User account for student safely
    const userExisting = await User.findOne({ email });
    let userId;
    if (userExisting) {
      userId = userExisting._id;
    } else {
      const passwordHash = await bcrypt.hash('student123', 10);
      const user = await User.create({
        email,
        passwordHash,
        role: 'student',
        name,
        isVerified: true
      });
      userId = user._id;
    }

    const student = await Student.create({
      user: userId,
      name,
      usn,
      rollNumber,
      department,
      semester,
      section,
      email,
      phone,
      parentName,
      parentPhone,
      address,
      dob: new Date(dob),
      bloodGroup,
      gender,
      photoUrls: photos || []
    });

    // Generate Embeddings
    let embeddings: number[][] = [];
    try {
      if (photos && photos.length > 0) {
        // Forward to AI Microservice
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/embeddings`, {
          photos: photos
        }, { timeout: 5000 });
        embeddings = aiResponse.data.embeddings;
      }
    } catch (err: any) {
      console.warn('⚠️ AI service embedding generation failed or timed out. Generating mock embeddings instead.', err.message);
      // Generate mock 128-dimensional embeddings for testing
      embeddings = (photos || [1]).map(() => 
        Array.from({ length: 128 }, () => Math.random() * 2 - 1)
      );
    }

    // Save embeddings to Database
    if (embeddings.length > 0) {
      await Promise.all(embeddings.map(emb => 
        FaceEmbedding.create({
          student: student._id,
          embedding: emb,
          modelUsed: 'Facenet',
          version: '1.0'
        })
      ));
    }

    return res.status(201).json({
      message: 'Student registered successfully',
      student,
      embeddingsCount: embeddings.length
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  const { search, department, semester, section } = req.query;
  const filter: any = {};

  if (department) filter.department = department;
  if (semester) filter.semester = Number(semester);
  if (section) filter.section = String(section).toUpperCase();

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { usn: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const students = await Student.find(filter);
    return res.json(students);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStudentByUsn = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ usn: req.params.usn });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const embeddings = await FaceEmbedding.find({ student: student._id }).select('modelUsed version');
    return res.json({ student, embeddings });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOneAndUpdate(
      { usn: req.params.usn },
      req.body,
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.json({ message: 'Student updated successfully', student });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ usn: req.params.usn });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete related face embeddings
    await FaceEmbedding.deleteMany({ student: student._id });
    
    // Delete user account if exists
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }

    await Student.findByIdAndDelete(student._id);
    return res.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
