import { useEffect, useState, Fragment } from 'react';
import api, { errMsg } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Alert, PageTitle, Spinner, StatCard, Chip, ScoreGauge, statusColor } from '../../components/ui';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [rows, setRows] = useState(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/student/jobs')
      .then(res => {
        const jList = res.data || [];
        setJobs(jList);
        if (jList.length > 0) {
          setSelectedJobId(jList[0]._id);
        }
      })
      .catch(e => setErr(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  const fetchMatches = (jId) => {
    if (!jId) return;
    setLoadingMatches(true);
    setErr('');
    api.get(`/company/jobs/${jId}/matches`)
      .then(res => setRows(res.data.students || []))
      .catch(e => setErr(errMsg(e)))
      .finally(() => setLoadingMatches(false));
  };

  useEffect(() => {
    if (selectedJobId) fetchMatches(selectedJobId);
  }, [selectedJobId]);

  const setStatus = async (r, status) => {
    setMsg('');
    setErr('');
    try {
      await api.patch(`/company/applications/${r.applicationId || 'new'}/status`, {
        status,
        studentId: r.studentId,
        jobId: selectedJobId
      });
      setMsg(`Candidate status updated to '${status}'`);
      setRows(rs => rs.map(x => x.studentId === r.studentId ? { ...x, status, applicationId: x.applicationId || 'updated' } : x));
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <PageTitle 
        title={`${user.name || 'Company'} Recruiter Portal`} 
        sub="Review candidate AI match scores, shortlist top applicants, select or reject students" 
      />
      <Alert type={msg ? 'success' : 'error'}>{msg || err}</Alert>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Recruiter Company" value={user.name || 'Company User'} hint={user.email} color="text-red-500" />
        <StatCard label="Active Job Openings" value={jobs.length} hint="Open recruitment drives" />
        <StatCard label="Scored Candidates" value={rows ? rows.length : 0} hint="AI ranked students" />
        <StatCard 
          label="Shortlisted / Selected" 
          value={rows ? rows.filter(r => r.status === 'shortlisted' || r.status === 'selected').length : 0} 
          hint="By Recruiter" 
          color="text-emerald-400" 
        />
      </div>

      {/* Candidate Shortlisting & Selection Matrix (Editable by Company Users Only) */}
      <div className="card mb-6 border-red-900/40 bg-zinc-900/90 shadow-2xl shadow-red-950/20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800">
          <div>
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <span>🎯</span> Candidate Shortlisting & Review (Company Exclusive)
            </h2>
            <p className="text-xs text-zinc-400">Select candidate status (Shortlist, Select, Reject) for your posted jobs</p>
          </div>
          <div className="min-w-[220px]">
            <label className="label text-xs">Select Opening</label>
            <select 
              className="input py-1 text-sm bg-zinc-950 border-zinc-700" 
              value={selectedJobId} 
              onChange={e => setSelectedJobId(e.target.value)}
            >
              {jobs.map(j => (
                <option key={j._id} value={j._id}>{j.title} ({j.companyId?.name || 'Your Company'})</option>
              ))}
            </select>
          </div>
        </div>

        {loadingMatches ? (
          <Spinner text="Scoring & ranking candidate resumes..." />
        ) : !rows || rows.length === 0 ? (
          <p className="text-sm text-zinc-400 py-4">No student candidates found for this job opening.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">#</th>
                  <th className="th">Candidate Student</th>
                  <th className="th">Branch & CGPA</th>
                  <th className="th">AI Match %</th>
                  <th className="th">Missing Skills</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Recruiter Action (Company Only)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.studentId} className="hover:bg-zinc-800/40 transition-colors border-t border-zinc-800/60">
                    <td className="td text-zinc-400">{idx + 1}</td>
                    <td className="td font-medium text-white">
                      <div>{r.name}</div>
                      <div className="text-xs text-zinc-400">{r.email}</div>
                    </td>
                    <td className="td text-zinc-300">
                      <div>{r.branch}</div>
                      <div className="text-xs text-zinc-400">CGPA: {r.cgpa}</div>
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <ScoreGauge score={r.score} size={46} />
                      </div>
                    </td>
                    <td className="td">
                      <div className="flex flex-wrap gap-1">
                        {r.missing.slice(0, 3).map(s => <Chip key={s} color="red">{s}</Chip>)}
                        {!r.missing.length && <Chip color="green">Full Skill Coverage</Chip>}
                      </div>
                    </td>
                    <td className="td">
                      {r.status ? (
                        <Chip color={statusColor(r.status)}>{r.status}</Chip>
                      ) : (
                        <span className="text-xs text-zinc-500 italic">not applied</span>
                      )}
                    </td>
                    <td className="td text-right whitespace-nowrap">
                      <div className="inline-flex gap-1.5">
                        <button 
                          className={`btn text-xs px-2.5 py-1 ${r.status === 'shortlisted' ? 'bg-amber-950 text-amber-300 border border-amber-800 opacity-60' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'}`} 
                          disabled={r.status === 'shortlisted'} 
                          onClick={() => setStatus(r, 'shortlisted')}
                        >
                          Shortlist
                        </button>
                        <button 
                          className={`btn text-xs px-2.5 py-1 ${r.status === 'selected' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 opacity-60' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'}`} 
                          disabled={r.status === 'selected'} 
                          onClick={() => setStatus(r, 'selected')}
                        >
                          Select
                        </button>
                        <button 
                          className={`btn text-xs px-2.5 py-1 ${r.status === 'rejected' ? 'bg-zinc-800 text-red-400 border border-red-900/60 opacity-60' : 'bg-red-900/80 hover:bg-red-800 text-red-100 border border-red-700'}`} 
                          disabled={r.status === 'rejected'} 
                          onClick={() => setStatus(r, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
