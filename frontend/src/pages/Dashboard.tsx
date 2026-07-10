import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, UserCheck, UserX, Calendar, Clock, 
  ArrowRight, Search, Sparkles, Filter 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface StudentRow {
  _id: string;
  name: string;
  usn: string;
  section: string;
  status: 'Present' | 'Late' | 'Not Marked';
  time?: string;
}

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'absent'>('all');
  
  // Date states
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] // YYYY-MM-DD
  );

  const fetchDashboardData = async () => {
    try {
      const studentsRes = await axios.get(`${API_BASE_URL}/api/students`);
      setStudents(studentsRes.data);

      const logsRes = await axios.get(`${API_BASE_URL}/api/attendance/logs`, {
        params: { date: selectedDate }
      });
      setAttendanceLogs(logsRes.data);
    } catch (err) {
      console.warn("Using local fallback data in dashboard.");
      // Seeding dummy students and logs if backend is offline
      setStudents([
        { _id: '1', name: 'Rohit', usn: 'sdfsdf2', section: 'w', email: 'rohit@college.edu', phone: '9845120345' },
        { _id: '2', name: 'Aditya Kumar', usn: '1RV22CS004', section: 'CSE-4A', email: 'aditya@rvce.edu.in', phone: '9448203492' },
        { _id: '3', name: 'Neha Sharma', usn: '1RV22CS032', section: 'CSE-4A', email: 'neha@rvce.edu.in', phone: '8123992312' }
      ]);
      setAttendanceLogs([
        { _id: 'a1', studentName: 'Aditya Kumar', usn: '1RV22CS004', time: '09:05:12', status: 'Present', date: selectedDate }
      ]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  // Combine student directory with today's attendance logs
  const getMergedStudentList = (): StudentRow[] => {
    return students.map(student => {
      const log = attendanceLogs.find(l => l.usn === student.usn);
      return {
        _id: student._id,
        name: student.name,
        usn: student.usn,
        section: student.section || 'General',
        status: log ? (log.status as any) : 'Not Marked',
        time: log?.time
      };
    });
  };

  const studentList = getMergedStudentList();
  
  // Calculate metric values
  const totalStudents = students.length;
  const presentCount = studentList.filter(s => s.status === 'Present' || s.status === 'Late').length;
  const absentCount = totalStudents - presentCount;
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Filter list if user toggles "Absentees List"
  const filteredStudents = studentList.filter(s => {
    if (filterType === 'absent') {
      return s.status === 'Not Marked';
    }
    return true;
  });

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatLongDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 select-none font-sans text-slate-100">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Welcome to your attendance tracking dashboard</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Absentees List Toggle */}
          <button 
            onClick={() => setFilterType(prev => prev === 'all' ? 'absent' : 'all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition ${
              filterType === 'absent'
                ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-md shadow-red-500/5'
                : 'bg-white dark:bg-darkbg-card border-slate-200 dark:border-darkbg-border text-slate-300 hover:text-white'
            }`}
          >
            <UserX size={14} /> {filterType === 'absent' ? 'Show All Students' : 'Absentees List'}
          </button>

          {/* Date Picker Input */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-darkbg-card border border-slate-200 dark:border-darkbg-border rounded-xl text-xs font-bold text-slate-300 relative">
            <Calendar size={14} className="text-slate-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-300 outline-none cursor-pointer w-24 sm:w-auto border-none p-0 text-xs font-bold"
            />
          </div>

          {/* Today Button */}
          <button 
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-4 py-2 bg-white dark:bg-darkbg-card border border-slate-200 dark:border-darkbg-border hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* NEW METRICS CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="glass-panel p-5 rounded-2xl glow-card relative border border-slate-200 dark:border-darkbg-border">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
            <Users size={16} className="text-slate-400" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-white">{totalStudents}</span>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Registered in the system</p>
          </div>
        </div>

        {/* Present Today */}
        <div className="glass-panel p-5 rounded-2xl glow-card relative border border-slate-200 dark:border-darkbg-border">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Present on {formatDateLabel(selectedDate)}</span>
            <UserCheck size={16} className="text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-white">{presentCount}</span>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">
              {presentCount > 0 ? `${presentCount} students present` : 'No students present'}
            </p>
          </div>
        </div>

        {/* Absent Today */}
        <div className="glass-panel p-5 rounded-2xl glow-card relative border border-slate-200 dark:border-darkbg-border">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Absent on {formatDateLabel(selectedDate)}</span>
            <UserX size={16} className="text-red-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-white">{absentCount}</span>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">
              {absentCount > 0 ? `${absentCount} students absent` : 'No students absent'}
            </p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="glass-panel p-5 rounded-2xl glow-card relative border border-slate-200 dark:border-darkbg-border">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
            <Calendar size={16} className="text-brand-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-white">{attendanceRate}%</span>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Attendance rate for {formatDateLabel(selectedDate)}</p>
          </div>
        </div>

      </div>

      {/* TODAY'S ATTENDANCE DATA TABLE */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-darkbg-border shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          Attendance for {formatLongDate(selectedDate)}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-darkbg-border text-xs text-slate-400">
                <th className="py-3 px-4 font-bold">Name</th>
                <th className="py-3 px-4 font-bold">USN</th>
                <th className="py-3 px-4 font-bold">Class</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-darkbg-border">
              {filteredStudents.map((stud) => (
                <tr key={stud._id} className="hover:bg-slate-50 dark:hover:bg-brand-950/10 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-300">{stud.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{stud.usn}</td>
                  <td className="py-3.5 px-4 text-slate-400">{stud.section}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                      stud.status === 'Present'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : stud.status === 'Late'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {stud.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                    No student attendance records listed.
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

export default Dashboard;
