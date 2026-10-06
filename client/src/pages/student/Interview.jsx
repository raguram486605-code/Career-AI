import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, Spinner } from '../../components/ui';

export default function Interview() {
  const [type, setType] = useState('technical');
  const [count, setCount] = useState(5);
  const [session, setSession] = useState(null);
  const [idx, setIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [result, setResult] = useState({});
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const loadHistory = () => api.get('/interviews').then(r => setHistory(r.data.sessions)).catch(() => {});

  const startNewSession = async (selectedType = type, selectedCount = count) => {
    setBusy(true);
    setErr('');
    setSession(null);
    setResult({});
    setIdx(0);
    setSelectedOpt(null);
    try {
      const { data } = await api.post('/interviews', { type: selectedType, count: Number(selectedCount) });
      setSession(data.session);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  // Every time the user opens/mounts this tab, a fresh randomized set of questions is automatically loaded!
  useEffect(() => {
    loadHistory();
    startNewSession('technical', 5);
  }, []);

  const handleTypeChange = (newType) => {
    setType(newType);
    startNewSession(newType, count);
  };

  const submitChoice = async () => {
    if (selectedOpt === null) return;
    const q = session.questions[idx];
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.post(`/interviews/${session._id}/answer`, {
        questionId: q.id,
        selectedOption: selectedOpt
      });
      setResult(r => ({ ...r, [q.id]: data }));
      if (data.completed) loadHistory();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const goNext = () => {
    setIdx(i => i + 1);
    setSelectedOpt(null);
  };

  const q = session?.questions[idx];
  const res = q && result[q.id];
  const finished = session && Object.keys(result).length === session.questions.length;

  const totalCorrect = Object.values(result).filter(r => r.evaluation?.isCorrect || r.question?.isCorrect).length;
  const totalQuestions = session?.questions?.length || 0;
  const scorePercentage = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <>
      <PageTitle
        title="AI interview preparation"
        sub="Choice-filling practice: Test your technical & HR knowledge with randomized questions and instant mark reviews."
      />
      <Alert>{err}</Alert>

      {/* Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 card mb-6 bg-slate-50 border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Practice Type:</span>
          <button
            onClick={() => handleTypeChange('technical')}
            className={type === 'technical' ? 'btn-primary text-xs py-1.5 px-3' : 'btn-ghost text-xs py-1.5 px-3'}
            disabled={busy}
          >
            Technical MCQs
          </button>
          <button
            onClick={() => handleTypeChange('hr')}
            className={type === 'hr' ? 'btn-primary text-xs py-1.5 px-3' : 'btn-ghost text-xs py-1.5 px-3'}
            disabled={busy}
          >
            HR & Behavioral MCQs
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Questions:</label>
          <select
            className="input text-xs py-1 px-2 w-20"
            value={count}
            onChange={e => {
              setCount(e.target.value);
              startNewSession(type, e.target.value);
            }}
            disabled={busy}
          >
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="8">8</option>
            <option value="10">10</option>
          </select>
          <button
            onClick={() => startNewSession(type, count)}
            className="btn-ghost text-xs py-1.5 px-3 text-brand-600 border border-brand-200 hover:bg-brand-50"
            disabled={busy}
          >
            🔄 New Random Questions
          </button>
        </div>
      </div>

      {busy && !session && (
        <div className="card p-8 text-center">
          <Spinner />
          <p className="text-sm text-slate-500 mt-2">Generating randomized choice-filling questions...</p>
        </div>
      )}

      {/* Choice Filling Question Card */}
      {session && !finished && q && (
        <div className="card max-w-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-sm text-slate-500 mb-3 pb-2 border-b border-slate-100">
            <span className="font-medium">Question {idx + 1} of {session.questions.length}</span>
            <Chip color="blue">{q.category}</Chip>
          </div>

          <h2 className="text-lg font-semibold text-slate-900 mb-5 leading-relaxed">{q.question}</h2>

          {/* 4 Choice Filling Options */}
          <div className="space-y-3 mb-6">
            {q.options && q.options.map((optText, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = selectedOpt === optIdx;

              // Check if evaluation result is available for styling
              let optStyle = 'border-slate-200 hover:border-brand-400 hover:bg-slate-50';
              let badge = null;

              if (res) {
                const evalData = res.evaluation;
                const correctIdx = evalData.correctOption;
                const userIdx = evalData.selectedOption;

                if (optIdx === correctIdx) {
                  optStyle = 'border-green-500 bg-green-50 text-green-900 font-medium';
                  badge = <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-200 text-green-800">Correct Option ✓</span>;
                } else if (optIdx === userIdx && userIdx !== correctIdx) {
                  optStyle = 'border-red-400 bg-red-50 text-red-900';
                  badge = <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-200 text-red-800">Your Choice ✗</span>;
                } else {
                  optStyle = 'border-slate-100 opacity-60 bg-slate-50';
                }
              } else if (isSelected) {
                optStyle = 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20';
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => !res && setSelectedOpt(optIdx)}
                  disabled={!!res || busy}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${optStyle}`}
                >
                  <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                    isSelected && !res ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {letter}
                  </span>
                  <span className="text-sm pt-0.5 flex-1">{optText}</span>
                  {badge}
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          {!res ? (
            <button
              className="btn-primary w-full py-3"
              onClick={submitChoice}
              disabled={busy || selectedOpt === null}
            >
              {busy ? 'Validating...' : 'Submit & Validate Answer'}
            </button>
          ) : (
            /* Mark Validation & Review Section */
            <div className="mt-6 pt-5 border-t border-slate-200 space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                res.evaluation.isCorrect ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{res.evaluation.isCorrect ? '✅' : '❌'}</span>
                  <div>
                    <h4 className="font-bold text-sm">
                      {res.evaluation.isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
                    </h4>
                    <p className="text-xs mt-0.5 opacity-90">{res.evaluation.feedback}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider block opacity-75">Mark</span>
                  <span className="text-lg font-extrabold">
                    {res.evaluation.isCorrect ? '+10 / 10' : '0 / 10'}
                  </span>
                </div>
              </div>

              {/* Detailed Review & Explanation */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800">
                <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  💡 Review & Explanation:
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {res.evaluation.explanation}
                </p>
              </div>

              {idx < session.questions.length - 1 ? (
                <button className="btn-primary w-full py-3 mt-2" onClick={goNext}>
                  Next Question →
                </button>
              ) : (
                <button className="btn-primary w-full py-3 mt-2 bg-green-600 hover:bg-green-700" onClick={goNext}>
                  View Final Scorecard & Full Review 🎉
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Final Scorecard & Detailed Review */}
      {finished && (
        <div className="space-y-6 max-w-3xl">
          <div className="card text-center p-8 border border-slate-200 shadow-sm">
            <span className="text-4xl mb-2 block">🎯</span>
            <h2 className="text-2xl font-bold text-slate-900">Quiz Completed!</h2>
            <p className="text-sm text-slate-500 mt-1">Here is your mark breakdown and performance review.</p>

            <div className="my-6 inline-flex items-baseline gap-2 bg-brand-50 border border-brand-200 px-6 py-3 rounded-2xl">
              <span className="text-4xl font-extrabold text-brand-600">{totalCorrect} / {totalQuestions}</span>
              <span className="text-sm font-semibold text-brand-700">({scorePercentage}% Correct)</span>
            </div>

            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              {scorePercentage >= 80
                ? '🌟 Excellent performance! You have a solid grasp of these core concepts.'
                : scorePercentage >= 50
                ? '👍 Good effort! Review the detailed explanations below to strengthen weak spots.'
                : '📖 Needs review. Read through the explanations below and try another practice quiz.'}
            </p>

            <button
              className="btn-primary px-6 py-3"
              onClick={() => startNewSession(type, count)}
            >
              🔄 Start Another Randomized Practice Quiz
            </button>
          </div>

          {/* Full Review List */}
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Detailed Question & Answer Review
            </h3>
            <div className="space-y-4">
              {session.questions.map((qItem, qIdx) => {
                const evalData = result[qItem.id]?.evaluation;
                const isOk = evalData?.isCorrect;
                return (
                  <div key={qItem.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-sm">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium text-slate-900">
                        {qIdx + 1}. {qItem.question}
                      </span>
                      <Chip color={isOk ? 'green' : 'red'}>
                        {isOk ? 'Correct (+10)' : 'Incorrect (0)'}
                      </Chip>
                    </div>
                    {evalData && (
                      <>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-700">Your Choice:</strong> ({String.fromCharCode(65 + evalData.selectedOption)}) {evalData.userOptionText}
                        </p>
                        {!isOk && (
                          <p className="text-xs text-green-700">
                            <strong>Correct Choice:</strong> ({String.fromCharCode(65 + evalData.correctOption)}) {evalData.correctAnswer}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100 mt-2">
                          💡 {evalData.explanation}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Past Sessions Table */}
      {!session && !busy && (
        <div className="card mt-6">
          <h2 className="font-semibold mb-3">Past practice sessions</h2>
          {!history.length ? (
            <p className="text-sm text-slate-500">No past practice sessions recorded yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Date</th>
                  <th className="th">Type</th>
                  <th className="th">Questions</th>
                  <th className="th">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h._id}>
                    <td className="td">{new Date(h.createdAt).toLocaleString()}</td>
                    <td className="td capitalize">{h.type}</td>
                    <td className="td">{h.questions.length}</td>
                    <td className="td font-medium">{h.completed ? `${h.averageScore} / 10` : 'Incomplete'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}
