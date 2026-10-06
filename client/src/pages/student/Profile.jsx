import { useEffect, useRef, useState } from 'react';
import api, { errMsg } from '../../api/client';
import { Alert, Bar, Chip, PageTitle, SkillInput, Spinner } from '../../components/ui';

export default function Profile() {
  const [p, setP] = useState(null); const [user, setUser] = useState(null); const [all, setAll] = useState([]);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState(null); const file = useRef();

  useEffect(() => {
    api.get('/student/profile').then(r => { setP(r.data.profile); setUser(r.data.user); }).catch(e => setErr(errMsg(e)));
    api.get('/skills').then(r => setAll(r.data.skills.map(s => s.name))).catch(() => {});
  }, []);

  const save = async () => {
    setBusy(true); setErr(''); setMsg('');
    try {
      const { data } = await api.put('/student/profile', { rollNo: p.rollNo, phone: p.phone, branch: p.branch, graduationYear: p.graduationYear, cgpa: Number(p.cgpa), skills: p.skills });
      setP(data.profile); setMsg('Profile saved');
    } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); }
  };

  const upload = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const fd = new FormData(); fd.append('resume', f);
    setBusy(true); setErr(''); setMsg(''); setAnalysis(null);
    try {
      const { data } = await api.post('/student/resume', fd);
      setP(data.profile); setAnalysis(data.analysis); setMsg(`Resume analysed: ${data.analysis.detectedSkills.length} skills detected`);
    } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); file.current.value = ''; }
  };

  if (!p) return <><Alert>{err}</Alert><Spinner /></>;
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  return (
    <>
      <PageTitle title="Profile & resume" sub={`${user?.name} - ${user?.email}`} />
      <Alert>{err}</Alert><Alert type="ok">{msg}</Alert>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold mb-4">Academic details</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div><label className="label">Roll no.</label><input className="input" value={p.rollNo || ''} onChange={set('rollNo')} /></div>
            <div><label className="label">Phone</label><input className="input" value={p.phone || ''} onChange={set('phone')} /></div>
            <div><label className="label">Branch</label><select className="input" value={p.branch} onChange={set('branch')}>{['IT', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI&DS'].map(b => <option key={b}>{b}</option>)}</select></div>
            <div><label className="label">CGPA</label><input className="input" type="number" step="0.01" min="0" max="10" value={p.cgpa} onChange={set('cgpa')} /></div>
            <div><label className="label">Graduation year</label><input className="input" type="number" value={p.graduationYear || ''} onChange={set('graduationYear')} /></div>
          </div>
          <label className="label">Skills ({p.skills.length}) - auto-detected from your resume; add or remove freely</label>
          <SkillInput value={p.skills} onChange={(skills) => setP({ ...p, skills })} suggestions={all} />
          <button className="btn-primary mt-5" onClick={save} disabled={busy}>Save profile</button>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-2">Resume upload</h2>
            <p className="text-xs text-slate-500 mb-3">PDF, DOCX or TXT (max 5 MB). Text-based files only; scanned images are not supported.</p>
            <input ref={file} type="file" accept=".pdf,.docx,.txt" onChange={upload} disabled={busy} className="text-sm w-full" />
            {busy && <p className="text-sm text-brand-600 mt-2 animate-pulse">Analysing with AI...</p>}
            {p.resume?.fileName && <p className="text-xs text-slate-500 mt-3">Last: {p.resume.fileName} ({new Date(p.resume.uploadedAt).toLocaleDateString()})</p>}
          </div>
          {p.resume?.quality && (
            <div className="card">
              <h2 className="font-semibold mb-2">Resume quality</h2>
              <Bar label="Score" value={p.resume.quality.score} color={p.resume.quality.score > 70 ? '#16a34a' : '#d97706'} />
              <ul className="text-sm text-slate-600 list-disc ml-5 mt-3 space-y-1">{p.resume.quality.suggestions.map(s => <li key={s}>{s}</li>)}</ul>
              {!p.resume.quality.suggestions.length && <p className="text-sm text-green-600 mt-2">Looks complete.</p>}
            </div>)}
        </div>
      </div>
      {analysis && (
        <div className="card mt-6">
          <h2 className="font-semibold mb-3">AI resume analysis</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div><div className="font-medium mb-1">Detected skills</div><div className="flex flex-wrap gap-1">{analysis.detectedSkills.map(s => <Chip key={s} color="blue">{s}</Chip>)}</div></div>
            <div><div className="font-medium mb-1">Evidenced in projects/experience</div><div className="flex flex-wrap gap-1">{analysis.projectSkills.map(s => <Chip key={s} color="green">{s}</Chip>)}{!analysis.projectSkills.length && <span className="text-slate-400">None - describe the tech used in each project</span>}</div></div>
            <div><div className="font-medium mb-1">Sections found</div><div className="flex flex-wrap gap-1">{analysis.sections.map(s => <Chip key={s}>{s}</Chip>)}</div><p className="mt-2 text-slate-500">{analysis.wordCount} words - GitHub link: {analysis.hasGithub ? 'yes' : 'no'}</p></div>
          </div>
        </div>)}
    </>
  );
}
