import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060c] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background blur decorative circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-900/25 rounded-full filter blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-800/10 rounded-full filter blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md p-8 rounded-3xl bg-[#10101c]/80 border border-[#23233c] backdrop-blur-xl shadow-2xl relative z-10 mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-500/30">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Security Sign In</h2>
          <p className="text-slate-400 text-xs mt-1 text-center">
            CCTV Attendance & Face Recognition Management Panel
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-xs font-bold mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                placeholder="admin@attendance.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#171728] border border-[#2d2d46] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-bold mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-[#171728] border border-[#2d2d46] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center text-slate-400 font-medium cursor-pointer">
              <input type="checkbox" className="mr-2 accent-brand-500 rounded border-slate-700 bg-slate-800" />
              Remember Me
            </label>
            <button 
              type="button"
              onClick={() => alert("Password recovery request sent (Simulated). Check SMTP inbox logs.")}
              className="text-brand-400 hover:text-brand-300 font-bold"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold rounded-xl shadow-lg transition-all duration-200 mt-6 text-sm flex items-center justify-center"
          >
            {isLoading ? 'Processing Access...' : 'Authenticate'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#23233c] text-center">
          <p className="text-[11px] text-slate-500 leading-normal">
            💡 <strong className="text-slate-400">Developer Demo Mode:</strong> Use credentials 
            <br />
            <span className="text-brand-400 font-semibold">admin@attendance.com</span> / <span className="text-brand-400 font-semibold">admin123</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
