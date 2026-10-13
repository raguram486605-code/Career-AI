import { useEffect, useState, Fragment } from 'react';
import api, { downloadCsv, errMsg } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Alert, PageTitle, Spinner, StatCard, Chip, ScoreGauge, statusColor } from '../../components/ui';
import ResumeModal from '../../components/ResumeModal';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [rows, setRows] = useState(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [filterAppliedOnly, setFilterAppliedOnly] = useState(false);

  // Resume Display & Download Modal
  const [viewResumeStudentId, setViewResumeStudentId] = useState(null);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  // Job CRUD Modal State
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '', description: '', requiredSkills: '', niceToHave: '',
    minCGPA: 0, allowedBranches: '', salary: '', location: '', deadline: '', status: 'open'
  });
  const [jobModalBusy, setJobModalBusy] = useState(false);
  const [jobModalErr, setJobModalErr] = useState('');

  // Interview Creation Modal State
  const [interviewCandidate, setInterviewCandidate] = useState(null);
  const [selectedRoundType, setSelectedRoundType] = useState('aptitude');
  const [oneOnOneForm, setOneOnOneForm] = useState({
    meetingDate: new Date(Date.now() + 864e5 * 2).toISOString().split('T')[0],
    meetingTime: '11:00 AM IST',
    meetingLink: 'https://meet.google.com/hiring-interview',
    interviewerName: user.name || 'Recruitment Panel',
    instructions: 'Please be in a quiet space with a stable connection, and have your portfolio/code samples open.',
  });
  const [submittingRound, setSubmittingRound] = useState(false);
  const [modalErr, setModalErr] = useState('');

  // View Details Modal State for 1-on-1 interview
  const [viewDetailsRound, setViewDetailsRound] = useState(null);

  // Retake Review Modal State for Terminated / Accidental Closed Tests
  const [reviewRetakeData, setReviewRetakeData] = useState(null);
  const [processingRetake, setProcessingRetake] = useState(false);
  const [retakeModalErr, setRetakeModalErr] = useState('');

  const handleReviewRetake = async (action) => {
    if (!reviewRetakeData || !reviewRetakeData.applicationId || !reviewRetakeData.round?._id) return;
    setProcessingRetake(true);
    setRetakeModalErr('');
    try {
      const res = await api.post(
        `/company/applications/${reviewRetakeData.applicationId}/interview-rounds/${reviewRetakeData.round._id}/retake-review`,
        { action }
      );
      setMsg(res.data.message || `Re-take request successfully ${action}d!`);
      setReviewRetakeData(null);
      fetchMatches(selectedJobId);
    } catch (e) {
      setRetakeModalErr(errMsg(e));
    } finally {
      setProcessingRetake(false);
    }
  };

  const fetchJobs = () => {
    api.get('/company/jobs')
      .then(res => {
        const jList = res.data.jobs || [];
        setJobs(jList);
        if (jList.length > 0 && (!selectedJobId || !jList.some(x => x._id === selectedJobId))) {
          setSelectedJobId(jList[0]._id);
        }
      })
      .catch(e => setErr(errMsg(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateJobModal = () => {
    setEditingJob(null);
    setJobForm({
      title: '', description: '', requiredSkills: '', niceToHave: '',
      minCGPA: 0, allowedBranches: '', salary: '', location: '', deadline: '', status: 'open'
    });
    setJobModalErr('');
    setShowJobModal(true);
  };

  const openEditJobModal = (j) => {
    setEditingJob(j);
    setJobForm({
      title: j.title || '',
      description: j.description || '',
      requiredSkills: (j.requiredSkills || []).join(', '),
      niceToHave: (j.niceToHave || []).join(', '),
      minCGPA: j.minCGPA || 0,
      allowedBranches: (j.allowedBranches || []).join(', '),
      salary: j.salary || '',
      location: j.location || '',
      deadline: j.deadline ? j.deadline.split('T')[0] : '',
      status: j.status || 'open'
    });
    setJobModalErr('');
    setShowJobModal(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    setJobModalBusy(true);
    setJobModalErr('');
    try {
      if (editingJob) {
        await api.put(`/company/jobs/${editingJob._id}`, jobForm);
        setMsg('Job opening updated successfully!');
      } else {
        const res = await api.post('/company/jobs', jobForm);
        setMsg('Job opening posted successfully!');
        if (res.data?.job?._id) setSelectedJobId(res.data.job._id);
      }
      setShowJobModal(false);
      fetchJobs();
    } catch (err) {
      setJobModalErr(errMsg(err));
    } finally {
      setJobModalBusy(false);
    }
  };

  const handleDeleteJob = async (jId) => {
    if (!window.confirm('Are you sure you want to delete this job opening and its applicant records?')) return;
    try {
      await api.delete(`/company/jobs/${jId}`);
      setMsg('Job opening deleted successfully!');
      fetchJobs();
    } catch (err) {
      setErr(errMsg(err));
    }
  };

  const handleDownloadApplicantsReport = async () => {
    setDownloadingCsv(true);
    setMsg('');
    try {
      await downloadCsv('/company/reports/applicants.csv', `${(user.name || 'Company').replace(/\s+/g, '_')}_Applicants_Report.csv`);
      setMsg('Applicants details report successfully downloaded!');
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setDownloadingCsv(false);
    }
  };

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

  const selectedJob = jobs.find(j => j._id === selectedJobId);

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

  const handleOpenInterviewModal = (candidate) => {
    setInterviewCandidate(candidate);
    setModalErr('');
    // Automatically pick the first round that hasn't been created yet
    const existingTypes = (candidate.interviewRounds || []).map(r => r.roundType);
    if (!existingTypes.includes('aptitude')) {
      setSelectedRoundType('aptitude');
    } else if (!existingTypes.includes('technical')) {
      setSelectedRoundType('technical');
    } else if (!existingTypes.includes('one_on_one')) {
      setSelectedRoundType('one_on_one');
    } else {
      setSelectedRoundType('aptitude');
    }
  };

  const handleCreateRound = async () => {
    if (!interviewCandidate) return;
    setSubmittingRound(true);
    setModalErr('');

    try {
      const payload = {
        roundType: selectedRoundType,
        studentId: interviewCandidate.studentId,
        jobId: selectedJobId,
        ...(selectedRoundType === 'one_on_one' ? oneOnOneForm : {}),
      };

      const res = await api.post(
        `/company/applications/${interviewCandidate.applicationId || 'new'}/interview-rounds`,
        payload
      );

      setMsg(res.data.message || 'Interview round created successfully!');
      setInterviewCandidate(null);

      // Refresh matches
      fetchMatches(selectedJobId);
    } catch (e) {
      setModalErr(errMsg(e));
    } finally {
      setSubmittingRound(false);
    }
  };

  if (loading) return <Spinner />;

  const displayRows = (rows || []).filter(r => !filterAppliedOnly || Boolean(r.status));
  const appliedCount = (rows || []).filter(r => r.status).length;

  return (
    <>
      <PageTitle 
        title={`${user.name || 'Company'} Recruiter Portal`} 
        sub="Post and manage company job drives, review applicants, view/download student resumes, and decide interview rounds."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openCreateJobModal}
              className="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shadow-md shadow-red-950/40 cursor-pointer"
            >
              <span>+</span>
              <span>Post New Job</span>
            </button>
            <button
              onClick={handleDownloadApplicantsReport}
              disabled={downloadingCsv}
              className="btn bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3.5 py-2 inline-flex items-center gap-1.5 rounded-lg shadow-md shadow-emerald-950/40 cursor-pointer transition-colors"
              title="Download complete details of all applicants in CSV"
            >
              <span>{downloadingCsv ? '⏳' : '📥'}</span>
              <span>{downloadingCsv ? 'Exporting...' : 'Download All Applicants (CSV)'}</span>
            </button>
          </div>
        }
      />
      <Alert type={msg ? 'success' : 'error'}>{msg || err}</Alert>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Recruiter Company" value={user.name || 'Company User'} hint={user.email} color="text-red-500" />
        <StatCard label="Active Openings" value={jobs.length} hint="Total company drives" />
        <StatCard label="Applied Students" value={appliedCount} hint="Submitted applications" color="text-sky-400" />
        <StatCard 
          label="Shortlisted / Selected" 
          value={rows ? rows.filter(r => r.status === 'shortlisted' || r.status === 'selected').length : 0} 
          hint="By Recruiter" 
          color="text-emerald-400" 
        />
      </div>

      {/* Company Job Openings Management (Add, Update, Delete) */}
      <div className="card mb-6 border-zinc-800 bg-zinc-900/90 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 pb-3 border-b border-zinc-800">
          <div>
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <span>💼</span> Company Openings & Recruitment Drives
            </h2>
            <p className="text-xs text-zinc-400">
              Manage your company's active drives: add new jobs, update criteria or salary, and view applicant pools.
            </p>
          </div>
          <button
            onClick={openCreateJobModal}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>+</span> Post Another Opening
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {jobs.map(j => {
            const isSelected = j._id === selectedJobId;
            return (
              <div
                key={j._id}
                className={`p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-red-600 bg-red-950/20 shadow-md shadow-red-950/30 ring-1 ring-red-600/50'
                    : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="font-bold text-sm text-white truncate" title={j.title}>
                    {j.title}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                    j.status === 'open' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {j.status}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 space-y-0.5 mb-2.5">
                  <div>💰 {j.salary || j.companyId?.package || 'Negotiable'} • 📍 {j.location || j.companyId?.location || 'Chennai'}</div>
                  <div>🎯 Min CGPA: {j.minCGPA || 0} • 👥 Applicants: <strong className="text-white">{j.applicantsCount ?? 0}</strong></div>
                  <div className="truncate text-zinc-500 text-[11px]" title={(j.requiredSkills || []).join(', ')}>
                    Skills: {(j.requiredSkills || []).join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                  <button
                    onClick={() => setSelectedJobId(j._id)}
                    className={`text-xs px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                      isSelected
                        ? 'bg-red-600 text-white font-semibold'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    {isSelected ? '✓ Active Drive' : 'Select Opening'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditJobModal(j)}
                      className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      title="Update job opening criteria"
                    >
                      <span>✏️</span> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJob(j._id)}
                      className="text-xs px-2 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      title="Delete this job opening"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Shortlisting & Selection Matrix (Editable by Company Users Only) */}
      <div className="card mb-6 border-red-900/40 bg-zinc-900/90 shadow-2xl shadow-red-950/20">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-800">
          <div>
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <span>🎯</span> Candidate Shortlisting & Resume Review ({selectedJob?.title || 'Selected Job'})
            </h2>
            <p className="text-xs text-zinc-400">
              Review applicant details, view & download resumes, and manage interview rounds for this drive.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px]">
              <label className="label text-xs">Switch Job Opening</label>
              <select 
                className="input py-1 text-sm bg-zinc-950 border-zinc-700" 
                value={selectedJobId} 
                onChange={e => setSelectedJobId(e.target.value)}
              >
                {jobs.map(j => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.companyId?.name || 'Company'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter View Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-medium">Candidate Filter:</span>
            <button
              onClick={() => setFilterAppliedOnly(true)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                filterAppliedOnly
                  ? 'bg-red-950 text-white border-red-700 font-bold shadow-md shadow-red-950/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Applied Candidates Only ({appliedCount})
            </button>
            <button
              onClick={() => setFilterAppliedOnly(false)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                !filterAppliedOnly
                  ? 'bg-red-950 text-white border-red-700 font-bold shadow-md shadow-red-950/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              All AI-Ranked Candidates ({rows ? rows.length : 0})
            </button>
          </div>

          <button
            onClick={handleDownloadApplicantsReport}
            disabled={downloadingCsv}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>📥</span>
            <span>Export Applied Students CSV</span>
          </button>
        </div>

        {loadingMatches ? (
          <Spinner text="Scoring & ranking candidate resumes..." />
        ) : !displayRows || displayRows.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 bg-zinc-950/40 rounded-xl border border-zinc-800/80 my-2">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-sm font-medium text-zinc-300">
              {filterAppliedOnly
                ? 'No students have applied to this job opening yet.'
                : 'No student candidates found for this job opening.'}
            </p>
            {filterAppliedOnly && (
              <button
                onClick={() => setFilterAppliedOnly(false)}
                className="mt-3 text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
              >
                Switch to view all AI-ranked students for this opening
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">#</th>
                  <th className="th">Candidate & Resume</th>
                  <th className="th">Academic Info</th>
                  <th className="th">Match %</th>
                  <th className="th">Status</th>
                  <th className="th">Interview Rounds (Max 3)</th>
                  <th className="th text-right">Recruiter Action (Company Only)</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((r, idx) => {
                  const rounds = r.interviewRounds || [];
                  const maxRoundsReached = rounds.length >= 3;

                  return (
                    <tr key={r.studentId} className="hover:bg-zinc-800/40 transition-colors border-t border-zinc-800/60">
                      <td className="td text-zinc-400">{idx + 1}</td>
                      <td className="td font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{r.name}</span>
                          {r.status && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-semibold">
                              Applied
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400">{r.email}</div>
                        {(r.phone || r.rollNo) && (
                          <div className="text-[11px] text-zinc-400 mt-0.5 flex flex-wrap gap-x-2">
                            {r.rollNo && <span>🆔 {r.rollNo}</span>}
                            {r.phone && <span>📞 {r.phone}</span>}
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-1.5">
                          <button
                            onClick={() => setViewResumeStudentId(r.studentId)}
                            className="text-xs px-2.5 py-1 rounded bg-sky-950/90 hover:bg-sky-900 text-sky-200 border border-sky-800 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-sm"
                            title="Open candidate resume in display"
                          >
                            <span>📄</span>
                            <span>View Resume</span>
                          </button>
                          <button
                            onClick={() => handleDownloadResume(r.studentId, r.name)}
                            className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Download candidate resume document"
                          >
                            <span>⬇️</span>
                          </button>
                        </div>
                        {rounds.some(rnd => rnd.retakeRequest?.status === 'pending') && (
                          <div className="mt-1.5">
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-semibold animate-pulse inline-flex items-center gap-1">
                              ⚠️ Re-take Requested
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="td text-zinc-300">
                        <div>{r.branch}</div>
                        <div className="text-xs text-zinc-400">CGPA: {r.cgpa}</div>
                        <div className="text-[10px] text-zinc-500">Batch: {r.graduationYear || 2026}</div>
                      </td>
                      <td className="td">
                        <div className="flex items-center gap-2">
                          <ScoreGauge score={r.score} size={46} />
                        </div>
                      </td>
                      <td className="td">
                        {r.status ? (
                          <Chip color={statusColor(r.status)}>{r.status}</Chip>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">not applied</span>
                        )}
                      </td>
                      <td className="td">
                        <div className="flex flex-col gap-1.5 items-start">
                          {rounds.length === 0 ? (
                            <span className="text-xs text-zinc-500 italic">No rounds scheduled</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {rounds.map((rnd, rIdx) => {
                                const is1on1 = rnd.roundType === 'one_on_one';
                                const isApt = rnd.roundType === 'aptitude';
                                const isTech = rnd.roundType === 'technical';
                                const isPendingRetake = rnd.retakeRequest?.status === 'pending';
                                const isTerminated = rnd.status === 'terminated';
                                const isRetakeApproved = rnd.retakeRequest?.status === 'approved';
                                const isRetakeRejected = rnd.retakeRequest?.status === 'rejected';

                                const handleClick = () => {
                                  if (is1on1) {
                                    setViewDetailsRound({ round: rnd, student: r });
                                  } else {
                                    setReviewRetakeData({ candidate: r, round: rnd, applicationId: r.applicationId });
                                  }
                                };

                                return (
                                  <button
                                    key={rIdx}
                                    onClick={handleClick}
                                    className={`text-xs px-2 py-0.5 rounded border inline-flex items-center gap-1 transition-all cursor-pointer ${
                                      isPendingRetake
                                        ? 'bg-amber-950/90 border-amber-500 text-amber-200 hover:bg-amber-900 shadow-md shadow-amber-950/50 animate-pulse'
                                        : isTerminated
                                        ? 'bg-red-950/90 border-red-700 text-red-200 hover:bg-red-900'
                                        : is1on1
                                        ? 'bg-purple-950/80 border-purple-800 text-purple-200 hover:bg-purple-900'
                                        : isApt
                                        ? 'bg-blue-950/80 border-blue-800 text-blue-200 hover:bg-blue-900/60'
                                        : 'bg-emerald-950/80 border-emerald-800 text-emerald-200 hover:bg-emerald-900/60'
                                    }`}
                                    title={
                                      is1on1
                                        ? 'Click to view scheduled 1-on-1 meeting and email dispatch details'
                                        : isPendingRetake
                                        ? '⚠️ Student requested re-take with reason. Click to review and approve/reject!'
                                        : isTerminated
                                        ? '🛑 Assessment was terminated automatically. Click to review cause or unlock.'
                                        : 'Click to view assessment details & timing'
                                    }
                                  >
                                    <span>
                                      {isPendingRetake ? '⚠️' : isTerminated ? '🛑' : is1on1 ? '🤝' : isApt ? '📊' : '💻'}
                                    </span>
                                    <span>
                                      {isApt ? 'Aptitude (50Q)' : isTech ? 'Technical (30Q)' : '1-on-1 Interview'}
                                    </span>
                                    {isPendingRetake ? (
                                      <span className="font-bold text-amber-300 ml-0.5 bg-amber-900/80 px-1 py-0.2 rounded text-[10px]">
                                        Review Retake
                                      </span>
                                    ) : isTerminated ? (
                                      <span className="text-[10px] text-red-300 font-semibold">(Terminated)</span>
                                    ) : isRetakeApproved ? (
                                      <span className="text-[10px] text-emerald-300 font-semibold">(Retake Approved)</span>
                                    ) : isRetakeRejected ? (
                                      <span className="text-[10px] text-zinc-400 font-semibold">(Retake Rejected)</span>
                                    ) : rnd.score != null ? (
                                      <span className="font-bold text-amber-300 ml-0.5">({rnd.score}%)</span>
                                    ) : (
                                      <span className="text-[10px] text-zinc-400">({rnd.status})</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Action to create interview round manually */}
                          {!maxRoundsReached ? (
                            <button
                              onClick={() => handleOpenInterviewModal(r)}
                              className="text-xs font-semibold px-2 py-1 rounded bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/80 transition-colors inline-flex items-center gap-1 shadow-sm mt-0.5"
                            >
                              <span>+</span> Create Interview ({rounds.length}/3)
                            </button>
                          ) : (
                            <span className="text-[11px] text-zinc-500 font-medium">✓ Max 3 rounds scheduled</span>
                          )}
                        </div>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Create Interview Round (Decided Manually by Company Recruiter; strictly 3 options) */}
      {interviewCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full p-6 shadow-2xl relative my-8 animate-in fade-in duration-200">
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🎯</span> Create Interview Round
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Decided manually by company recruiter for candidate{' '}
                  <span className="text-white font-semibold">{interviewCandidate.name}</span> ({interviewCandidate.email})
                </p>
              </div>
              <button 
                onClick={() => setInterviewCandidate(null)} 
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {modalErr && <Alert type="error">{modalErr}</Alert>}

            <div className="mb-4 bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-300">
              <div>
                <span className="text-zinc-500">Job:</span> <strong className="text-white">{selectedJob?.title}</strong>
              </div>
              <div>
                <span className="text-zinc-500">Rounds Created:</span>{' '}
                <strong className="text-red-400">{(interviewCandidate.interviewRounds || []).length} / 3</strong>
              </div>
            </div>

            <label className="label text-sm font-semibold mb-2">Select Interview Round (Available in 3 Rounds only):</label>
            
            <div className="space-y-3 mb-5">
              {/* Option 1: Aptitude (50 question) */}
              {(() => {
                const alreadyAdded = (interviewCandidate.interviewRounds || []).some(r => r.roundType === 'aptitude');
                return (
                  <label 
                    className={`block p-3.5 rounded-lg border transition-all cursor-pointer ${
                      alreadyAdded 
                        ? 'opacity-40 border-zinc-800 bg-zinc-950 cursor-not-allowed' 
                        : selectedRoundType === 'aptitude' 
                        ? 'border-red-500 bg-red-950/20 shadow-md shadow-red-950/30' 
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input 
                        type="radio" 
                        name="roundType" 
                        value="aptitude" 
                        disabled={alreadyAdded}
                        checked={selectedRoundType === 'aptitude'} 
                        onChange={() => setSelectedRoundType('aptitude')} 
                        className="mt-1 text-red-600 focus:ring-red-500" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-white">1. Aptitude (50 question)</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">50 Questions</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          Comprehensive 50-question MCQ test covering Quantitative Aptitude, Logical Reasoning, and Verbal Problem Solving.
                        </p>
                        {alreadyAdded && <span className="text-[11px] text-amber-400 font-medium block mt-1">⚠️ Already scheduled for this student</span>}
                      </div>
                    </div>
                  </label>
                );
              })()}

              {/* Option 2: Technical Quizzes (30 questions) */}
              {(() => {
                const alreadyAdded = (interviewCandidate.interviewRounds || []).some(r => r.roundType === 'technical');
                return (
                  <label 
                    className={`block p-3.5 rounded-lg border transition-all cursor-pointer ${
                      alreadyAdded 
                        ? 'opacity-40 border-zinc-800 bg-zinc-950 cursor-not-allowed' 
                        : selectedRoundType === 'technical' 
                        ? 'border-red-500 bg-red-950/20 shadow-md shadow-red-950/30' 
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input 
                        type="radio" 
                        name="roundType" 
                        value="technical" 
                        disabled={alreadyAdded}
                        checked={selectedRoundType === 'technical'} 
                        onChange={() => setSelectedRoundType('technical')} 
                        className="mt-1 text-red-600 focus:ring-red-500" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-white">2. Technical Quizzes (30 questions)</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">30 Questions</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          In-depth technical quiz evaluated on required skills: {selectedJob?.requiredSkills?.slice(0, 5).join(', ') || 'Computer Science Concepts'}.
                        </p>
                        {alreadyAdded && <span className="text-[11px] text-amber-400 font-medium block mt-1">⚠️ Already scheduled for this student</span>}
                      </div>
                    </div>
                  </label>
                );
              })()}

              {/* Option 3: One on One Interview (sent the email to applicant mail) */}
              {(() => {
                const alreadyAdded = (interviewCandidate.interviewRounds || []).some(r => r.roundType === 'one_on_one');
                return (
                  <label 
                    className={`block p-3.5 rounded-lg border transition-all cursor-pointer ${
                      alreadyAdded 
                        ? 'opacity-40 border-zinc-800 bg-zinc-950 cursor-not-allowed' 
                        : selectedRoundType === 'one_on_one' 
                        ? 'border-red-500 bg-red-950/20 shadow-md shadow-red-950/30' 
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input 
                        type="radio" 
                        name="roundType" 
                        value="one_on_one" 
                        disabled={alreadyAdded}
                        checked={selectedRoundType === 'one_on_one'} 
                        onChange={() => setSelectedRoundType('one_on_one')} 
                        className="mt-1 text-red-600 focus:ring-red-500" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-white">3. One on One Interview (sent the email to applicant mail)</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">Live 1-on-1 + Email</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          Personal technical or HR interview session. An official invitation with meeting credentials is dispatched directly to the applicant's email address.
                        </p>
                        {alreadyAdded && <span className="text-[11px] text-amber-400 font-medium block mt-1">⚠️ Already scheduled for this student</span>}
                      </div>
                    </div>
                  </label>
                );
              })()}
            </div>

            {/* Additional Input Form for One-on-One Interview */}
            {selectedRoundType === 'one_on_one' && (
              <div className="bg-zinc-950 p-4 rounded-lg border border-purple-900/50 mb-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <span>✉️</span> One-on-One Interview & Email Dispatch Configuration
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Interview Date</label>
                    <input 
                      type="date" 
                      className="input text-xs" 
                      value={oneOnOneForm.meetingDate} 
                      onChange={e => setOneOnOneForm({ ...oneOnOneForm, meetingDate: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Time (with Timezone)</label>
                    <input 
                      type="text" 
                      className="input text-xs" 
                      placeholder="e.g. 11:30 AM IST" 
                      value={oneOnOneForm.meetingTime} 
                      onChange={e => setOneOnOneForm({ ...oneOnOneForm, meetingTime: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-xs">Meeting Link or Location</label>
                  <input 
                    type="text" 
                    className="input text-xs" 
                    placeholder="https://meet.google.com/xyz-abcd-efg" 
                    value={oneOnOneForm.meetingLink} 
                    onChange={e => setOneOnOneForm({ ...oneOnOneForm, meetingLink: e.target.value })} 
                    required 
                  />
                </div>

                <div>
                  <label className="label text-xs">Interviewer Name / Designation</label>
                  <input 
                    type="text" 
                    className="input text-xs" 
                    placeholder="e.g. Lead Architect, Zoho Corp" 
                    value={oneOnOneForm.interviewerName} 
                    onChange={e => setOneOnOneForm({ ...oneOnOneForm, interviewerName: e.target.value })} 
                  />
                </div>

                <div>
                  <label className="label text-xs">Special Instructions / Agenda</label>
                  <textarea 
                    className="input text-xs resize-none" 
                    rows={2} 
                    placeholder="Please ensure a quiet place and prepare to demonstrate project code." 
                    value={oneOnOneForm.instructions} 
                    onChange={e => setOneOnOneForm({ ...oneOnOneForm, instructions: e.target.value })} 
                  />
                </div>

                <div className="p-2.5 rounded bg-purple-950/40 border border-purple-800/60 text-xs text-purple-200 flex items-center gap-2">
                  <span>📬</span>
                  <span>
                    Recipient Email: <strong>{interviewCandidate.email}</strong> (Invitation details will be delivered automatically).
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button 
                type="button" 
                onClick={() => setInterviewCandidate(null)} 
                className="btn-ghost text-xs px-4"
                disabled={submittingRound}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleCreateRound} 
                className="btn-primary text-xs px-5 shadow-lg shadow-red-950/60"
                disabled={submittingRound}
              >
                {submittingRound ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Scheduling Round...
                  </span>
                ) : selectedRoundType === 'one_on_one' ? (
                  'Send Email & Schedule Interview'
                ) : (
                  `Assign ${selectedRoundType === 'aptitude' ? 'Aptitude (50Q)' : 'Technical (30Q)'} Round`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: View 1-on-1 Interview Schedule & Dispatched Email Confirmation */}
      {viewDetailsRound && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-purple-900/60 rounded-xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🤝</span> One-on-One Interview Scheduled
              </h3>
              <button 
                onClick={() => setViewDetailsRound(null)} 
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-zinc-300">
              <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                <div className="text-xs text-zinc-400">Candidate</div>
                <div className="font-semibold text-white">{viewDetailsRound.student.name}</div>
                <div className="text-xs text-zinc-400">{viewDetailsRound.student.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400">Date</div>
                  <div className="font-medium text-white">
                    {viewDetailsRound.round.oneOnOne?.meetingDate
                      ? new Date(viewDetailsRound.round.oneOnOne.meetingDate).toLocaleDateString()
                      : 'Scheduled'}
                  </div>
                </div>
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400">Time</div>
                  <div className="font-medium text-white">{viewDetailsRound.round.oneOnOne?.meetingTime || 'TBD'}</div>
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                <div className="text-xs text-zinc-400">Interviewer</div>
                <div className="font-medium text-white">{viewDetailsRound.round.oneOnOne?.interviewerName || 'Panel'}</div>
              </div>

              {viewDetailsRound.round.oneOnOne?.meetingLink && (
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400 mb-1">Meeting Link</div>
                  <a 
                    href={viewDetailsRound.round.oneOnOne.meetingLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-red-400 hover:text-red-300 underline font-mono text-xs break-all"
                  >
                    {viewDetailsRound.round.oneOnOne.meetingLink}
                  </a>
                </div>
              )}

              {viewDetailsRound.round.oneOnOne?.instructions && (
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400 mb-1">Instructions / Notes</div>
                  <p className="text-xs text-zinc-300">{viewDetailsRound.round.oneOnOne.instructions}</p>
                </div>
              )}

              <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex items-center gap-2">
                <span>✅</span>
                <span>
                  Official invitation email dispatched to <strong>{viewDetailsRound.round.oneOnOne?.emailSentTo || viewDetailsRound.student.email}</strong>.
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800 flex justify-end">
              <button 
                onClick={() => setViewDetailsRound(null)} 
                className="btn-primary text-xs px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Review Student Re-take Request & Automatic Termination Cause */}
      {reviewRetakeData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-amber-600/60 rounded-xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>⚠️</span> Assessment Proctoring & Re-take Review
              </h3>
              <button 
                onClick={() => setReviewRetakeData(null)} 
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {retakeModalErr && <Alert type="error">{retakeModalErr}</Alert>}

            <div className="space-y-3 text-sm text-zinc-300">
              <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                <div className="text-xs text-zinc-400">Candidate</div>
                <div className="font-semibold text-white">{reviewRetakeData.candidate.name}</div>
                <div className="text-xs text-zinc-400">{reviewRetakeData.candidate.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400">Assessment Round</div>
                  <div className="font-medium text-white">
                    {reviewRetakeData.round.roundLabel || reviewRetakeData.round.roundType}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {reviewRetakeData.round.roundType === 'aptitude' ? '50 Questions • 50 Mins' : '30 Questions • 30 Mins'}
                  </div>
                </div>
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400">Proctoring Status</div>
                  <div className="font-medium text-red-400 capitalize">
                    {reviewRetakeData.round.status}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Single-Entry Access
                  </div>
                </div>
              </div>

              {reviewRetakeData.round.terminationReason && (
                <div className="bg-red-950/30 p-3.5 rounded border border-red-900/60">
                  <div className="text-xs font-semibold text-red-300 mb-1 flex items-center gap-1.5">
                    <span>🛑</span> Automatic Termination Cause
                  </div>
                  <p className="text-xs text-red-200">
                    {reviewRetakeData.round.terminationReason}
                  </p>
                </div>
              )}

              {reviewRetakeData.round.retakeRequest?.requested ? (
                <div className="bg-amber-950/30 p-3.5 rounded border border-amber-900/60">
                  <div className="text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                    <span>📝</span> Student's Stated Reason for Re-take
                  </div>
                  <p className="text-xs text-amber-100 bg-zinc-950/80 p-2.5 rounded border border-zinc-800 italic">
                    "{reviewRetakeData.round.retakeRequest?.reason || 'No text provided'}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2">
                    <span>
                      Requested: {reviewRetakeData.round.retakeRequest?.requestedAt ? new Date(reviewRetakeData.round.retakeRequest.requestedAt).toLocaleString() : 'Recently'}
                    </span>
                    <span className="capitalize font-semibold text-amber-300">
                      Status: {reviewRetakeData.round.retakeRequest?.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-xs text-zinc-400">
                  <span>ℹ️ Student has not yet submitted a formal re-take request form, but you can still unlock and reset the test if closed mistakenly.</span>
                </div>
              )}

              <div className="p-2.5 rounded bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200">
                💡 <strong>Approving</strong> will generate a brand new randomized question and option arrangement, unlock single-entry access, and reset the timer ({reviewRetakeData.round.roundType === 'aptitude' ? '50 mins' : '30 mins'}) for the student.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800 flex justify-end gap-2.5">
              <button 
                onClick={() => setReviewRetakeData(null)} 
                className="btn-ghost text-xs px-3"
                disabled={processingRetake}
              >
                Close
              </button>
              {reviewRetakeData.round.retakeRequest?.status === 'pending' && (
                <button 
                  onClick={() => handleReviewRetake('reject')} 
                  className="btn text-xs px-3.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800"
                  disabled={processingRetake}
                >
                  Reject Request
                </button>
              )}
              <button 
                onClick={() => handleReviewRetake('approve')} 
                className="btn-primary text-xs px-4 shadow-lg shadow-emerald-950/60 bg-emerald-600 hover:bg-emerald-500 text-white"
                disabled={processingRetake}
              >
                {processingRetake ? 'Processing...' : 'Approve & Unlock Re-take'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Candidate Resume Display & Download */}
      {viewResumeStudentId && (
        <ResumeModal
          studentId={viewResumeStudentId}
          onClose={() => setViewResumeStudentId(null)}
        />
      )}

      {/* MODAL 5: Add / Edit Company Job Opening */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>💼</span> {editingJob ? 'Update Job Opening' : 'Post New Job Opening'}
              </h3>
              <button
                onClick={() => setShowJobModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {jobModalErr && <Alert type="error">{jobModalErr}</Alert>}

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div>
                <label className="label text-xs">Job Title *</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. Senior Java Backend Developer"
                  value={jobForm.title}
                  onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="label text-xs">Job Description</label>
                <textarea
                  className="input min-h-[70px] resize-y"
                  placeholder="Describe key responsibilities, role expectations, and tech stack details..."
                  value={jobForm.description}
                  onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Required Skills * (comma separated)</label>
                  <input
                    className="input"
                    required
                    placeholder="Java, Spring Boot, SQL, REST API, Git"
                    value={jobForm.requiredSkills}
                    onChange={e => setJobForm({ ...jobForm, requiredSkills: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs">Nice-To-Have Skills (comma separated)</label>
                  <input
                    className="input"
                    placeholder="Docker, Kubernetes, AWS, Microservices"
                    value={jobForm.niceToHave}
                    onChange={e => setJobForm({ ...jobForm, niceToHave: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label text-xs">Salary / Package</label>
                  <input
                    className="input"
                    placeholder="e.g. 8-12 LPA"
                    value={jobForm.salary}
                    onChange={e => setJobForm({ ...jobForm, salary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs">Minimum CGPA</label>
                  <input
                    className="input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={jobForm.minCGPA}
                    onChange={e => setJobForm({ ...jobForm, minCGPA: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs">Location</label>
                  <input
                    className="input"
                    placeholder="e.g. Chennai / Hybrid"
                    value={jobForm.location}
                    onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label text-xs">Allowed Branches (comma separated, empty = all)</label>
                  <input
                    className="input"
                    placeholder="IT, CSE, ECE"
                    value={jobForm.allowedBranches}
                    onChange={e => setJobForm({ ...jobForm, allowedBranches: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs">Application Deadline</label>
                  <input
                    className="input"
                    type="date"
                    value={jobForm.deadline}
                    onChange={e => setJobForm({ ...jobForm, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs">Drive Status</label>
                  <select
                    className="input"
                    value={jobForm.status}
                    onChange={e => setJobForm({ ...jobForm, status: e.target.value })}
                  >
                    <option value="open">Open (Accepting Applicants)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="btn bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={jobModalBusy}
                  className="btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/40"
                >
                  {jobModalBusy ? 'Saving...' : editingJob ? 'Update Job Opening' : 'Post Job Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
