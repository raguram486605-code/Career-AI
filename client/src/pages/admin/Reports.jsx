import { useEffect, useState } from 'react';
import api, { downloadCsv, errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, Spinner } from '../../components/ui';

const reports = [
  ['Student report', 'Name, branch, CGPA, skills, resume status and quality', '/admin/reports/students.csv', 'students_report.csv'],
  ['Applications report', 'Every application with match score, status and missing skills', '/admin/reports/applications.csv', 'applications_report.csv'],
  ['Shortlisted report', 'Shortlisted and selected students per job', '/admin/reports/shortlisted.csv', 'shortlisted_students.csv'],
];

export default function Reports() {
  const [students, setStudents] = useState(null); const [err, setErr] = useState(''); const [q, setQ] = useState('');
  useEffect(() => { api.get('/admin/students').then(r => setStudents(r.data.students)).catch(e => setErr(errMsg(e))); }, []);
  const dl = (p, f) => downloadCsv(p, f).catch(e => setErr(errMsg(e)));
  return (
    <>
      <PageTitle title="Reports" sub="Download CSV exports for placement records" />
      <Alert>{err}</Alert>
      <div className="grid md:grid-cols-3 gap-4 mb-8">{reports.map(([t, d, p, f]) => <div key={t} className="card"><h2 className="font-semibold">{t}</h2><p className="text-sm text-slate-500 my-2">{d}</p><button className="btn-primary" onClick={() => dl(p, f)}>Download CSV</button></div>)}</div>
      <div className="card overflow-x-auto"><div className="flex justify-between mb-3"><h2 className="font-semibold">All students</h2><input className="input !w-56" placeholder="Search name / skill" value={q} onChange={e => setQ(e.target.value)} /></div>
        {!students ? <Spinner /> : <table className="w-full"><thead><tr>{['Name', 'Branch', 'CGPA', 'Resume quality', 'Skills'].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>{students.filter(s => (s.name + s.skills.join(' ')).toLowerCase().includes(q.toLowerCase())).map(s => <tr key={s.id}><td className="td"><div className="font-medium">{s.name}</div><div className="text-xs text-slate-500">{s.email}</div></td><td className="td">{s.branch}</td><td className="td">{s.cgpa}</td><td className="td">{s.resumeQuality ?? '-'}</td><td className="td"><div className="flex flex-wrap gap-1">{s.skills.slice(0, 6).map(k => <Chip key={k}>{k}</Chip>)}</div></td></tr>)}</tbody></table>}
      </div>
    </>
  );
}
