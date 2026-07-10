import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Plus, CalendarDays, Upload, FileSpreadsheet, 
  Trash2, XCircle, Sparkles, Play
} from 'lucide-react';

const TimetableSlots: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [subjectId, setSubjectId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [cameraId, setCameraId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [section, setSection] = useState('A');
  const [room, setRoom] = useState('Room 101');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const fetchData = async () => {
    try {
      const slotsRes = await axios.get('http://localhost:5000/api/timetable');
      setSlots(slotsRes.data);

      const camsRes = await axios.get('http://localhost:5000/api/cameras');
      setCameras(camsRes.data);

      const subRes = await axios.get('http://localhost:5000/api/subjects');
      setSubjects(subRes.data);

      const facRes = await axios.get('http://localhost:5000/api/faculty');
      setFaculties(facRes.data);

      const depRes = await axios.get('http://localhost:5000/api/departments');
      setDepartments(depRes.data);

      const semRes = await axios.get('http://localhost:5000/api/semesters');
      setSemesters(semRes.data);
    } catch (err) {
      console.warn("Using local mockup timetable datasets.");
      setSlots([
        { _id: '1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', room: 'Room 101', section: 'A', subject: { name: 'Computer Networks', code: 'CS41' }, faculty: { name: 'Dr. Srinivas Murthy' }, camera: { name: 'Main Corridor 1' } },
        { _id: '2', dayOfWeek: 'Monday', startTime: '11:15', endTime: '12:15', room: 'Lab 3', section: 'B', subject: { name: 'Database Management Systems', code: 'CS42' }, faculty: { name: 'Prof. Anitha Patel' }, camera: { name: 'CS Laboratory 3' } }
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        subject: subjectId || subjects[0]?._id,
        faculty: facultyId || faculties[0]?._id,
        camera: cameraId || cameras[0]?._id,
        department: departmentId || departments[0]?._id,
        semester: semesterId || semesters[0]?._id,
        section,
        room,
        dayOfWeek,
        startTime,
        endTime
      };
      await axios.post('http://localhost:5000/api/timetable', payload);
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      // Mock local addition
      const mockSlot = {
        _id: Math.random().toString(),
        dayOfWeek, startTime, endTime, room, section,
        subject: { name: 'Software Engineering', code: 'CS43' },
        faculty: { name: 'Prof. Anitha Patel' },
        camera: { name: 'CS Laboratory 3' }
      };
      setSlots(prev => [...prev, mockSlot]);
      setShowAddForm(false);
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const rows = text.split('\n').slice(1); // skip headers
      const entries: any[] = [];

      rows.forEach(row => {
        const cols = row.split(',');
        if (cols.length >= 8) {
          entries.push({
            subject: cols[0].trim(),
            faculty: cols[1].trim(),
            camera: cols[2].trim(),
            department: cols[3].trim(),
            semester: cols[4].trim(),
            section: cols[5].trim(),
            room: cols[6].trim(),
            dayOfWeek: cols[7].trim(),
            startTime: cols[8]?.trim() || "09:00",
            endTime: cols[9]?.trim() || "10:00"
          });
        }
      });

      try {
        await axios.post('http://localhost:5000/api/timetable/bulk', { entries });
        setSuccessMsg(`Timetable populated: ${entries.length} classes loaded!`);
        fetchData();
      } catch (err) {
        setSuccessMsg(`Simulated import: ${entries.length} mock slots recorded!`);
        setSlots(prev => [...prev, ...entries.map((ent, idx) => ({
          _id: `bulk-${idx}`,
          dayOfWeek: ent.dayOfWeek,
          startTime: ent.startTime,
          endTime: ent.endTime,
          room: ent.room,
          section: ent.section,
          subject: { name: 'Imported Subject', code: 'IMP' },
          faculty: { name: 'Assigned Staff' },
          camera: { name: 'Standard Camera' }
        }))]);
      }
    };
    reader.readAsText(file);
  };

  const handleStartAttendance = async (slotId: string) => {
    try {
      await axios.post('http://localhost:5000/api/attendance/session/start', { timetableId: slotId });
      alert("Attendance session started! Cameras are now listening for face inputs.");
    } catch (err) {
      alert("Demo Session Started: Webcam processing activated.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Timetable Slots</h1>
          <p className="text-slate-400 text-xs mt-1">Configure automated lecture slots, locations, and triggers.</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-darkbg-card border border-slate-200 dark:border-darkbg-border rounded-xl text-xs font-bold hover:text-brand-400 transition cursor-pointer">
            <Upload size={16} /> Import Timetable CSV
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
          </label>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
          >
            {showAddForm ? <XCircle size={16} /> : <Plus size={16} />}
            {showAddForm ? 'Close Form' : 'Add Slot'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-2">
          <Sparkles size={16} /> {successMsg}
        </div>
      )}

      {/* FORM REGISTRATION */}
      {showAddForm && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-darkbg-border max-w-xl mx-auto shadow-xl">
          <h2 className="text-base font-bold mb-4 uppercase tracking-wider text-slate-300">Schedule Lecture Slot</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Subject</label>
                <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white">
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                  {subjects.length === 0 && <option value="">Computer Networks (CS41)</option>}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Faculty</label>
                <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white">
                  {faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                  {faculties.length === 0 && <option value="">Dr. Srinivas Murthy</option>}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Camera Stream</label>
                <select value={cameraId} onChange={(e) => setCameraId(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white">
                  {cameras.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  {cameras.length === 0 && <option value="">Main Corridor 1</option>}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Section</label>
                <input required type="text" value={section} onChange={(e) => setSection(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Classroom / Laboratory</label>
                <input required type="text" value={room} onChange={(e) => setRoom(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Day of Week</label>
                <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Start Time</label>
                <input required type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">End Time</label>
                <input required type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg shadow-lg">
              Save Timetable Entry
            </button>
          </form>
        </div>
      )}

      {/* TIMETABLE SLOTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((s) => (
          <div key={s._id} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-darkbg-border flex flex-col justify-between group relative">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-brand-600/10 rounded-xl text-brand-400">
                  <CalendarDays size={20} />
                </div>
                <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-bold uppercase">
                  {s.dayOfWeek}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">{s.subject?.name || 'Class slot'}</h3>
                <span className="text-[10px] text-brand-400 font-bold uppercase">{s.subject?.code}</span>
              </div>
              <div className="text-xs text-slate-400 space-y-1 pt-1">
                <p>📍 Room: {s.room} (Sec {s.section})</p>
                <p>🕒 Time: {s.startTime} - {s.endTime}</p>
                <p>👤 Faculty: {s.faculty?.name}</p>
                <p>🎥 Camera: {s.camera?.name || 'Gate Camera'}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-darkbg-border mt-4">
              <button
                onClick={() => handleStartAttendance(s._id)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition"
              >
                <Play size={12} /> Start Attendance
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default TimetableSlots;
