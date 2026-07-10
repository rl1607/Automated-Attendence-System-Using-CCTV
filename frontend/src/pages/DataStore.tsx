import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Download, Trash2, GraduationCap, CalendarCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';

const DataStore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'attendance'>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/students`, { 
        params: { search },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setStudents(res.data);
    } catch (err) {
      setStudents([
        { _id: '1', name: 'Aditya Kumar', usn: '1RV22CS004', section: 'A', department: 'CSE', semester: 4, phone: '9845120345', email: 'aditya@rvce.edu.in' },
        { _id: '2', name: 'Neha Sharma', usn: '1RV22CS032', section: 'A', department: 'CSE', semester: 4, phone: '8124095431', email: 'neha@rvce.edu.in' }
      ]);
    }
  };

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/attendance/logs`, { 
        params: { name: search, usn: search },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setAttendance(res.data);
    } catch (err) {
      setAttendance([
        { _id: '1', studentName: 'Aditya Kumar', usn: '1RV22CS004', subject: 'Computer Networks', date: '2026-07-10', time: '09:05:12', status: 'Present', confidence: 96 },
        { _id: '2', studentName: 'Neha Sharma', usn: '1RV22CS032', subject: 'Computer Networks', date: '2026-07-10', time: '09:12:44', status: 'Present', confidence: 94 }
      ]);
    }
  };

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    } else {
      fetchAttendance();
    }
  }, [activeTab, search]);

  const handleDeleteStudent = async (usn: string) => {
    if (!window.confirm("Remove student from database?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/students/${usn}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchStudents();
    } catch (err) {
      setStudents(prev => prev.filter(s => s.usn !== usn));
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    window.open(`${API_BASE_URL}/api/attendance/export/${format}`);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-sans">Data Store</h1>
          <p className="text-slate-400 text-xs mt-1">Review student roster and chronological logs.</p>
        </div>
        
        {activeTab === 'attendance' && (
          <div className="flex gap-2">
            <button 
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        )}
      </div>

      {/* TABS SELECTOR */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-darkbg-border pb-1">
        <button 
          onClick={() => { setActiveTab('students'); setSearch(''); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'students' 
              ? 'border-brand-500 text-brand-500' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <GraduationCap size={16} /> Students Registry
        </button>
        <button 
          onClick={() => { setActiveTab('attendance'); setSearch(''); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition border-b-2 ${
            activeTab === 'attendance' 
              ? 'border-brand-500 text-brand-500' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <CalendarCheck size={16} /> Attendance Log
        </button>
      </div>

      {/* FILTER SEARCHBAR */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={activeTab === 'students' ? 'Search by name or USN...' : 'Search attendance logs...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50 dark:bg-darkbg text-white focus:outline-none"
          />
        </div>

        {/* LIST TABLES */}
        <div className="overflow-x-auto">
          {activeTab === 'students' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-darkbg-border text-xs text-slate-400">
                  <th className="py-2.5">USN</th>
                  <th className="py-2.5">Full Name</th>
                  <th className="py-2.5">Branch</th>
                  <th className="py-2.5">Semester</th>
                  <th className="py-2.5">Class / Section</th>
                  <th className="py-2.5">Mobile</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 dark:divide-darkbg-border">
                {students.map((stud) => (
                  <tr key={stud._id} className="hover:bg-slate-50 dark:hover:bg-brand-950/10 transition">
                    <td className="py-3 font-semibold text-white">{stud.usn}</td>
                    <td className="py-3 text-slate-300">{stud.name}</td>
                    <td className="py-3 text-slate-400">{stud.department || 'General'}</td>
                    <td className="py-3 text-slate-400">Sem {stud.semester || 1}</td>
                    <td className="py-3 text-slate-400">{stud.section}</td>
                    <td className="py-3 text-slate-400">{stud.phone}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleDeleteStudent(stud.usn)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-darkbg-border text-xs text-slate-400">
                  <th className="py-2.5">Student Name</th>
                  <th className="py-2.5">USN</th>
                  <th className="py-2.5">Subject</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5">Match Accuracy</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 dark:divide-darkbg-border">
                {attendance.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-brand-950/10 transition">
                    <td className="py-3 font-semibold text-white">{log.studentName}</td>
                    <td className="py-3 text-slate-400">{log.usn}</td>
                    <td className="py-3 text-slate-400">{log.subject}</td>
                    <td className="py-3 text-slate-400">{log.date}</td>
                    <td className="py-3 text-slate-400">{log.time}</td>
                    <td className="py-3 text-brand-400 font-bold">{log.confidence}%</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
};

export default DataStore;
