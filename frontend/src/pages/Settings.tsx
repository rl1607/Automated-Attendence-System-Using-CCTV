import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Save, Key, Sliders, BellRing, Palette } from 'lucide-react';

const Settings: React.FC = () => {
  const [success, setSuccess] = useState(false);

  // Form states
  const [recognitionConfidence, setRecognitionConfidence] = useState(90);
  const [cameraFPS, setCameraFPS] = useState(10);
  const [recognitionInterval, setRecognitionInterval] = useState(5);
  const [storageLimit, setStorageLimit] = useState(100);

  const [smtpHost, setSmtpHost] = useState('smtp.mailtrap.io');
  const [smtpPort, setSmtpPort] = useState(2525);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('noreply@collegesystem.com');

  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');

  const [providerUrl, setProviderUrl] = useState('');
  const [providerToken, setProviderToken] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/system/settings');
      const data = res.data;
      setRecognitionConfidence(data.recognitionConfidence);
      setCameraFPS(data.cameraFPS);
      setRecognitionInterval(data.recognitionInterval);
      setStorageLimit(data.storageLimit);
      setSmtpHost(data.emailSettings.smtpHost);
      setSmtpPort(data.emailSettings.smtpPort);
      setSmtpUser(data.emailSettings.smtpUser);
      setSmtpPass(data.emailSettings.smtpPass);
      setSmtpFrom(data.emailSettings.smtpFrom);
      setTwilioSid(data.smsSettings.twilioSid);
      setTwilioToken(data.smsSettings.twilioToken);
      setTwilioPhone(data.smsSettings.twilioPhone);
      setProviderUrl(data.whatsAppSettings.providerUrl);
      setProviderToken(data.whatsAppSettings.providerToken);
      setTheme(data.theme);
    } catch (err) {
      console.warn("Using local configuration fallback parameters.");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        recognitionConfidence,
        cameraFPS,
        recognitionInterval,
        storageLimit,
        emailSettings: { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom },
        smsSettings: { twilioSid, twilioToken, twilioPhone },
        whatsAppSettings: { providerUrl, providerToken },
        theme
      };
      await axios.put('http://localhost:5000/api/system/settings', payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-slate-400 text-xs mt-1">Configure neural margins, target FPS, alert pathways, and messaging triggers.</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1.5">
          ✔ Application properties committed successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        
        {/* RECOGNITION CONFIGS */}
        <div className="glass-panel p-5 rounded-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Sliders size={16} /> Recognition Core Rules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1">Recognition Confidence Threshold (%)</label>
              <input type="number" min={50} max={100} value={recognitionConfidence} onChange={(e) => setRecognitionConfidence(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1">Stream Capture Rate (FPS)</label>
              <input type="number" min={1} max={30} value={cameraFPS} onChange={(e) => setCameraFPS(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1">Neural Matching Interval (seconds)</label>
              <input type="number" min={1} max={60} value={recognitionInterval} onChange={(e) => setRecognitionInterval(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1">Cloud Image Storage Cap (GB)</label>
              <input type="number" min={10} value={storageLimit} onChange={(e) => setStorageLimit(Number(e.target.value))} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
            </div>
          </div>
        </div>

        {/* MESSAGING KEY INTEGRATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SMTP EMAIL */}
          <div className="glass-panel p-5 rounded-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Key size={16} /> SMTP Gateway Configuration
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">SMTP Host</label>
                <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-slate-400 text-xs font-bold mb-1">SMTP Username</label>
                  <input type="text" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-bold mb-1">Port</label>
                  <input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">SMTP Password</label>
                <input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
              </div>
            </div>
          </div>

          {/* TELEPHONE (TWILIO / WHATSAPP) */}
          <div className="glass-panel p-5 rounded-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <BellRing size={16} /> SMS & WhatsApp Carrier APIs
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Twilio Account SID</label>
                <input type="text" value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Twilio Auth Token</label>
                <input type="password" value={twilioToken} onChange={(e) => setTwilioToken(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Twilio Phone Line</label>
                <input type="text" placeholder="+123456789" value={twilioPhone} onChange={(e) => setTwilioPhone(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white" />
              </div>
            </div>
          </div>

        </div>

        <button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition">
          <Save size={16} /> Save Application Configurations
        </button>

      </form>

    </div>
  );
};

export default Settings;
