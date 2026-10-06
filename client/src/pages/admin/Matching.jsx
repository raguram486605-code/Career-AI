import { Fragment, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, ScoreGauge, Spinner, statusColor } from '../../components/ui';

export default function Matching() {
  const [sp, setSp] = useSearchParams();
  const [jobs, setJobs] = useState([]); const [jobId, setJobId] = useState(sp.get('job') || '');
  const [rows, setRows] = useState(null); const [loading, setLoading] = useState(false); const [err, setErr] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(true); const [minScore, setMinScore] = useState(0); const [open, setOpen] = useState(null);

  useEffect(() => { api.get('/admin/jobs').then(r => setJobs(r.data.jobs)); }, []);
  const run = (id = jobId) => {
    if (!id) return; setLoading(true); setErr(''); setRows(null);
    api.get(`/admin/jobs/${id}/matches`, { params: { onlyEligible, minScore } }).then(r => setRows(r.data.students)).catch(e => setErr(errMsg(e))).finally(() => setLoading(false));
  };
  useEffect(() => { if (jobId) run(); /* eslint-disable-next-line */ }, [jobId, onlyEligible]);

  const setStatus = async (r, status) => {
    try { await api.patch(`/admin/applications/${r.applicationId || 'new'}/status`, { status, studentId: r.studentId, jobId });
      setRows(rs => rs.map(x => x.studentId === r.studentId ? { ...x, status, applicationId: x.applicationId || 'x' } : x)); } catch (e) { setErr(errMsg(e)); }
  };
  return (
    <>
      <PageTitle title="Student-job matching analytics" sub="AI ranks all students for selected jobs. Shortlisting & selection actions are controlled by Company Recruiter users." />
      <Alert>{err}</Alert>
      <div className="card mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[220px]"><label className="label">Job</label>
          <select className="input" value={jobId} onChange={e => { setJobId(e.target.value); setSp(e.target.value ? { job: e.target.value } : {}); }}><option value="">Select a job...</option>{jobs.map(j => <option key={j._id} value={j._id}>{j.title} - {j.companyId?.name}</option>)}</select></div>
        <div><label className="label">Min match %</label><input className="input !w-24" type="number" min="0" max="100" value={minScore} onChange={e => setMinScore(e.target.value)} /></div>
        <label className="flex items-center gap-2 text-sm pb-2 text-zinc-300"><input type="checkbox" checked={onlyEligible} onChange={e => setOnlyEligible(e.target.checked)} /> Only eligible (CGPA / branch)</label>
        <button className="btn-primary" onClick={() => run()} disabled={!jobId || loading}>Apply filters</button>
      </div>
      {loading && <Spinner text="Scoring all students..." />}
      {rows && (
        <div className="card overflow-x-auto">
          <table className="w-full"><thead><tr>{['#', 'Student', 'Branch', 'CGPA', 'Match', 'Missing skills', 'Status', 'Recruiter Action'].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>{rows.map((r, i) => (
              <Fragment key={r.studentId}>
                <tr className="hover:bg-zinc-800/40 border-t border-zinc-800/60">
                  <td className="td text-zinc-400">{i + 1}</td>
                  <td className="td"><button className="font-medium text-left text-white hover:text-red-400" onClick={() => setOpen(open === r.studentId ? null : r.studentId)}>{r.name}</button><div className="text-xs text-zinc-400">{r.email}</div></td>
                  <td className="td text-zinc-300">{r.branch}</td><td className="td text-zinc-300">{r.cgpa}</td>
                  <td className="td"><div className="flex items-center gap-2"><ScoreGauge score={r.score} size={48} /></div></td>
                  <td className="td"><div className="flex flex-wrap gap-1">{r.missing.slice(0, 3).map(s => <Chip key={s} color="red">{s}</Chip>)}{r.missing.length > 3 && <Chip>+{r.missing.length - 3}</Chip>}</div></td>
                  <td className="td">{r.status ? <Chip color={statusColor(r.status)}>{r.status}</Chip> : <span className="text-xs text-zinc-500">not applied</span>}{!r.eligible && <div><Chip color="amber" title={r.eligibilityNotes.join(', ')}>ineligible</Chip></div>}</td>
                  <td className="td whitespace-nowrap">
                    <button className="btn-ghost !py-1 !px-2 text-xs mr-1" disabled={r.status === 'shortlisted'} onClick={() => setStatus(r, 'shortlisted')}>Shortlist</button>
                    <button className="btn-ghost !py-1 !px-2 text-xs mr-1" disabled={!r.status || r.status === 'selected'} onClick={() => setStatus(r, 'selected')}>Select</button>
                    <button className="btn-ghost !py-1 !px-2 text-xs" disabled={!r.status || r.status === 'rejected'} onClick={() => setStatus(r, 'rejected')}>Reject</button></td>
                </tr>
                {open === r.studentId && <tr><td colSpan={8} className="bg-zinc-950 p-4 text-sm text-zinc-300 border-b border-zinc-800">
                  <div>Coverage {r.breakdown.coverage}% - Semantic {r.breakdown.semantic}% - Projects {r.breakdown.projects}%</div>
                  <div className="mt-2 flex flex-wrap gap-1">{r.matched.map(s => <Chip key={s} color="green">{s}</Chip>)}{r.missing.map(s => <Chip key={s} color="red">{s}</Chip>)}</div></td></tr>}
              </Fragment>))}</tbody></table>
          {!rows.length && <p className="text-sm text-zinc-400 p-4">No students match the filters.</p>}
        </div>)}
    </>
  );
}
