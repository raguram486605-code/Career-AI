import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { errMsg } from '../../api/client';
import { Alert, PageTitle, Spinner, StatCard } from '../../components/ui';

const COLORS = ['#ef4444', '#10b981', '#f59e0b', '#b91c1c', '#38bdf8', '#c084fc'];

export default function Dashboard() {
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/admin/analytics').then(r => setD(r.data)).catch(e => setErr(errMsg(e))); }, []);
  if (!d) return <><Alert>{err}</Alert><Spinner /></>;
  const t = d.totals;
  return (
    <>
      <PageTitle title="Placement analytics" sub="Live overview of students, jobs and applications" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Students" value={t.students} hint={`${t.resumesUploaded} resumes uploaded`} />
        <StatCard label="Companies / open jobs" value={`${t.companies} / ${t.openJobs}`} />
        <StatCard label="Applications" value={t.applications} hint={`${t.shortlisted} shortlisted`} />
        <StatCard label="Placement rate" value={`${t.placementRate}%`} hint={`${t.placed} placed`} color="text-emerald-400" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card"><h2 className="font-semibold mb-3 text-white">Most common student skills</h2>
          <div className="h-72"><ResponsiveContainer><BarChart data={d.topSkills} layout="vertical" margin={{ left: 40 }}><CartesianGrid stroke="#27272a" strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} stroke="#a1a1aa" /><YAxis type="category" dataKey="skill" width={90} stroke="#a1a1aa" /><Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} /><Bar dataKey="students" fill="#ef4444" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="card"><h2 className="font-semibold mb-1 text-white">Skill gap: demand vs supply</h2><p className="text-xs text-zinc-400 mb-2">Skills asked by open jobs vs students who have them. Plan training sessions for the biggest gaps.</p>
          <div className="h-64"><ResponsiveContainer><BarChart data={d.skillGaps}><CartesianGrid stroke="#27272a" strokeDasharray="3 3" /><XAxis dataKey="skill" interval={0} angle={-25} textAnchor="end" height={60} stroke="#a1a1aa" /><YAxis allowDecimals={false} stroke="#a1a1aa" /><Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} /><Legend /><Bar dataKey="jobsNeeding" name="Jobs needing" fill="#ef4444" radius={[4, 4, 0, 0]} /><Bar dataKey="studentsHave" name="Students with skill" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="card"><h2 className="font-semibold mb-3 text-white">Application status</h2>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={d.byStatus} dataKey="value" nameKey="name" outerRadius={90} label>{d.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} /><Legend /></PieChart></ResponsiveContainer></div></div>
        <div className="card"><h2 className="font-semibold mb-3 text-white">Match-score distribution of applications</h2>
          <div className="h-64"><ResponsiveContainer><BarChart data={d.scoreDistribution}><CartesianGrid stroke="#27272a" strokeDasharray="3 3" /><XAxis dataKey="range" stroke="#a1a1aa" /><YAxis allowDecimals={false} stroke="#a1a1aa" /><Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} /><Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      </div>
    </>
  );
}
