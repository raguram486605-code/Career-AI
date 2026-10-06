import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import { Alert, Chip, MatchBreakdown, PageTitle, Spinner } from '../../components/ui';

export default function JobDetail() {
  const { id } = useParams(); const nav = useNavigate();
  const [d, setD] = useState(null); const [err, setErr] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { api.get(`/student/jobs/${id}/match`).then(r => setD(r.data)).catch(e => setErr(errMsg(e))); }, [id]);
  if (!d) return <><Alert>{err}</Alert><Spinner /></>;
  const { job, match, eligibility } = d;
  const apply = async () => { setBusy(true); setErr(''); try { await api.post(`/student/jobs/${id}/apply`); setMsg('Application submitted!'); } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); } };
  const roadmap = async () => { setBusy(true); try { await api.post('/roadmaps', { jobId: id }); nav('/roadmaps'); } catch (e) { setErr(errMsg(e)); setBusy(false); } };
  return (
    <>
      <PageTitle title={job.title} sub={`${job.companyId?.name} - ${job.location || job.companyId?.location || ''} - min CGPA ${job.minCGPA || 0}`}
        right={<div className="flex gap-2"><button className="btn-ghost" onClick={roadmap} disabled={busy || !match.missingSkills.length}>Generate roadmap</button><button className="btn-primary" onClick={apply} disabled={busy || !eligibility.ok}>Apply</button></div>} />
      <Alert>{err}</Alert><Alert type="ok">{msg}</Alert>
      {!eligibility.ok && <Alert>Not eligible: {eligibility.reasons.join('; ')}</Alert>}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2"><h2 className="font-semibold mb-4">Why this score?</h2><MatchBreakdown match={match} /></div>
        <div className="card">
          <h2 className="font-semibold mb-2">Job description</h2>
          <p className="text-sm text-slate-600 whitespace-pre-line mb-4">{job.description}</p>
          <div className="text-sm font-medium mb-1">Required</div><div className="flex flex-wrap gap-1 mb-3">{job.requiredSkills.map(s => <Chip key={s} color="blue">{s}</Chip>)}</div>
          {job.niceToHave?.length > 0 && <><div className="text-sm font-medium mb-1">Nice to have</div><div className="flex flex-wrap gap-1">{job.niceToHave.map(s => <Chip key={s}>{s}</Chip>)}</div></>}
          {job.deadline && <p className="text-xs text-slate-500 mt-4">Deadline: {new Date(job.deadline).toLocaleDateString()}</p>}
        </div>
      </div>
      <Link to="/jobs" className="inline-block mt-4 text-sm text-brand-600">Back to jobs</Link>
    </>
  );
}
