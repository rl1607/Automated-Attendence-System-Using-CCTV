import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FileSpreadsheet, FileText, Download, Search, Calendar,
  ArrowUpDown, Filter, Sparkles
} from 'lucide-react';

const Reports: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  
  // Filters
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/attendance/logs`, {
        params: { name, usn, subject, status, date }
      });
      setLogs(res.data);
    } catch (err) {
      console.warn("Using local fallback data in reports list.");
      setLogs([
        { _id: '1', studentName: 'Aditya Kumar', usn: '1RV22CS004', semester: '4', department: 'Computer Science', subject: 'Computer Networks', date: '2026-07-10', time: '09:05:12', status: 'Present', confidence: 96, location: 'Room 101' },
        { _id: '2', studentName: 'Neha Sharma', usn: '1RV22CS032', semester: '4', department: 'Computer Science', subject: 'Computer Networks', date: '2026-07-10', time: '09:12:44', status: 'Present', confidence: 94, location: 'Room 101' },
        { _id: '3', studentName: 'Rahul Verma', usn: '1RV22CS045', semester: '4', department: 'Computer Science', subject: 'Computer Networks', date: '2026-07-10', time: '09:21:05', status: 'Late', confidence: 92, location: 'Room 101' }
      ]);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [name, usn, subject, status, date]);

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    // Redirect to download URL directly
    window.open(`http://localhost:5000/api/attendance/export/${format === 'xlsx' ? 'xlsx' : format}`);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Reports & Export</h1>
          <p className="text-slate-400 text-xs mt-1">Audit attendance logs, verify statuses, and download print-ready records.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => handleExport('csv')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-50 dark:bg-darkbg-card border border-slate-200 dark:border-darkbg-border rounded-xl text-xs font-bold hover:text-brand-400 transition"
          >
            <Download size={14} /> CSV
          </button>
          <button 
            onClick={() => handleExport('xlsx')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-50 dark:bg-darkbg-card border border-slate-200 dark:border-darkbg-border rounded-xl text-xs font-bold hover:text-brand-400 transition"
          >
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
          >
            <FileText size={14} /> Print PDF
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Filter Name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50 dark:bg-darkbg text-white focus:outline-none"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter USN..."
              value={usn}
              onChange={(e) => setUsn(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50 dark:bg-darkbg text-white focus:outline-none"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter Subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50 dark:bg-darkbg text-white focus:outline-none"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50 dark:bg-darkbg text-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50 dark:bg-darkbg text-white focus:outline-none"
            />
          </div>
        </div>

        {/* LOGS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-darkbg-border text-xs text-slate-400">
                <th className="py-2.5">Student Name</th>
                <th className="py-2.5">USN</th>
                <th className="py-2.5">Department</th>
                <th className="py-2.5">Subject</th>
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Time</th>
                <th className="py-2.5">Confidence</th>
                <th className="py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-darkbg-border">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-brand-950/10 transition">
                  <td className="py-3 font-semibold text-white">{log.studentName}</td>
                  <td className="py-3 text-slate-400">{log.usn}</td>
                  <td className="py-3 text-slate-400">{log.department}</td>
                  <td className="py-3 text-slate-400">{log.subject}</td>
                  <td className="py-3 text-slate-400">{log.date}</td>
                  <td className="py-3 text-slate-400">{log.time}</td>
                  <td className="py-3 text-brand-400 font-semibold">{log.confidence}%</td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'Present' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : log.status === 'Late'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No matching attendance logs found.
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

export default Reports;
