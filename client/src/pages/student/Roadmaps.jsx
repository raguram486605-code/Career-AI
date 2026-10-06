import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import { Alert, Bar, Chip, PageTitle, Spinner } from '../../components/ui';

const next = { todo: 'in_progress', in_progress: 'done', done: 'todo' };
const label = { todo: 'To do', in_progress: 'In progress', done: 'Done' };
const color = { todo: 'gray', in_progress: 'amber', done: 'green' };
const icon = { learn: 'L', project: 'P', interview: 'I' };

export default function Roadmaps() {
  const loc = useLocation();
  const [list, setList] = useState(null); const [roles, setRoles] = useState([]); const [role, setRole] = useState(loc.state?.role || '');
  const [hours, setHours] = useState(10); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);

  const load = () => api.get('/roadmaps').then(r => setList(r.data.roadmaps)).catch(e => setErr(errMsg(e)));
  useEffect(() => { load(); api.get('/skills').then(r => setRoles(r.data.roles)).catch(() => {}); }, []);

  const create = async () => {
    if (!role) return setErr('Choose a target role');
    setBusy(true); setErr('');
    try { await api.post('/roadmaps', { role, hoursPerWeek: Number(hours) }); await load(); } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); }
  };
  const toggle = async (rm, st) => {
    try { const { data } = await api.patch(`/roadmaps/${rm._id}/steps/${st.id}`, { status: next[st.status] }); setList(l => l.map(x => x._id === rm._id ? data.roadmap : x)); } catch (e) { setErr(errMsg(e)); }
  };
  const del = async (id) => { if (confirm('Delete this roadmap?')) { await api.delete(`/roadmaps/${id}`); load(); } };

  if (!list) return <><Alert>{err}</Alert><Spinner /></>;
  return (
    <>
      <PageTitle title="Personalised learning roadmaps" sub="Ordered by the skill-dependency graph: prerequisites first, then your project, then interview prep" />
      <Alert>{err}</Alert>
      <div className="card mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px]"><label className="label">Target role</label>
          <select className="input" value={role} onChange={e => setRole(e.target.value)}><option value="">Select a role...</option>{roles.map(r => <option key={r}>{r}</option>)}</select></div>
        <div><label className="label">Hours / week</label><input className="input !w-28" type="number" min="1" max="80" value={hours} onChange={e => setHours(e.target.value)} /></div>
        <button className="btn-primary" onClick={create} disabled={busy}>{busy ? 'Generating...' : 'Generate roadmap'}</button>
      </div>
      <p className="text-xs text-slate-500 mb-4">Tip: to build a roadmap for a specific job, open it from "Jobs & Match" and click "Generate roadmap".</p>
      {!list.length && <p className="text-slate-500">No roadmaps yet.</p>}
      {list.map(rm => {
        const done = rm.steps.filter(s => s.status === 'done').length, pct = rm.steps.length ? 100 * done / rm.steps.length : 0;
        return (
          <div key={rm._id} className="card mb-6">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <div><h2 className="font-semibold text-lg">{rm.target}</h2><div className="text-xs text-slate-500">~{rm.totalHours} hours - ~{rm.estimatedWeeks} weeks</div></div>
              <button className="text-xs text-red-600" onClick={() => del(rm._id)}>Delete</button>
            </div>
            <p className="text-sm text-slate-600 mb-3 font-mono">{rm.path}</p>
            <Bar label={`${done}/${rm.steps.length} steps`} value={pct} color="#16a34a" />
            <ol className="mt-4 space-y-3">
              {rm.steps.map(st => (
                <li key={st.id} className="flex gap-3 items-start border border-slate-100 rounded-lg p-3">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-brand-100 text-brand-700 grid place-items-center text-xs font-bold">{st.order}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{st.skill} <span className="text-xs text-slate-400 font-normal">({icon[st.type]} - {st.hours}h)</span></div>
                    <div className="text-sm text-slate-500">{st.reason}</div>
                    {st.resources?.map(r => <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="text-xs text-brand-600 underline block mt-1">{r.title}</a>)}
                  </div>
                  <button onClick={() => toggle(rm, st)}><Chip color={color[st.status]}>{label[st.status]}</Chip></button>
                </li>))}
            </ol>
          </div>);
      })}
    </>
  );
}
