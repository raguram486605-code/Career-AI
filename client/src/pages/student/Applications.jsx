import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, Spinner, statusColor } from '../../components/ui';

export default function Applications() {
  const [list, setList] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/student/applications').then(r => setList(r.data.applications)).catch(e => setErr(errMsg(e))); }, []);
  if (!list) return <><Alert>{err}</Alert><Spinner /></>;
  return (
    <>
      <PageTitle title="My applications" />
      <div className="card overflow-x-auto">
        {!list.length ? <p className="text-sm text-slate-500">You haven't applied to any job yet.</p> : (
          <table className="w-full"><thead><tr><th className="th">Company</th><th className="th">Job</th><th className="th">Match</th><th className="th">Missing skills</th><th className="th">Status</th></tr></thead>
            <tbody>{list.map(a => (
              <tr key={a._id}><td className="td">{a.jobId?.companyId?.name}</td><td className="td">{a.jobId?.title}</td><td className="td font-semibold">{a.matchScore}%</td>
                <td className="td"><div className="flex flex-wrap gap-1">{a.missingSkills.map(s => <Chip key={s} color="red">{s}</Chip>)}</div></td>
                <td className="td"><Chip color={statusColor(a.status)}>{a.status}</Chip></td></tr>))}</tbody></table>)}
      </div>
    </>
  );
}
