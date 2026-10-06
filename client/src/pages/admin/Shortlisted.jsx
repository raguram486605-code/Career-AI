import { useEffect, useState } from 'react';
import api, { downloadCsv, errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, Spinner, statusColor } from '../../components/ui';

export default function Shortlisted() {
  const [list, setList] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/admin/shortlisted').then(r => setList(r.data.shortlisted)).catch(e => setErr(errMsg(e))); }, []);
  if (!list) return <><Alert>{err}</Alert><Spinner /></>;
  return (
    <>
      <PageTitle title="Shortlisted students" right={<button className="btn-ghost" onClick={() => downloadCsv('/admin/reports/shortlisted.csv', 'shortlisted_students.csv')}>Download CSV</button>} />
      <div className="card overflow-x-auto"><table className="w-full"><thead><tr>{['Student', 'Company', 'Job', 'Match', 'Status'].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
        <tbody>{list.map(a => <tr key={a._id}><td className="td"><div className="font-medium">{a.studentId?.name}</div><div className="text-xs text-slate-500">{a.studentId?.email}</div></td><td className="td">{a.jobId?.companyId?.name}</td><td className="td">{a.jobId?.title}</td><td className="td font-semibold">{a.matchScore}%</td><td className="td"><Chip color={statusColor(a.status)}>{a.status}</Chip></td></tr>)}</tbody></table>
        {!list.length && <p className="text-sm text-slate-500 p-4">No one shortlisted yet.</p>}</div>
    </>
  );
}
