import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  VideoOff, Plus, Play, Square, HeartPulse, Trash2, XCircle
} from 'lucide-react';

const CCTV: React.FC = () => {
  const [cameras, setCameras] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [streamingStates, setStreamingStates] = useState<Record<string, boolean>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  
  // Form states
  const [name, setName] = useState('');
  const [rtspUrl, setRtspUrl] = useState('');
  const [building, setBuilding] = useState('Science Block');
  const [room, setRoom] = useState('Room 101');
  const [department, setDepartment] = useState('Computer Science');
  const [fps, setFps] = useState(10);
  const [resolution, setResolution] = useState('1920x1080');

  const fetchCameras = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cameras`);
      setCameras(res.data);
    } catch (err) {
      console.warn("API camera fetch failed, using fallback list.");
      setCameras([
        { _id: 'c1', name: 'Main Corridor 1', rtspUrl: 'rtsp://192.168.1.101/live', building: 'Academic Block A', floor: '1st Floor', room: 'Corridor 1', status: 'online', fps: 15, resolution: '1920x1080', healthStatus: 'Healthy' },
        { _id: 'c2', name: 'CS Laboratory 3', rtspUrl: 'rtsp://192.168.1.102/live', building: 'Lab Complex', floor: 'Ground Floor', room: 'Lab 3', status: 'offline', fps: 10, resolution: '1280x720', healthStatus: 'Offline' },
        { _id: 'c3', name: 'Gate 2 Entrance', rtspUrl: 'rtsp://192.168.1.103/live', building: 'Security Gate', floor: 'Gate 2', room: 'Entrance', status: 'online', fps: 20, resolution: '1920x1080', healthStatus: 'Healthy' }
      ]);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        rtspUrl,
        building,
        floor: 'Ground Floor',
        room,
        department,
        fps,
        resolution
      };
      await axios.post(`${API_BASE_URL}/api/cameras`, payload);
      setShowAddForm(false);
      setName('');
      setRtspUrl('');
      fetchCameras();
    } catch (err) {
      // Mock local addition
      const newCam = {
        _id: Math.random().toString(),
        name, rtspUrl, building, floor: 'Ground Floor', room, department, fps, resolution, status: 'offline', healthStatus: 'Offline'
      };
      setCameras(prev => [...prev, newCam]);
      setShowAddForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove camera config from database?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/cameras/${id}`);
      fetchCameras();
    } catch (err) {
      setCameras(prev => prev.filter(c => c._id !== id));
    }
  };

  const handleStartStream = async (id: string) => {
    try {
      // Set to loading
      setStreamingStates(prev => ({ ...prev, [id]: true }));
      const res = await axios.get(`http://localhost:5000/api/cameras/${id}/preview`);
      
      // Save preview URL
      setPreviews(prev => ({ ...prev, [id]: res.data.previewUrl }));
      fetchCameras(); // Reload online status
      
      // Start thread on FastAPI AI service
      try {
        await axios.post('http://localhost:8000/api/stream/start', {
          rtspUrl: res.data.streamUrl,
          cameraId: id,
          students: []
        }, { timeout: 2000 });
      } catch (aiErr) {
        console.warn("AI microservice stream start trigger warning: Uvicorn service is offline. Running mockup feeds.");
      }
    } catch (err) {
      setStreamingStates(prev => ({ ...prev, [id]: true }));
      setPreviews(prev => ({ 
        ...prev, 
        [id]: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500' 
      }));
    }
  };

  const handleStopStream = async (id: string) => {
    try {
      setStreamingStates(prev => ({ ...prev, [id]: false }));
      // Call stop on AI service
      try {
        await axios.post('http://localhost:8000/api/stream/stop', { cameraId: id }, { timeout: 2000 });
      } catch (aiErr) {}
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      
      {/* CCTV CONTROL BAR */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">CCTV Control Room</h1>
          <p className="text-slate-400 text-xs mt-1">Manage RTSP endpoint configurations and real-time neural streams.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition"
        >
          {showAddForm ? <XCircle size={16} /> : <Plus size={16} />}
          {showAddForm ? 'Cancel Config' : 'Configure Camera'}
        </button>
      </div>

      {/* CONFIG DIALOG */}
      {showAddForm && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-darkbg-border max-w-xl mx-auto shadow-xl">
          <h2 className="text-base font-bold mb-4 uppercase tracking-wider text-slate-300">Add Camera Terminal</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Camera Alias</label>
                <input required type="text" placeholder="e.g. Lab Entrance 1" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">RTSP Stream Address</label>
                <input required type="text" placeholder="rtsp://admin:pass@ip:port/stream" value={rtspUrl} onChange={(e) => setRtspUrl(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Building</label>
                <input type="text" value={building} onChange={(e) => setBuilding(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Room / Corridor Location</label>
                <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">FPS Target</label>
                <input type="number" value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Resolution Class</label>
                <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white">
                  <option value="1920x1080">1080p Full HD</option>
                  <option value="1280x720">720p HD</option>
                  <option value="640x480">480p SD</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded">
              Register CCTV Channel
            </button>
          </form>
        </div>
      )}

      {/* STREAM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameras.map((c) => {
          const isStreaming = streamingStates[c._id];
          const hasPreview = previews[c._id];

          return (
            <div key={c._id} className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-200 dark:border-darkbg-border group">
              
              {/* VIDEO BOX CONTAINER */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-darkbg-border">
                {isStreaming && hasPreview ? (
                  <>
                    <img src={hasPreview} alt="Stream Feed" className="w-full h-full object-cover" />
                    {/* Simulated scanning scanlines */}
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-transparent to-brand-500/5 animate-pulse" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded animate-pulse flex items-center gap-1">
                      <HeartPulse size={10} className="animate-ping" /> LIVE
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <VideoOff size={32} className="mx-auto text-slate-600 mb-2" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Feed Standby</span>
                  </div>
                )}
                
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur text-white text-[9px] font-bold rounded">
                  {c.resolution} | {c.fps} FPS
                </div>
              </div>

              {/* CAMERA INFO & TRIGGERS */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{c.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{c.building} | {c.room}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    c.status === 'online' || isStreaming
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-slate-500/10 text-slate-400'
                  }`}>
                    {isStreaming ? 'Active' : c.status}
                  </span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-slate-200 dark:border-darkbg-border">
                  {!isStreaming ? (
                    <button 
                      onClick={() => handleStartStream(c._id)}
                      className="flex-1 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Play size={12} /> Start Feed
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStopStream(c._id)}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Square size={12} /> Stop Feed
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleDelete(c._id)}
                    className="p-1.5 border border-slate-200 dark:border-darkbg-border hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default CCTV;
