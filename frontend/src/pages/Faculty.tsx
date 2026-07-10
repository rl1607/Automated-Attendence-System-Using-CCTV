import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, XCircle } from 'lucide-react';

const Faculty: React.FC = () => {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [subjects, setSubjects] = useState('');

  const fetchFaculty = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/faculty`, { params: { search } });
      setFaculty(res.data);
    } catch (err) {
      console.warn("API faculty fetch failed, using fallback list.");
      setFaculty([
        { _id: 'f1', name: 'Dr. Srinivas Murthy', email: 'srinivas.murthy@rvce.edu.in', phone: '9448203492', department: 'Computer Science', subjects: ['Computer Networks', 'Distributed Systems'] },
        { _id: 'f2', name: 'Prof. Anitha Patel', email: 'anitha.patel@rvce.edu.in', phone: '8123992312', department: 'Computer Science', subjects: ['Database Management Systems', 'Software Engineering'] }
      ]);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        email,
        phone,
        department,
        subjects: subjects.split(',').map(s => s.trim())
      };
      await axios.post(`${API_BASE_URL}/api/faculty`, payload);
      setShowAddForm(false);
      setName('');
      setEmail('');
      setPhone('');
      setSubjects('');
      fetchFaculty();
    } catch (err) {
      // Mock local addition
      const mockFac = {
        _id: Math.random().toString(),
        name, email, phone, department, subjects: subjects.split(',')
      };
      setFaculty(prev => [...prev, mockFac]);
      setShowAddForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove faculty profile from database?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/faculty/${id}`);
      fetchFaculty();
    } catch (err) {
      setFaculty(prev => prev.filter(f => f._id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Faculty Directory</h1>
          <p className="text-slate-400 text-xs mt-1">Manage teaching staff profiles, contact emails, and subject configurations.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
        >
          {showAddForm ? <XCircle size={16} /> : <Plus size={16} />}
          {showAddForm ? 'Close Form' : 'Register Faculty'}
        </button>
      </div>

      {/* FORM REGISTRATION */}
      {showAddForm && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-darkbg-border max-w-xl mx-auto shadow-xl">
          <h2 className="text-base font-bold mb-4 uppercase tracking-wider text-slate-300">New Faculty Registration</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1">Full Name</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Email Address</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold mb-1">Phone Number</label>
                <input required type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1">Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white">
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Information Science">Information Science</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1">Subjects (Comma separated)</label>
              <input required type="text" placeholder="e.g. Networks, Algorithms" value={subjects} onChange={(e) => setSubjects(e.target.value)} className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg shadow-lg">
              Create Faculty Profile
            </button>
          </form>
        </div>
      )}

      {/* FILTER & LIST TABLE */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by faculty name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-darkbg-border bg-slate-50 dark:bg-darkbg text-white focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-darkbg-border text-xs text-slate-400">
                <th className="py-2.5">Faculty Name</th>
                <th className="py-2.5">Department</th>
                <th className="py-2.5">Email Address</th>
                <th className="py-2.5">Phone</th>
                <th className="py-2.5">Subjects Assigned</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100 dark:divide-darkbg-border">
              {faculty.map((f) => (
                <tr key={f._id} className="hover:bg-slate-50 dark:hover:bg-brand-950/10 transition">
                  <td className="py-3 font-semibold text-white">{f.name}</td>
                  <td className="py-3 text-slate-400">{f.department}</td>
                  <td className="py-3 text-slate-400">{f.email}</td>
                  <td className="py-3 text-slate-400">{f.phone}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {f.subjects?.map((s: string, idx: number) => (
                        <span key={idx} className="bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <button 
                      onClick={() => handleDelete(f._id)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {faculty.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No faculty records found.
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

export default Faculty;
