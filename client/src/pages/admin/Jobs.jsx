import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, SkillInput, Spinner, statusColor } from '../../components/ui';

const empty = { companyId: '', title: '', description: '', requiredSkills: [], niceToHave: [], minCGPA: 0, salary: '', location: '', deadline: '', status: 'open' };

export default function AdminJobs() {
  const [jobs, setJobs] = useState(null); const [companies, setCompanies] = useState([]); const [all, setAll] = useState([]);
  const [f, setF] = useState(empty); const [editId, setEditId] = useState(null); const [err, setErr] = useState('');
  const load = () => api.get('/admin/jobs').then(r => setJobs(r.data.jobs)).catch(e => setErr(errMsg(e)));
  useEffect(() => { load(); api.get('/admin/companies').then(r => setCompanies(r.data.companies)); api.get('/skills').then(r => setAll(r.data.skills.map(s => s.name))); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    const body = { ...f, minCGPA: Number(f.minCGPA) || 0, deadline: f.deadline || null };
    try { editId ? await api.put(`/admin/jobs/${editId}`, body) : await api.post('/admin/jobs', body); setF(empty); setEditId(null); load(); } catch (x) { setErr(errMsg(x)); }
  };
  const del = async (id) => { if (confirm('Delete job and its applications?')) { await api.delete(`/admin/jobs/${id}`); load(); } };
  const edit = (j) => { setEditId(j._id); setF({ ...empty, ...j, companyId: j.companyId?._id || j.companyId, deadline: j.deadline ? j.deadline.slice(0, 10) : '' }); window.scrollTo(0, 0); };
  if (!jobs) return <><Alert>{err}</Alert><Spinner /></>;
  return (
    <>
      <PageTitle title="Job posts" sub="Required skills drive the AI matching - use canonical names (React, Node.js, SQL...)" />
      <Alert>{err}</Alert>
      <form onSubmit={submit} className="card mb-6 grid md:grid-cols-2 gap-4">
        <div><label className="label">Company *</label><select className="input" required value={f.companyId} onChange={set('companyId')}><option value="">Select...</option>{companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
        <div><label className="label">Job title *</label><input className="input" required value={f.title} onChange={set('title')} /></div>
        <div className="md:col-span-2"><label className="label">Description</label><textarea className="input h-24" value={f.description} onChange={set('description')} /></div>
        <div><label className="label">Required skills</label><SkillInput value={f.requiredSkills} onChange={v => setF({ ...f, requiredSkills: v })} suggestions={all} /></div>
        <div><label className="label">Nice to have</label><SkillInput value={f.niceToHave} onChange={v => setF({ ...f, niceToHave: v })} suggestions={all} /></div>
        <div className="grid grid-cols-4 gap-3 md:col-span-2">
          <div><label className="label">Min CGPA</label><input className="input" type="number" step="0.1" min="0" max="10" value={f.minCGPA} onChange={set('minCGPA')} /></div>
          <div><label className="label">Salary</label><input className="input" value={f.salary} onChange={set('salary')} /></div>
          <div><label className="label">Deadline</label><input className="input" type="date" value={f.deadline} onChange={set('deadline')} /></div>
          <div><label className="label">Status</label><select className="input" value={f.status} onChange={set('status')}><option>open</option><option>closed</option></select></div>
        </div>
        <div className="md:col-span-2 flex gap-2"><button className="btn-primary" disabled={!f.requiredSkills.length}>{editId ? 'Update job' : 'Post job'}</button>{editId && <button type="button" className="btn-ghost" onClick={() => { setEditId(null); setF(empty); }}>Cancel</button>}</div>
      </form>
      <div className="card overflow-x-auto"><table className="w-full"><thead><tr>{['Job', 'Company', 'Required skills', 'Applicants', 'Status', ''].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
        <tbody>{jobs.map(j => <tr key={j._id}><td className="td font-medium">{j.title}</td><td className="td">{j.companyId?.name}</td>
          <td className="td"><div className="flex flex-wrap gap-1">{j.requiredSkills.map(s => <Chip key={s} color="blue">{s}</Chip>)}</div></td><td className="td">{j.applicants}</td>
          <td className="td"><Chip color={statusColor(j.status)}>{j.status}</Chip></td>
          <td className="td text-right whitespace-nowrap"><Link className="text-brand-600 text-sm mr-3" to={`/admin/matching?job=${j._id}`}>Match students</Link><button className="text-sm mr-3" onClick={() => edit(j)}>Edit</button><button className="text-red-600 text-sm" onClick={() => del(j._id)}>Delete</button></td></tr>)}</tbody></table></div>
    </>
  );
}
