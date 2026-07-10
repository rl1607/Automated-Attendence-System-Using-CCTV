import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, ShieldAlert, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const FaceRecognition: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [matchingStatus, setMatchingStatus] = useState<'idle' | 'scanning' | 'matched' | 'unknown'>('idle');
  const [matchedStudent, setMatchedStudent] = useState<any | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startWebcam = async () => {
    try {
      setCameraError(false);
      setMatchingStatus('scanning');
      setMatchedStudent(null);

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } });
      mediaStreamRef.current = stream;
      setIsActive(true);
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError(true);
      setMatchingStatus('idle');
    }
  };

  // Bind stream after video element mounts in DOM
  useEffect(() => {
    if (isActive && videoRef.current && mediaStreamRef.current) {
      const video = videoRef.current;
      video.srcObject = mediaStreamRef.current;
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      video.play().catch(err => console.log("Video playback error:", err));
    }
  }, [isActive]);

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setMatchingStatus('idle');
  };

  // Simulate scanning matching loops
  useEffect(() => {
    let timeout: any;
    if (isActive && matchingStatus === 'scanning') {
      timeout = setTimeout(() => {
        // 80% chance we match a student in our mock list
        if (Math.random() < 0.8) {
          setMatchedStudent({
            name: 'Sneha Patel',
            usn: '1RV22CS054',
            class: 'CSE-4A',
            confidence: 96,
            time: new Date().toLocaleTimeString()
          });
          setMatchingStatus('matched');
        } else {
          setMatchingStatus('unknown');
        }
      }, 4000); // 4 seconds of "scanning"
    }

    return () => clearTimeout(timeout);
  }, [isActive, matchingStatus]);

  return (
    <div className="space-y-6 max-w-xl mx-auto flex flex-col items-center">
      
      {/* HEADER TITLE */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Face Recognition</h1>
        <p className="text-slate-400 text-xs mt-1">Position your face in the frame to record attendance.</p>
      </div>

      {/* SCANNING BOX CONTAINER */}
      <div className="relative w-full aspect-[4/5] bg-black rounded-3xl overflow-hidden border border-slate-200 dark:border-darkbg-border flex items-center justify-center shadow-2xl">
        
        {isActive && !cameraError ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            
            {/* Holographic scanner frame overlay */}
            <div className="absolute inset-8 border-2 border-brand-500/30 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-500 rounded-tl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-500 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-500 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-500 rounded-br" />
            </div>

            {/* Glowing Scanline */}
            {matchingStatus === 'scanning' && (
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-500 shadow-[0_0_12px_#8b5cf6] animate-bounce" style={{ animationDuration: '3s' }} />
            )}

            {/* FLOATING HUD METRICS CARD */}
            {matchingStatus === 'matched' && matchedStudent && (
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/20 backdrop-blur-md flex items-center gap-3 text-white">
                <CheckCircle size={28} className="text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-sm truncate">{matchedStudent.name}</p>
                  <p className="text-emerald-400 font-semibold mt-0.5">{matchedStudent.usn} | Class: {matchedStudent.class}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Matched at {matchedStudent.time} (Conf: {matchedStudent.confidence}%)</p>
                </div>
              </div>
            )}

            {matchingStatus === 'unknown' && (
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-red-950/90 border border-red-500/20 backdrop-blur-md flex items-center gap-3 text-white">
                <AlertCircle size={28} className="text-red-400 shrink-0" />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-bold text-sm">Unknown Face Detected</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">No match found in student registry.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-6 space-y-4 max-w-xs">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-200">Camera permission denied.</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Please allow camera access in your browser settings to scan faces and register attendance.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* TRIGGERS */}
      <div className="w-full">
        {!isActive ? (
          <button 
            onClick={startWebcam}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-brand-500/20"
          >
            Scan Face
          </button>
        ) : (
          <button 
            onClick={stopWebcam}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition border border-slate-700"
          >
            Stop Scanner
          </button>
        )}
      </div>

    </div>
  );
};

export default FaceRecognition;
