import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, Spinner } from '../../components/ui';

export default function Interview() {
  const [sp] = useSearchParams();
  const sessionIdParam = sp.get('session');

  const [type, setType] = useState('technical');
  const [count, setCount] = useState(5);
  const [session, setSession] = useState(null);
  const [idx, setIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [result, setResult] = useState({});
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // Anti-cheat & Proctoring State
  const [testStarted, setTestStarted] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [retakeReason, setRetakeReason] = useState('');
  const [retakeSubmitting, setRetakeSubmitting] = useState(false);
  const [retakeMsg, setRetakeMsg] = useState('');

  // Countdown Timer State
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);
  const timerRef = useRef(null);

  const isCompanyAssigned = Boolean(session?.roundLabel || session?.applicationId || sessionIdParam);

  const loadHistory = () => api.get('/interviews').then(r => setHistory(r.data.sessions)).catch(() => {});

  const loadSpecificSession = async (sId) => {
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.get(`/interviews/${sId}`);
      const sess = data.session;
      setSession(sess);

      // Check if session was already terminated or locked
      if (sess.attemptStatus === 'terminated') {
        setIsTerminated(true);
        setTerminationReason(sess.terminationReason || 'Test closed due to tab switch or navigation');
      } else if (sess.attemptStatus === 'in_progress') {
        // Resume in-progress session if within time
        setTestStarted(true);
        initTimer(sess);
      }

      // Populate already answered questions
      const initRes = {};
      sess.questions.forEach(q => {
        if (q.score != null) {
          initRes[q.id] = {
            evaluation: {
              isCorrect: q.isCorrect,
              correctOption: q.correctOption,
              selectedOption: q.selectedOption,
              userOptionText: q.userOptionText,
              explanation: q.explanation,
              feedback: q.feedback,
            },
            question: q,
          };
        }
      });
      setResult(initRes);
      const firstUnanswered = sess.questions.findIndex(q => q.score == null);
      setIdx(firstUnanswered >= 0 ? firstUnanswered : 0);
      setSelectedOpt(null);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const startNewPracticeSession = async (selectedType = type, selectedCount = count) => {
    setBusy(true);
    setErr('');
    setSession(null);
    setResult({});
    setIdx(0);
    setSelectedOpt(null);
    setIsTerminated(false);
    setTestStarted(true); // Practice sessions enter directly
    try {
      const { data } = await api.post('/interviews', { type: selectedType, count: Number(selectedCount) });
      setSession(data.session);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadHistory();
    if (sessionIdParam) {
      loadSpecificSession(sessionIdParam);
    } else {
      startNewPracticeSession('technical', 5);
    }
  }, [sessionIdParam]);

  // Setup countdown timer based on startedAt and time limit
  const initTimer = (sess) => {
    const limitMins = sess.timeLimitMinutes || (sess.type === 'aptitude' ? 50 : 30);
    const totalSeconds = limitMins * 60;

    let remaining = totalSeconds;
    if (sess.startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(sess.startedAt).getTime()) / 1000);
      remaining = Math.max(0, totalSeconds - elapsed);
    }
    setTimeLeftSeconds(remaining);
  };

  // Timer Tick
  useEffect(() => {
    if (!testStarted || isTerminated || timeLeftSeconds === null) return;

    if (timeLeftSeconds <= 0) {
      // Time expired! Auto submit and finish
      handleTimeExpired();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [testStarted, isTerminated, timeLeftSeconds]);

  const handleTimeExpired = async () => {
    if (session && !isTerminated) {
      await autoCloseTest('Test duration expired (Time limit reached)');
    }
  };

  // Anti-Cheat & Auto-Close Proctoring Logic
  useEffect(() => {
    if (!testStarted || isTerminated || !session || !isCompanyAssigned) return;

    // 1. Tab switch or window minimized detection
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        autoCloseTest('Tab switch / backgrounding detected. Accessing other tabs or windows is prohibited.');
      }
    };

    // 2. Window focus loss detection (e.g., clicking on another app, AI app, or opening new tab)
    const handleWindowBlur = () => {
      autoCloseTest('Browser focus lost. Opening new tabs, AI applications, or external software is prohibited.');
    };

    // 3. Browser Back Button / History navigation interception
    window.history.pushState(null, '', window.location.href);
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      autoCloseTest('Browser back button was clicked. Navigating back during the test is strictly prohibited.');
    };

    // 4. Before Unload (tab close or reload)
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Leaving the assessment will immediately close and lock your test.';
      autoCloseTest('Page reload or window close attempted.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [testStarted, isTerminated, session, isCompanyAssigned]);

  // Trigger automatic test termination
  const autoCloseTest = async (reason) => {
    if (isTerminated || !session) return;
    setIsTerminated(true);
    setTerminationReason(reason);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await api.post(`/interviews/${session._id}/terminate`, { reason });
    } catch (e) {
      console.error('Failed to report termination:', e.message);
    }
  };

  // Student clicks "I Understand & Start Assessment"
  const handleBeginAssessment = async () => {
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.post(`/interviews/${session._id}/start-test`);
      setSession(data.session);
      setTestStarted(true);
      initTimer(data.session);

      // Attempt Fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {
      const resp = e.response?.data;
      if (resp?.locked) {
        setIsTerminated(true);
        setTerminationReason(resp.terminationReason || 'This assessment is restricted to a single entry and has already been accessed.');
      } else {
        setErr(errMsg(e));
      }
    } finally {
      setBusy(false);
    }
  };

  // Submit Re-take Request with Proper Reason
  const handleSubmitRetake = async (e) => {
    e.preventDefault();
    if (!retakeReason || retakeReason.trim().length < 15) {
      setRetakeMsg('Please provide a detailed, proper reason explaining why the test was closed prematurely (minimum 15 characters).');
      return;
    }

    setRetakeSubmitting(true);
    setRetakeMsg('');
    try {
      const { data } = await api.post(`/interviews/${session._id}/retake-request`, {
        reason: retakeReason.trim(),
      });
      setRetakeMsg('✓ ' + data.message);
      // Update session local state
      setSession(prev => ({ ...prev, retakeRequest: data.retakeRequest }));
    } catch (e) {
      setRetakeMsg(errMsg(e));
    } finally {
      setRetakeSubmitting(false);
    }
  };

  const submitChoice = async () => {
    if (selectedOpt === null || isTerminated) return;
    const currentQ = session.questions[idx];
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.post(`/interviews/${session._id}/answer`, {
        questionId: currentQ.id,
        selectedOption: selectedOpt,
      });
      setResult(r => ({ ...r, [currentQ.id]: data }));
      if (data.completed) loadHistory();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const goNext = () => {
    if (idx < session.questions.length - 1) {
      setIdx(i => i + 1);
      setSelectedOpt(null);
    } else {
      setIdx(session.questions.length);
    }
  };

  const currentQ = session?.questions[idx];
  const currentRes = currentQ && result[currentQ.id];
  const finished = session && Object.keys(result).length === session.questions.length;

  const totalCorrect = Object.values(result).filter(r => r.evaluation?.isCorrect || r.question?.isCorrect).length;
  const totalQuestions = session?.questions?.length || 0;
  const scorePercentage = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Format timer
  const formatTime = (secs) => {
    if (secs == null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <>
      <PageTitle
        title="Proctored AI Assessment Portal"
        sub="Strict proctoring: Single entry only. No tab switches, navigation, or AI tool access permitted. Timer-enforced."
      />
      <Alert>{err}</Alert>

      {/* VIEW 1: TERMINATED / CLOSED TEST SCREEN (Anti-Cheat Violation or Accidental Close) */}
      {isTerminated ? (
        <div className="max-w-2xl mx-auto my-6 space-y-6 animate-in fade-in duration-300">
          <div className="card p-8 border-2 border-red-700 bg-zinc-900/95 text-center shadow-2xl shadow-red-950/40">
            <span className="text-5xl mb-3 block">🚫</span>
            <h2 className="text-2xl font-black text-white tracking-tight">Assessment Terminated & Locked</h2>
            <div className="p-3 my-4 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-sm">
              <strong>Termination Reason:</strong> {terminationReason || 'Anti-cheat policy triggered.'}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              In accordance with strict recruitment guidelines, candidate assessments are restricted to a single continuous entry.
              Switching tabs, navigating back, or losing window focus immediately triggers automated termination.
            </p>

            {/* Re-take Request Submission Form */}
            <div className="mt-6 pt-6 border-t border-zinc-800 text-left">
              <h3 className="font-bold text-white text-base flex items-center gap-2 mb-2">
                <span>✉️</span> Request Test Re-take from Company Recruiter
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                If the test was closed mistakenly due to a technical blip or accidental action, you may submit a formal request with a proper explanation.
                The company recruiter will review your reason and may approve a fresh attempt.
              </p>

              {session?.retakeRequest?.requested ? (
                <div className="p-4 rounded-xl border bg-zinc-950 border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Re-take Request Status:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      session.retakeRequest.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : session.retakeRequest.status === 'rejected'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                    }`}>
                      {session.retakeRequest.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                    <strong>Your Submitted Reason:</strong> {session.retakeRequest.reason}
                  </p>

                  {session.retakeRequest.status === 'approved' ? (
                    <div className="pt-2">
                      <p className="text-xs text-emerald-400 font-medium mb-3">
                        ✓ Recruiter has approved your re-take request! You may now begin your fresh attempt with randomized questions.
                      </p>
                      <button
                        onClick={() => {
                          setIsTerminated(false);
                          setTestStarted(false);
                          loadSpecificSession(session._id);
                        }}
                        className="btn-primary w-full py-2.5"
                      >
                        Start Approved Re-take Assessment →
                      </button>
                    </div>
                  ) : session.retakeRequest.status === 'rejected' ? (
                    <p className="text-xs text-red-400">
                      ✕ The recruiter has reviewed and rejected this re-take request. This assessment remains finalized.
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-400">
                      ⏳ Your request is awaiting recruiter review. Check back soon or visit My Applications.
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitRetake} className="space-y-3">
                  <div>
                    <label className="label text-xs font-semibold">Proper Reason / Justification (Min 15 chars):</label>
                    <textarea
                      className="input text-xs w-full resize-none bg-zinc-950 border-zinc-700"
                      rows={3}
                      placeholder="e.g. My browser window was accidentally minimized by an OS system update notification. I kindly request a re-take..."
                      value={retakeReason}
                      onChange={e => setRetakeReason(e.target.value)}
                      required
                    />
                  </div>

                  {retakeMsg && (
                    <div className={`p-2.5 rounded text-xs ${
                      retakeMsg.startsWith('✓') ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-red-950/60 text-red-300 border border-red-800'
                    }`}>
                      {retakeMsg}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={retakeSubmitting || retakeReason.trim().length < 15}
                      className="btn-primary text-xs py-2 px-4 shadow-md shadow-red-950/40"
                    >
                      {retakeSubmitting ? 'Submitting Request...' : 'Send Request to Company'}
                    </button>
                    <Link to="/applications" className="btn-ghost text-xs py-2 px-4">
                      Return to Applications
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : isCompanyAssigned && !testStarted && session ? (
        /* VIEW 2: PRE-ASSESSMENT PROCTORING & SECURITY AGREEMENT (Single Entry + Timers) */
        <div className="max-w-2xl mx-auto my-6 animate-in fade-in duration-300">
          <div className="card p-8 border border-zinc-800 bg-zinc-900 shadow-2xl shadow-red-950/20 space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-red-500 block mb-1">
                Official Company Recruitment Test
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                {session.roundLabel || (session.type === 'aptitude' ? 'Aptitude Test' : 'Technical Quiz')}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {session.questions.length} Questions • Time Limit:{' '}
                <strong className="text-white">
                  {session.timeLimitMinutes || (session.type === 'aptitude' ? 50 : 30)} Minutes
                </strong>
              </p>
            </div>

            <div className="space-y-3 bg-zinc-950 p-5 rounded-xl border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
              <h4 className="font-bold text-sm text-red-400 flex items-center gap-1.5">
                <span>🛡️</span> Mandatory Anti-Cheat & Examination Rules:
              </h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-white">Only One Entry Permitted:</strong> You can enter this assessment only once. Do NOT start unless you are ready.
                </li>
                <li>
                  <strong className="text-white">Fixed Countdown Timer:</strong>{' '}
                  {session.type === 'aptitude' ? 'Aptitude test timing is strictly 50 minutes.' : 'Technical test timing is strictly 30 minutes.'} The test auto-submits when time expires.
                </li>
                <li>
                  <strong className="text-white">Randomized Arrangement:</strong> Questions and choices are uniquely randomized for your session.
                </li>
                <li>
                  <strong className="text-red-400">Strict Prohibition on Tab / App Switching:</strong> Do NOT switch tabs, minimize your window, open AI tools (ChatGPT, Gemini, etc.), or click the browser back button.
                </li>
                <li>
                  <strong className="text-red-400">Automatic Closure:</strong> Any tab change or loss of focus will immediately terminate and lock your test!
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link to="/applications" className="btn-ghost text-xs">
                ← Cancel & Return
              </Link>
              <button
                onClick={handleBeginAssessment}
                disabled={busy}
                className="btn-primary text-xs !py-3 !px-6 font-bold shadow-lg shadow-red-950/60"
              >
                {busy ? 'Preparing Test...' : 'I Agree & Begin Assessment Now'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 3: LIVE ASSESSMENT INTERFACE WITH COUNTDOWN TIMER & PROCTORING */
        <>
          {/* Fixed Sticky Proctoring & Timer Header Bar */}
          {session && (
            <div className="sticky top-2 z-30 card mb-5 bg-zinc-950/95 border-red-900/60 p-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {session.roundLabel || `${session.type.toUpperCase()} Test`}
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                      🔒 Single Entry Mode Active
                    </span>
                  </h3>
                  <div className="text-[11px] text-zinc-400">
                    Question {idx + 1} of {session.questions.length} • Answered:{' '}
                    <strong className="text-emerald-400">{Object.keys(result).length}</strong>
                  </div>
                </div>
              </div>

              {/* Countdown Timer Display */}
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono text-base font-bold tracking-wider ${
                  timeLeftSeconds != null && timeLeftSeconds < 300
                    ? 'bg-red-950 text-red-200 border-red-600 animate-pulse'
                    : 'bg-zinc-900 text-white border-zinc-700'
                }`}>
                  <span className="text-base">⏱️</span>
                  <span>{formatTime(timeLeftSeconds)}</span>
                  <span className="text-[10px] font-sans text-zinc-400 uppercase">Remaining</span>
                </div>
              </div>
            </div>
          )}

          {/* Practice Controls (Only visible for generic practice sessions, not assigned company tests) */}
          {!sessionIdParam && !isCompanyAssigned && (
            <div className="flex flex-wrap items-center justify-between gap-4 card mb-6 bg-zinc-900 border border-zinc-800 p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Practice Type:</span>
                <button
                  onClick={() => startNewPracticeSession('technical', count)}
                  className={type === 'technical' ? 'btn-primary text-xs py-1.5 px-3' : 'btn-ghost text-xs py-1.5 px-3'}
                >
                  Technical MCQs (30 mins)
                </button>
                <button
                  onClick={() => startNewPracticeSession('aptitude', count)}
                  className={type === 'aptitude' ? 'btn-primary text-xs py-1.5 px-3' : 'btn-ghost text-xs py-1.5 px-3'}
                >
                  Aptitude MCQs (50 mins)
                </button>
                <button
                  onClick={() => startNewPracticeSession('hr', count)}
                  className={type === 'hr' ? 'btn-primary text-xs py-1.5 px-3' : 'btn-ghost text-xs py-1.5 px-3'}
                >
                  HR MCQs
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-zinc-400">Questions:</label>
                <select
                  className="input text-xs py-1 px-2 w-20 bg-zinc-950 border-zinc-700"
                  value={count}
                  onChange={e => {
                    setCount(e.target.value);
                    startNewPracticeSession(type, e.target.value);
                  }}
                >
                  <option value="5">5</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          )}

          {/* Question Card */}
          {session && !finished && currentQ && (
            <div className="card max-w-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
              {/* Question Navigator Palette for Quick Jump */}
              {session.questions.length > 5 && (
                <div className="mb-4 pb-3 border-b border-zinc-800">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Question Palette:</span>
                    <span>{Object.keys(result).length} of {session.questions.length} answered</span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                    {session.questions.map((qItem, qIdx) => {
                      const isAnswered = result[qItem.id] != null;
                      const isCurrent = idx === qIdx;

                      return (
                        <button
                          key={qItem.id}
                          onClick={() => {
                            setIdx(qIdx);
                            setSelectedOpt(result[qItem.id]?.evaluation?.selectedOption ?? null);
                          }}
                          className={`w-7 h-7 rounded text-xs font-semibold shrink-0 transition-colors ${
                            isCurrent
                              ? 'bg-red-600 text-white ring-2 ring-red-400 font-bold'
                              : isAnswered
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                          }`}
                        >
                          {qIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-zinc-400 mb-3 pb-2 border-b border-zinc-800">
                <span className="font-semibold text-white">
                  Question {idx + 1} of {session.questions.length}
                </span>
                <Chip color="red">{currentQ.category}</Chip>
              </div>

              <h2 className="text-lg font-semibold text-white mb-5 leading-relaxed">{currentQ.question}</h2>

              {/* 4 Choices (Randomized Arrangement) */}
              <div className="space-y-3 mb-6">
                {currentQ.options && currentQ.options.map((optText, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = selectedOpt === optIdx;

                  let optStyle = 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 text-zinc-200';
                  let badge = null;

                  if (currentRes) {
                    const evalData = currentRes.evaluation;
                    const correctIdx = evalData.correctOption;
                    const userIdx = evalData.selectedOption;

                    if (optIdx === correctIdx) {
                      optStyle = 'border-emerald-600 bg-emerald-950/30 text-emerald-200 font-medium';
                      badge = <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-900 text-emerald-200">Correct Option ✓</span>;
                    } else if (optIdx === userIdx && userIdx !== correctIdx) {
                      optStyle = 'border-red-600 bg-red-950/30 text-red-200';
                      badge = <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-900 text-red-200">Your Choice ✗</span>;
                    } else {
                      optStyle = 'border-zinc-800/60 opacity-40 bg-zinc-950 text-zinc-500';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-red-500 bg-red-950/20 text-white ring-2 ring-red-500/20';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => !currentRes && setSelectedOpt(optIdx)}
                      disabled={!!currentRes || busy}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${optStyle}`}
                    >
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected && !currentRes ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {letter}
                      </span>
                      <span className="text-sm pt-0.5 flex-1">{optText}</span>
                      {badge}
                    </button>
                  );
                })}
              </div>

              {/* Submit / Navigation Controls */}
              {!currentRes ? (
                <button
                  className="btn-primary w-full py-3 shadow-lg shadow-red-950/40"
                  onClick={submitChoice}
                  disabled={busy || selectedOpt === null}
                >
                  {busy ? 'Recording Answer...' : 'Submit & Check Answer'}
                </button>
              ) : (
                <div className="mt-6 pt-5 border-t border-zinc-800 space-y-4">
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    currentRes.evaluation.isCorrect ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-red-950/40 border-red-800 text-red-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{currentRes.evaluation.isCorrect ? '✅' : '❌'}</span>
                      <div>
                        <h4 className="font-bold text-sm">
                          {currentRes.evaluation.isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
                        </h4>
                        <p className="text-xs mt-0.5 opacity-90">{currentRes.evaluation.feedback}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold uppercase tracking-wider block opacity-75">Mark</span>
                      <span className="text-lg font-extrabold">
                        {currentRes.evaluation.isCorrect ? '+10 / 10' : '0 / 10'}
                      </span>
                    </div>
                  </div>

                  {/* Explanation Box */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300">
                    <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                      💡 Explanation & Concept:
                    </h4>
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                      {currentRes.evaluation.explanation}
                    </p>
                  </div>

                  {idx < session.questions.length - 1 ? (
                    <button className="btn-primary w-full py-3 mt-2 shadow-lg shadow-red-950/40" onClick={goNext}>
                      Next Question →
                    </button>
                  ) : (
                    <button className="btn-primary w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/40" onClick={goNext}>
                      View Final Scorecard & Complete Review 🎉
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Final Scorecard Screen */}
          {finished && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-300">
              <div className="card text-center p-8 border border-zinc-800 bg-zinc-900 shadow-xl">
                <span className="text-4xl mb-2 block">🎯</span>
                <h2 className="text-2xl font-bold text-white">Assessment Completed!</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Your answers have been finalized and recorded.
                </p>

                <div className="my-6 inline-flex items-baseline gap-2 bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-2xl">
                  <span className="text-4xl font-extrabold text-red-500">{totalCorrect} / {totalQuestions}</span>
                  <span className="text-sm font-semibold text-zinc-300">({scorePercentage}% Score)</span>
                </div>

                {session?.applicationId && (
                  <div className="p-3 mb-6 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-200 max-w-md mx-auto">
                    ✓ Assessment results have been officially synced to the hiring company recruiter.
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  <Link to="/applications" className="btn-primary px-6 py-2.5">
                    Back to My Applications
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
