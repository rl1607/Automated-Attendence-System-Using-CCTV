import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { ShieldCheck, Cpu, HardDrive, AlertTriangle } from 'lucide-react';

const Analytics: React.FC = () => {
  const [telemetry, setTelemetry] = useState<any>({
    dailyAttendance: [],
    departmentWise: [],
    attendanceTrend: [],
    cameraUptime: [],
    recognitionTimes: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/system/analytics');
        setTelemetry(res.data);
      } catch (err) {
        console.warn("Using local fallback telemetry dataset.");
        setTelemetry({
          dailyAttendance: [
            { name: 'Mon', attendance: 88, accuracy: 98.2 },
            { name: 'Tue', attendance: 92, accuracy: 98.5 },
            { name: 'Wed', attendance: 90, accuracy: 99.0 },
            { name: 'Thu', attendance: 94, accuracy: 97.9 },
            { name: 'Fri', attendance: 89, accuracy: 98.4 }
          ],
          departmentWise: [
            { name: 'Computer Science', attendance: 94 },
            { name: 'Electronics', attendance: 88 },
            { name: 'Mechanical', attendance: 82 },
            { name: 'Information Science', attendance: 91 }
          ],
          cameraUptime: [
            { name: 'Gate 1 Cam', uptime: 99.8 },
            { name: 'Gate 2 Cam', uptime: 98.5 },
            { name: 'Class 101 Cam', uptime: 95.0 },
            { name: 'Lab 1 Cam', uptime: 99.1 }
          ]
        });
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Analytics Telemetry</h1>
        <p className="text-slate-400 text-xs mt-1">Deep visual diagnostics detailing recognition speed, false alarms, and CCTV uptimes.</p>
      </div>

      {/* METRIC PILLS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Avg Recognition Latency', value: '1.2s', desc: 'Edge processing speed', icon: Cpu, color: 'text-indigo-400' },
          { title: 'False Positive Rate', value: '0.12%', desc: 'Industrial target is < 0.5%', icon: ShieldCheck, color: 'text-emerald-400' },
          { title: 'Avg Camera Uptime', value: '98.1%', desc: 'Based on ping metrics', icon: HardDrive, color: 'text-brand-400' },
          { title: 'Unknown Face Triggers', value: '14 today', desc: 'Alert notifications sent', icon: AlertTriangle, color: 'text-amber-400' }
        ].map((c, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl relative glow-card">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{c.title}</span>
              <c.icon size={18} className={c.color} />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-white">{c.value}</p>
            <span className="text-[10px] text-slate-500 mt-1 font-semibold">{c.desc}</span>
          </div>
        ))}
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RECOGNITION PRECISION VS ATTENDANCE RATE */}
        <div className="glass-panel p-5 rounded-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Recognition Precision vs Attendance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetry.dailyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232333" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#161620', border: '1px solid #232333', color: '#fff', borderRadius: '12px' }} />
                <Legend verticalAlign="top" height={36} />
                <Area name="Attendance %" type="monotone" dataKey="attendance" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                <Area name="Precision Accuracy %" type="monotone" dataKey="accuracy" stroke="#a855f7" fill="#a855f7" fillOpacity={0.05} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CAMERA UPTIMES */}
        <div className="glass-panel p-5 rounded-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">CCTV Feed Uptime (%)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={telemetry.cameraUptime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232333" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis domain={[90, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#161620', border: '1px solid #232333', color: '#fff', borderRadius: '12px' }} />
                <Bar name="Uptime Rate" dataKey="uptime" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
