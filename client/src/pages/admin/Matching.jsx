import { Fragment, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, ScoreGauge, Spinner, statusColor } from '../../components/ui';
import ResumeModal from '../../components/ResumeModal';

export default function Matching() {
  const [sp, setSp] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState(sp.get('job') || '');
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [open, setOpen] = useState(null);
  const [viewResumeStudentId, setViewResumeStudentId] = useState(null);

  const handleDownloadResume = async (studentId, studentName) => {
    try {
      const res = await api.get(`/resumes/${studentId}/download`, { responseType: 'blob' });
      const filename = `${(studentName || 'Student').replace(/\s+/g, '_')}_Resume.txt`;
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setErr('Failed to download resume: ' + errMsg(e));
    }
  };

  useEffect(() => {
    api.get('/admin/jobs').then(r => setJobs(r.data.jobs));
  }, []);

  const run = (id = jobId) => {
    if (!id) return;
    setLoading(true);
    setErr('');
    setRows(null);
    api.get(`/admin/jobs/${id}/matches`, { params: { onlyEligible, minScore } })
      .then(r => setRows(r.data.students))
      .catch(e => setErr(errMsg(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (jobId) run();
    /* eslint-disable-next-line */
  }, [jobId, onlyEligible]);

  return (
    <>
      <PageTitle
        title="Student-Job Matching Analytics"
        sub="AI ranks all students for selected jobs. Candidate shortlisting, status decisions, and interview round management are editable exclusively by Company Users."
      />
      <Alert>{err}</Alert>

      <div className="card mb-6 flex flex-wrap gap-4 items-end bg-zinc-900 border-zinc-800">
        <div className="flex-1 min-w-[220px]">
          <label className="label">Job Opening</label>
          <select
            className="input"
            value={jobId}
            onChange={e => {
              setJobId(e.target.value);
              setSp(e.target.value ? { job: e.target.value } : {});
            }}
          >
            <option value="">Select a job...</option>
            {jobs.map(j => (
              <option key={j._id} value={j._id}>
                {j.title} - {j.companyId?.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Min match %</label>
          <input
            className="input !w-24"
            type="number"
            min="0"
            max="100"
            value={minScore}
            onChange={e => setMinScore(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm pb-2 text-zinc-300">
          <input
            type="checkbox"
            checked={onlyEligible}
            onChange={e => setOnlyEligible(e.target.checked)}
          />{' '}
          Only eligible (CGPA / branch)
        </label>
        <button
          className="btn-primary"
          onClick={() => run()}
          disabled={!jobId || loading}
        >
          Apply filters
        </button>
      </div>

      {loading && <Spinner text="Scoring all students..." />}

      {rows && (
        <div className="card overflow-x-auto bg-zinc-900 border-zinc-800">
          <table className="w-full">
            <thead>
              <tr>
                {['#', 'Student', 'Branch', 'CGPA', 'Match', 'Missing skills', 'Status', 'Recruiter Action'].map(h => (
                  <th key={h} className="th">
                    {h === 'Recruiter Action' ? 'Recruiter Action (Company Only)' : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <Fragment key={r.studentId}>
                  <tr className="hover:bg-zinc-800/40 border-t border-zinc-800/60 transition-colors">
                    <td className="td text-zinc-400">{i + 1}</td>
                    <td className="td">
                      <button
                        className="font-medium text-left text-white hover:text-red-400 cursor-pointer"
                        onClick={() => setOpen(open === r.studentId ? null : r.studentId)}
                      >
                        {r.name}
                      </button>
                      <div className="text-xs text-zinc-400">{r.email}</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <button
                          onClick={() => setViewResumeStudentId(r.studentId)}
                          className="text-[11px] px-2 py-0.5 rounded bg-sky-950/90 hover:bg-sky-900 text-sky-200 border border-sky-800 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Open resume in display"
                        >
                          <span>📄</span>
                          <span>View Resume</span>
                        </button>
                        <button
                          onClick={() => handleDownloadResume(r.studentId, r.name)}
                          className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          title="Download resume document"
                        >
                          <span>⬇️</span>
                        </button>
                      </div>
                    </td>
                    <td className="td text-zinc-300">{r.branch}</td>
                    <td className="td text-zinc-300">{r.cgpa}</td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <ScoreGauge score={r.score} size={48} />
                      </div>
                    </td>
                    <td className="td">
                      <div className="flex flex-wrap gap-1">
                        {r.missing.slice(0, 3).map(s => (
                          <Chip key={s} color="red">
                            {s}
                          </Chip>
                        ))}
                        {r.missing.length > 3 && <Chip>+{r.missing.length - 3}</Chip>}
                        {!r.missing.length && <Chip color="green">Full Match</Chip>}
                      </div>
                    </td>
                    <td className="td">
                      {r.status ? (
                        <Chip color={statusColor(r.status)}>{r.status}</Chip>
                      ) : (
                        <span className="text-xs text-zinc-500 italic">not applied</span>
                      )}
                      {!r.eligible && (
                        <div className="mt-1">
                          <Chip color="amber" title={r.eligibilityNotes.join(', ')}>
                            ineligible
                          </Chip>
                        </div>
                      )}
                    </td>
                    <td className="td whitespace-nowrap">
                      {/* Non-editable by Admin users; managed strictly by Company Users */}
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-zinc-800/90 text-zinc-300 border border-zinc-700/60"
                          title="Candidate recruitment status and interview rounds are editable exclusively by Company Users"
                        >
                          <span className="text-amber-400 text-xs">🔒</span>
                          Company Users Only
                        </span>
                        {r.interviewRounds && r.interviewRounds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.interviewRounds.map((rnd, rIdx) => (
                              <span
                                key={rIdx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-300"
                              >
                                {rnd.roundType === 'aptitude' ? 'Aptitude (50Q)' : rnd.roundType === 'technical' ? 'Tech Quiz (30Q)' : '1-on-1 Interview'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {open === r.studentId && (
                    <tr>
                      <td colSpan={8} className="bg-zinc-950 p-4 text-sm text-zinc-300 border-b border-zinc-800">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
                          <div>
                            Coverage {r.breakdown.coverage}% - Semantic {r.breakdown.semantic}% - Projects {r.breakdown.projects}%
                          </div>
                          <span className="text-xs text-zinc-500">
                            Interview scheduling controlled by Company Recruiter
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {r.matched.map(s => (
                            <Chip key={s} color="green">
                              {s}
                            </Chip>
                          ))}
                          {r.missing.map(s => (
                            <Chip key={s} color="red">
                              {s}
                            </Chip>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className="text-sm text-zinc-400 p-4">No students match the filters.</p>
          )}
        </div>
      )}

      {viewResumeStudentId && (
        <ResumeModal
          studentId={viewResumeStudentId}
          onClose={() => setViewResumeStudentId(null)}
        />
      )}
    </>
  );
}
