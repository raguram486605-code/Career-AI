import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, ScoreGauge, Spinner } from '../../components/ui';

export default function Jobs() {
  const [data, setData] = useState(null); const [err, setErr] = useState(''); const [q, setQ] = useState('');
  useEffect(() => { api.get('/student/recommendations').then(r => setData(r.data)).catch(e => setErr(errMsg(e))); }, []);
  if (!data) return <><Alert>{err}</Alert><Spinner text="Matching your profile against all open jobs..." /></>;
  const list = data.jobs.filter(x => (x.job.title + x.job.companyId?.name).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Jobs & AI match" sub="Open jobs ranked by how well your skills fit" right={<input className="input !w-56" placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} />} />
      <Alert>{err}</Alert>
      {data.hint && <Alert>{data.hint}</Alert>}
      <div className="grid md:grid-cols-2 gap-4">
        {list.map(({ job, match, eligibility, applied }) => (
          <div key={job._id} className="card flex gap-4">
            <ScoreGauge score={match.score} />
            <div className="flex-1 min-w-0">
              <Link to={`/jobs/${job._id}`} className="font-semibold hover:text-brand-600">{job.title}</Link>
              <div className="text-sm text-slate-500">{job.companyId?.name} - {job.companyId?.location} {job.salary || job.companyId?.package ? `- ${job.salary || job.companyId.package}` : ''}</div>
              <div className="flex flex-wrap gap-1 mt-2">{match.missingSkills.slice(0, 4).map(s => <Chip key={s} color="red">{s}</Chip>)}{!match.missingSkills.length && <Chip color="green">No skill gaps</Chip>}</div>
              <div className="flex gap-2 mt-3 items-center">
                {applied && <Chip color="blue">Applied</Chip>}
                {!eligibility.ok && <Chip color="amber" title={eligibility.reasons.join(', ')}>Not eligible</Chip>}
                <Link className="text-xs text-brand-600 font-medium ml-auto" to={`/jobs/${job._id}`}>Details</Link>
              </div>
            </div>
          </div>))}
      </div>
      {!list.length && <p className="text-slate-500 text-sm">No jobs found.</p>}
    </>
  );
}
