import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
  Users, Video, UserCheck, AlertTriangle, ShieldCheck, 
  Calendar, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

interface DashboardMetrics {
  totalStudents: number;
  totalFaculty: number;
  activeCameras: number;
  offlineCameras: number;
  presentToday: number;
  absentToday: number;
  unknownFaces: number;
  todayClasses: number;
}

interface Analytics {
  attendancePercentage: number;
  recognitionAccuracy: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  avgRecognitionTime: number;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalStudents: 120,
    totalFaculty: 15,
    activeCameras: 4,
    offlineCameras: 1,
    presentToday: 98,
    absentToday: 22,
    unknownFaces: 3,
    todayClasses: 8
  });

  const [analytics, setAnalytics] = useState<Analytics>({
    attendancePercentage: 81,
    recognitionAccuracy: 98.4,
    falsePositiveRate: 0.2,
    falseNegativeRate: 1.4,
    avgRecognitionTime: 1.2
  });

  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [recentUnknowns, setRecentUnknowns] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get(`${API_BASE_URL}/api/system/dashboard-stats`);
        setMetrics(statsRes.data.metrics);
        setAnalytics(statsRes.data.analytics);

        const logsRes = await axios.get(`${API_BASE_URL}/api/attendance/logs`);
        setAttendanceLogs(logsRes.data.slice(0, 5));

        const unknownsRes = await axios.get(`${API_BASE_URL}/api/attendance/unknown-faces`);
        setRecentUnknowns(unknownsRes.data.slice(0, 3));
      } catch (err) {
        console.warn("⚠️ Using local mock data because backend API is offline.");
        // Seed some mock logs for visuals
        setAttendanceLogs([
          { _id: '1', studentName: 'Aditya Kumar', usn: '1RV22CS004', time: '09:05:12', status: 'Present', confidence: 96, location: 'Room 101' },
          { _id: '2', studentName: 'Neha Sharma', usn: '1RV22CS032', time: '09:12:44', status: 'Present', confidence: 94, location: 'Room 101' },
          { _id: '3', studentName: 'Rahul Verma', usn: '1RV22CS045', time: '09:21:05', status: 'Late', confidence: 92, location: 'Room 101' },
          { _id: '4', studentName: 'Sneha Patel', usn: '1RV22CS054', time: '09:02:18', status: 'Present', confidence: 98, location: 'Room 102' }
        ]);
        setRecentUnknowns([
          { _id: 'u1', location: 'Class Corridor', time: '10:14:02', confidence: 78, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
          { _id: 'u2', location: 'Campus Entrance', time: '08:44:31', confidence: 66, image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' }
        ]);
      }
    };
    fetchData();
  }, []);

  const attendanceTrendData = [
    { name: 'Mon', Present: 92, Late: 4 },
    { name: 'Tue', Present: 94, Late: 2 },
    { name: 'Wed', Present: 88, Late: 7 },
    { name: 'Thu', Present: 96, Late: 1 },
    { name: 'Fri', Present: 90, Late: 5 }
  ];

  const deptData = [
    { name: 'CS', Present: 94 },
    { name: 'EC', Present: 88 },
    { name: 'ME', Present: 78 },
    { name: 'IS', Present: 92 },
    { name: 'CV', Present: 81 }
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Enterprise Overview</h1>
          <p className="text-slate-400 text-xs mt-1">Live CCTV telemetry, neural metrics, and class registration overview.</p>
        </div>
        <div className="flex gap-3 text-xs font-bold text-slate-400 bg-white dark:bg-darkbg-card border border-slate-200 dark:border-darkbg-border rounded-xl p-2">
          <span className="flex items-center gap-1.5 text-brand-400">
            <Clock size={14} /> Local Session: 17:21 PM
          </span>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Registered Students', value: metrics.totalStudents, icon: Users, color: 'from-blue-600 to-indigo-600', label: `${metrics.todayClasses} today classes` },
          { title: 'Active CCTV Feeds', value: `${metrics.activeCameras}/${metrics.activeCameras + metrics.offlineCameras}`, icon: Video, color: 'from-brand-600 to-fuchsia-600', label: `${metrics.offlineCameras} offline streams` },
          { title: 'Marked Present Today', value: metrics.presentToday, icon: UserCheck, color: 'from-emerald-600 to-teal-600', label: `${metrics.absentToday} absentees detected` },
          { title: 'Recognition Precision', value: `${analytics.recognitionAccuracy}%`, icon: ShieldCheck, color: 'from-violet-600 to-brand-600', label: `${analytics.avgRecognitionTime}s avg speed` },
        ].map((c, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl glow-card relative">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{c.title}</span>
              <div className={`p-2 rounded-xl bg-gradient-to-tr ${c.color} text-white shadow-md`}>
                <c.icon size={16} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight text-white">{c.value}</span>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Weekly Attendance Volatility</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232333" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#161620', border: '1px solid #232333', color: '#fff', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="Present" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Department Load Distribution</h2>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232333" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#161620', border: '1px solid #232333', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="Present" fill="#a855f7" radius={[4, 4, 0, 0]}>
                  {deptData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#a855f7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TABLES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT ATTENDANCE */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Real-time Recognition Event Logs</h2>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">LIVE SYNCING</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-darkbg-border text-xs text-slate-400">
                  <th className="py-2.5">Student Name</th>
                  <th className="py-2.5">USN</th>
                  <th className="py-2.5">Location</th>
                  <th className="py-2.5">Timestamp</th>
                  <th className="py-2.5">Neural Confidence</th>
                  <th className="py-2.5">Access Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100 dark:divide-darkbg-border">
                {attendanceLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-brand-950/10 transition">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-100">{log.studentName}</td>
                    <td className="py-3 text-slate-400">{log.usn}</td>
                    <td className="py-3 text-slate-400">{log.location}</td>
                    <td className="py-3 text-slate-400">{log.time}</td>
                    <td className="py-3 font-semibold text-brand-400">{log.confidence}%</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        log.status === 'Present' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {log.status === 'Present' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* UNKNOWN FACES ALERTS */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} /> Intruder / Unknown Alerts
            </h2>
            <div className="space-y-3">
              {recentUnknowns.map((u) => (
                <div key={u._id} className="flex items-center gap-3 p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl transition">
                  <img src={u.image} alt="Unknown Face" className="w-10 h-10 rounded-lg object-cover border border-red-500/20" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{u.location}</p>
                    <span className="text-[10px] text-slate-400">{u.time} | Neural match: {u.confidence}%</span>
                  </div>
                  <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-bold">SECURE</span>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => alert("Forwarding CCTV audit records to emergency channels (Simulated).")}
            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition mt-4"
          >
            Acknowledge Warnings
          </button>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
