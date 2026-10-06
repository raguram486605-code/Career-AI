import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, ScoreGauge, Spinner, StatCard } from '../../components/ui';

export default function Dashboard() {
  const [prog, setProg] = useState(null); const [rec, setRec] = useState(null); const [err, setErr] = useState('');
  useEffect(() => {
    api.get('/student/progress').then(r => setProg(r.data)).catch(e => setErr(errMsg(e)));
    api.get('/student/recommendations').then(r => setRec(r.data)).catch(e => setErr(errMsg(e)));
  }, []);
  if (!prog) return <><Alert>{err}</Alert><Spinner /></>;
  const s = prog.summary;
  return (
    <>
      <PageTitle title="Your career dashboard" sub="AI-powered guidance based on your resume and skills" />
      <Alert>{err}</Alert>
      {!s.skills && <div className="card mb-6 bg-red-950/40 border-red-900/60 text-zinc-200">You have no skills yet. <Link className="text-red-400 font-semibold underline" to="/profile">Upload your resume</Link> to unlock role recommendations, skill-gap analysis and roadmaps.</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Skills detected" value={s.skills} />
        <StatCard label="Resume quality" value={s.resumeQuality != null ? `${s.resumeQuality}/100` : '-'} hint="Upload a resume to score" />
        <StatCard label="Roadmap progress" value={s.roadmapTotal ? `${s.roadmapDone}/${s.roadmapTotal}` : '-'} hint="steps completed" />
        <StatCard label="Avg interview score" value={s.interviewAvg != null ? `${s.interviewAvg}/10` : '-'} hint={`${s.interviewsDone} sessions`} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-3 text-white">Best-fit roles for you</h2>
          {!rec ? <Spinner /> : rec.roles.length === 0 ? <p className="text-sm text-zinc-400">{rec.hint}</p> :
            rec.roles.slice(0, 4).map(r => (
              <div key={r.role} className="flex items-center gap-4 py-3 border-t border-zinc-800/80 first:border-0">
                <ScoreGauge score={r.score} size={64} />
                <div className="flex-1 min-w-0"><div className="font-medium text-zinc-100">{r.role}</div>
                  <div className="flex flex-wrap gap-1 mt-1">{r.missing.slice(0, 4).map(m => <Chip key={m} color="red">{m}</Chip>)}{!r.missing.length && <Chip color="green">All required skills covered</Chip>}</div></div>
                <Link className="btn-ghost text-xs" to="/roadmaps" state={{ role: r.role }}>Roadmap</Link>
              </div>))}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3 text-white">Top job matches</h2>
          {!rec ? <Spinner /> : rec.jobs.length === 0 ? <p className="text-sm text-zinc-400">No open jobs or no skills yet.</p> :
            rec.jobs.slice(0, 4).map(({ job, match, eligibility }) => (
              <Link to={`/jobs/${job._id}`} key={job._id} className="flex items-center gap-4 py-3 border-t border-zinc-800/80 first:border-0 hover:bg-zinc-800/50 rounded-lg px-2 transition-colors">
                <ScoreGauge score={match.score} size={64} />
                <div className="flex-1"><div className="font-medium text-zinc-100">{job.title}</div><div className="text-xs text-zinc-400">{job.companyId?.name}</div>
                  {!eligibility.ok && <Chip color="amber">{eligibility.reasons[0]}</Chip>}</div>
              </Link>))}
          <Link className="text-sm text-red-400 font-medium hover:text-red-300 block mt-3" to="/jobs">See all jobs →</Link>
        </div>
      </div>
    </>
  );
}
