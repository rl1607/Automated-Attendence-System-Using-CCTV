import { API_BASE_URL } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { 
  Plus, Search, Trash2, Camera, HelpCircle, 
  X, Check, VideoOff, RefreshCw 
} from 'lucide-react';

const studentSchema = zod.object({
  name: zod.string().min(2, 'Name is required'),
  usn: zod.string().min(5, 'Valid USN is required'),
  rollNumber: zod.string().min(1, 'Roll number is required'),
  department: zod.string().min(1, 'Department is required'),
  semester: zod.coerce.number().min(1).max(8),
  section: zod.string().min(1, 'Section is required'),
  email: zod.string().email('Invalid email address'),
  phone: zod.string().min(10, 'Valid phone number is required'),
  parentName: zod.string().min(2, 'Parent name is required'),
  parentPhone: zod.string().min(10, 'Valid parent phone is required'),
  address: zod.string().min(5, 'Address is required'),
  dob: zod.string(),
  bloodGroup: zod.string().min(1, 'Blood group is required'),
  gender: zod.string().min(1, 'Gender is required'),
});

const Students: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [showRegForm, setShowRegForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  
  // Camera variables
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '', usn: '', rollNumber: '', department: 'Computer Science', 
      semester: 1, section: 'A', email: '', phone: '', 
      parentName: '', parentPhone: '', address: '', dob: '2005-01-01',
      bloodGroup: 'O+', gender: 'Male'
    }
  });

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/students`, {
        params: { search: searchQuery, department: deptFilter }
      });
      setStudents(res.data);
    } catch (err) {
      console.warn("API student fetch failed, using fallback list.");
      setStudents([
        { _id: '1', name: 'Aditya Kumar', usn: '1RV22CS004', rollNumber: '04', department: 'Computer Science', semester: 4, section: 'A', email: 'aditya@rvce.edu.in', phone: '9845120345' },
        { _id: '2', name: 'Neha Sharma', usn: '1RV22CS032', rollNumber: '32', department: 'Computer Science', semester: 4, section: 'A', email: 'neha@rvce.edu.in', phone: '8124095431' },
        { _id: '3', name: 'Rahul Verma', usn: '1RV22CS045', rollNumber: '45', department: 'Computer Science', semester: 4, section: 'A', email: 'rahul@rvce.edu.in', phone: '9448109321' }
      ]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, deptFilter]);

  // Start webcam
  const startCamera = async () => {
    try {
      setErrorMsg('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setCapturedPhotos([]);
    } catch (err) {
      console.error("Camera access failed:", err);
      setErrorMsg("Unable to access camera. Please check permissions.");
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setIsCapturing(false);
  };

  // Capture snapshots sequentially (15 images from different angles)
  const triggerCaptureSession = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    setCapturedPhotos([]);
    setCaptureProgress(0);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    let count = 0;
    const totalFrames = 15;
    const tempPhotos: string[] = [];

    const interval = setInterval(() => {
      if (count >= totalFrames || !isCameraActive) {
        clearInterval(interval);
        setIsCapturing(false);
        stopCamera();
        return;
      }

      if (ctx) {
        // Draw frame to canvas and capture base64 URL
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        tempPhotos.push(dataUrl);
        setCapturedPhotos([...tempPhotos]);
        count++;
        setCaptureProgress(Math.round((count / totalFrames) * 100));
      }
    }, 400); // 400ms interval for each photo angle
  };

  const onSubmit = async (data: any) => {
    if (capturedPhotos.length === 0) {
      setErrorMsg("Please capture face snapshots first to register embeddings.");
      return;
    }

    try {
      setErrorMsg('');
      setSuccessMsg('');
      
      const payload = {
        ...data,
        photos: capturedPhotos
      };

      await axios.post(`${API_BASE_URL}/api/students`, payload);
      setSuccessMsg("Student registered and face embeddings generated successfully!");
      setShowRegForm(false);
      reset();
      setCapturedPhotos([]);
      fetchStudents();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error submitting registration details.');
    }
  };

  const handleDelete = async (usn: string) => {
    if (!window.confirm(`Are you sure you want to delete student USN: ${usn}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${usn}`);
      fetchStudents();
    } catch (err) {
      // Mock local deletion if offline
      setStudents(prev => prev.filter(s => s.usn !== usn));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Directory</h1>
          <p className="text-slate-400 text-xs mt-1">Manage enrollments, demographic fields, and facial signatures.</p>
        </div>
        <button 
          onClick={() => setShowRegForm(!showRegForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-brand-500/20"
        >
          {showRegForm ? <X size={16} /> : <Plus size={16} />} 
          {showRegForm ? 'Close Form' : 'Register Student'}
        </button>
      </div>

      {/* FORM EXPANSION SCREEN */}
      {showRegForm && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-darkbg-border max-w-4xl mx-auto shadow-xl">
          <h2 className="text-lg font-bold mb-6 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
            New Student Onboarding Profile
          </h2>
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* INPUT FIELDS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Full Name</label>
                <input {...register('name')} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white" />
                {errors.name && <span className="text-[10px] text-red-400 font-bold">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">USN / Unique ID</label>
                <input {...register('usn')} placeholder="1RV22CS001" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white" />
                {errors.usn && <span className="text-[10px] text-red-400 font-bold">{errors.usn.message}</span>}
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Roll Number</label>
                <input {...register('rollNumber')} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white" />
                {errors.rollNumber && <span className="text-[10px] text-red-400 font-bold">{errors.rollNumber.message}</span>}
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Department</label>
                <select {...register('department')} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white">
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Information Science">Information Science</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Semester</label>
                <input type="number" {...register('semester')} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white" />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Section</label>
                <input {...register('section')} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white" />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Email Address</label>
                <input {...register('email')} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white" />
                {errors.email && <span className="text-[10px] text-red-400 font-bold">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Phone Number</label>
                <input {...register('phone')} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white" />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Parent Name</label>
                <input {...register('parentName')} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white" />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Parent Phone</label>
                <input {...register('parentPhone')} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white" />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Date of Birth</label>
                <input type="date" {...register('dob')} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white" />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Blood Group</label>
                <input {...register('bloodGroup')} placeholder="O+" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white" />
              </div>

              <div className="md:col-span-3">
                <label className="block text-slate-400 text-xs font-bold mb-1">Home Address</label>
                <textarea {...register('address')} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-darkbg-border bg-white dark:bg-darkbg text-xs text-white h-16 resize-none" />
              </div>
            </div>

            {/* CAMERA EMBEDDING REGISTRATION */}
            <div className="border border-slate-200 dark:border-darkbg-border rounded-xl p-4 bg-slate-50 dark:bg-darkbg/50">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Multi-Angle Biometric Enrollment</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Capture 15 facial frames sequentially from left, right, top, and center positions.</p>
                </div>
                {!isCameraActive ? (
                  <button 
                    type="button" 
                    onClick={startCamera} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/10 hover:bg-brand-600/20 text-brand-400 border border-brand-500/20 rounded-lg text-xs font-bold transition"
                  >
                    <Camera size={14} /> Open Webcam
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={stopCamera} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition"
                  >
                    <VideoOff size={14} /> Close Webcam
                  </button>
                )}
              </div>

              {isCameraActive && (
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                  <div className="relative w-64 h-48 bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                    <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" />
                    <canvas ref={canvasRef} width="640" height="480" className="hidden" />
                    
                    {isCapturing && (
                      <div className="absolute inset-0 bg-brand-950/40 flex items-center justify-center flex-col gap-2">
                        <RefreshCw size={24} className="animate-spin text-brand-400" />
                        <span className="text-[10px] font-bold">Scanning... {captureProgress}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 max-w-xs w-full">
                    <button
                      type="button"
                      disabled={isCapturing}
                      onClick={triggerCaptureSession}
                      className="py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50"
                    >
                      {capturedPhotos.length > 0 ? 'Recapture Array' : 'Begin Scan Sequence'}
                    </button>
                    
                    <div className="text-center">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {capturedPhotos.length} / 15 signature frames recorded
                      </span>
                    </div>

                    <div className="flex gap-1 overflow-x-auto p-1 max-w-xs scrollbar-none">
                      {capturedPhotos.map((photo, i) => (
                        <img key={i} src={photo} alt="" className="w-8 h-8 rounded border border-brand-500/30 object-cover" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold rounded-xl shadow-lg transition"
            >
              Enroll Student Profile
            </button>

          </form>
        </div>
      )}

      {/* FILTER & TABLE SECTION */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-2">
            <Check size={16} /> {successMsg}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by student name or USN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50 dark:bg-darkbg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="p-2 text-xs rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50 dark:bg-darkbg text-white focus:outline-none"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Information Science">Information Science</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-darkbg-border text-xs text-slate-400">
                <th className="py-2.5">USN</th>
                <th className="py-2.5">Name</th>
                <th className="py-2.5">Department</th>
                <th className="py-2.5">Semester & Sec</th>
                <th className="py-2.5">Contact Phone</th>
                <th className="py-2.5">Email</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-darkbg-border">
              {students.map((stud) => (
                <tr key={stud._id} className="hover:bg-slate-50 dark:hover:bg-brand-950/10 transition">
                  <td className="py-3 font-semibold text-white">{stud.usn}</td>
                  <td className="py-3 text-slate-300">{stud.name}</td>
                  <td className="py-3 text-slate-400">{stud.department}</td>
                  <td className="py-3 text-slate-400">Sem {stud.semester} - Sec {stud.section}</td>
                  <td className="py-3 text-slate-400">{stud.phone}</td>
                  <td className="py-3 text-slate-400">{stud.email}</td>
                  <td className="py-3 text-right">
                    <button 
                      onClick={() => handleDelete(stud.usn)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No matching student profiles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default Students;
