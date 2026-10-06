import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/client';
import { Alert } from '../components/ui';

export default function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', branch: 'IT', cgpa: '' }); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await register({ ...f, cgpa: Number(f.cgpa) || 0 }); nav('/profile'); }
    catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen grid place-items-center p-4 bg-zinc-950">
      <form onSubmit={submit} className="card w-full max-w-sm border-zinc-800/80 shadow-2xl shadow-red-950/20">
        <h1 className="text-2xl font-bold mb-1 text-white">Create student account</h1>
        <p className="text-sm text-zinc-400 mb-5">Then upload your resume to get AI career guidance.</p>
        <Alert>{err}</Alert>
        <label className="label">Full name</label><input className="input mb-3" required value={f.name} onChange={set('name')} />
        <label className="label">Email</label><input className="input mb-3" type="email" required value={f.email} onChange={set('email')} />
        <label className="label">Password (min 6)</label><input className="input mb-3" type="password" minLength={6} required value={f.password} onChange={set('password')} />
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div><label className="label">Branch</label><select className="input" value={f.branch} onChange={set('branch')}>{['IT', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI&DS'].map(b => <option key={b} className="bg-zinc-900">{b}</option>)}</select></div>
          <div><label className="label">CGPA</label><input className="input" type="number" step="0.01" min="0" max="10" value={f.cgpa} onChange={set('cgpa')} /></div>
        </div>
        <button className="btn-primary w-full py-2.5" disabled={busy}>{busy ? 'Creating...' : 'Register'}</button>
        <p className="text-sm text-center mt-5 text-zinc-400">Have an account? <Link className="text-red-400 hover:text-red-300 font-medium underline-offset-4 hover:underline" to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
