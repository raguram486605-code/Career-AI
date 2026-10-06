import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../api/client';
import { Alert } from '../components/ui';

const LOGIN_OPTIONS = [
  {
    id: 'student',
    title: 'Student',
    subtitle: 'Resume analysis & skill guidance',
    icon: '🎓',
    defaultEmail: 'lakshmi@college.edu',
    defaultPassword: 'password123',
    badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-800/80',
  },
  {
    id: 'admin',
    title: 'Admin',
    subtitle: 'Placement analytics & company approval',
    icon: '🛡️',
    defaultEmail: 'raguram486605@gmail.com',
    defaultPassword: 'RaguRaja@0021',
    badgeColor: 'bg-red-950/80 text-red-300 border-red-800/80',
  },
  {
    id: 'company',
    title: 'Company',
    subtitle: 'Post openings & view applicants',
    icon: '🏢',
    defaultEmail: 'hr@zoho.com',
    defaultPassword: 'password123',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
  },
];

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');
  const [f, setF] = useState({ email: 'lakshmi@college.edu', password: 'password123' });
  const [isCompanyRequesting, setIsCompanyRequesting] = useState(false);
  const [compReq, setCompReq] = useState({ companyName: '', contactName: '', contactEmail: '', password: '', industry: 'Software', location: 'Chennai' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const selectOption = (opt) => {
    setSelectedRole(opt.id);
    setIsCompanyRequesting(false);
    setF({ email: opt.defaultEmail, password: opt.defaultPassword });
    setErr('');
    setMsg('');
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const u = await login(f.email, f.password);
      if (u.role === 'admin') nav('/admin');
      else if (u.role === 'company') nav('/company');
      else nav('/');
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setBusy(false);
    }
  };

  const submitCompanyRequest = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const res = await api.post('/auth/company-request', compReq);
      setMsg(res.data.message || 'Company request sent to Admin Box for permission approval!');
      setIsCompanyRequesting(false);
    } catch (x) {
      setErr(errMsg(x));
    } finally {
      setBusy(false);
    }
  };

  const activeOption = LOGIN_OPTIONS.find(o => o.id === selectedRole) || LOGIN_OPTIONS[0];

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-zinc-950">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white text-2xl font-black shadow-xl shadow-red-950/80 mb-3">
            C
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Career<span className="text-red-500">AI</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Select your portal to sign in</p>
        </div>

        {/* 3 Login Options Selector */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {LOGIN_OPTIONS.map((opt) => {
            const isSelected = selectedRole === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectOption(opt)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-red-600 shadow-lg shadow-red-950/50 ring-1 ring-red-500'
                    : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900/80 hover:border-zinc-700'
                }`}
              >
                <div className="text-2xl mb-1">{opt.icon}</div>
                <div>
                  <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                    {opt.title}
                  </div>
                  <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                    {opt.id === 'student' ? 'Student' : opt.id === 'admin' ? 'Placement Admin' : 'Recruiter'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Login / Request Form Container */}
        <div className="card border-zinc-800/80 shadow-2xl shadow-red-950/20">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeOption.icon}</span>
              <span className="font-bold text-white text-lg">
                {isCompanyRequesting ? 'Request Company Account' : `${activeOption.title} Login`}
              </span>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${activeOption.badgeColor}`}>
              {activeOption.title} Portal
            </span>
          </div>

          <Alert type={msg ? 'success' : 'error'}>{msg || err}</Alert>

          {selectedRole === 'company' && isCompanyRequesting ? (
            <form onSubmit={submitCompanyRequest}>
              <label className="label">Company Name</label>
              <input className="input mb-3" required value={compReq.companyName} onChange={e => setCompReq({ ...compReq, companyName: e.target.value })} placeholder="e.g. Infosys Ltd" />

              <label className="label">Recruiter Contact Name</label>
              <input className="input mb-3" required value={compReq.contactName} onChange={e => setCompReq({ ...compReq, contactName: e.target.value })} placeholder="e.g. HR Manager" />

              <label className="label">Official Contact Email</label>
              <input className="input mb-3" type="email" required value={compReq.contactEmail} onChange={e => setCompReq({ ...compReq, contactEmail: e.target.value })} placeholder="hr@company.com" />

              <label className="label">Desired Password</label>
              <input className="input mb-4" type="password" minLength={6} required value={compReq.password} onChange={e => setCompReq({ ...compReq, password: e.target.value })} />

              <button className="btn-primary w-full py-2.5 mb-3" disabled={busy}>
                {busy ? 'Submitting Request...' : 'Send Request to Admin Box'}
              </button>

              <button
                type="button"
                onClick={() => setIsCompanyRequesting(false)}
                className="w-full text-center text-xs text-zinc-400 hover:text-white py-1"
              >
                ← Back to Company Login
              </button>
            </form>
          ) : (
            <form onSubmit={submitLogin}>
              <label className="label">Email Address</label>
              <input
                className="input mb-3"
                type="email"
                required
                value={f.email}
                onChange={(e) => setF({ ...f, email: e.target.value })}
              />

              <label className="label">Password</label>
              <input
                className="input mb-5"
                type="password"
                required
                value={f.password}
                onChange={(e) => setF({ ...f, password: e.target.value })}
              />

              <button className="btn-primary w-full py-2.5" disabled={busy}>
                {busy ? 'Signing in...' : `Sign in as ${activeOption.title}`}
              </button>

              {selectedRole === 'company' && (
                <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
                  <p className="text-xs text-zinc-400 mb-2">Need a recruiter account for your company?</p>
                  <button
                    type="button"
                    onClick={() => setIsCompanyRequesting(true)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Request Company Username & Admin Permission
                  </button>
                </div>
              )}

              {selectedRole === 'student' && (
                <p className="text-sm text-center mt-5 text-zinc-400">
                  New student?{' '}
                  <Link className="text-red-400 hover:text-red-300 font-medium underline-offset-4 hover:underline" to="/register">
                    Create account
                  </Link>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
