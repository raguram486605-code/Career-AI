import { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { errMsg } from '../../api/client';
import { Alert, PageTitle, Spinner, StatCard } from '../../components/ui';

export default function Progress() {
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/student/progress').then(r => setD(r.data)).catch(e => setErr(errMsg(e))); }, []);
  if (!d) return <><Alert>{err}</Alert><Spinner /></>;
  const s = d.summary;
  const data = d.timeline.map(t => ({ date: new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), skills: t.skillCount, match: t.avgMatch, roadmap: t.roadmapCompletion, interview: t.interviewAvg * 10 }));
  return (
    <>
      <PageTitle title="Progress tracking" sub="How your skills, job-fit, roadmap and interview scores change over time" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Skills" value={s.skills} /><StatCard label="Applications" value={s.applications} hint={`${s.shortlisted} shortlisted`} />
        <StatCard label="Roadmap steps done" value={`${s.roadmapDone}/${s.roadmapTotal}`} /><StatCard label="Interviews" value={s.interviewsDone} hint={s.interviewAvg != null ? `avg ${s.interviewAvg}/10` : ''} />
      </div>
      <div className="card">
        <h2 className="font-semibold mb-4">Trend</h2>
        {data.length < 2 ? <p className="text-sm text-slate-500">Complete a few actions (upload resume, finish roadmap steps, take an interview) to see a trend.</p> : (
          <div className="h-80"><ResponsiveContainer>
            <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[0, 100]} /><Tooltip /><Legend />
              <Line type="monotone" dataKey="match" name="Avg job match %" stroke="#4f46e5" strokeWidth={2} />
              <Line type="monotone" dataKey="roadmap" name="Roadmap %" stroke="#16a34a" strokeWidth={2} />
              <Line type="monotone" dataKey="interview" name="Interview (x10)" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="skills" name="Skill count" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart></ResponsiveContainer></div>)}
      </div>
    </>
  );
}
