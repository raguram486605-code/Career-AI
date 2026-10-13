import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, Spinner, statusColor } from '../../components/ui';

export default function Applications() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const [selectedOneOnOne, setSelectedOneOnOne] = useState(null);

  useEffect(() => {
    api.get('/student/applications')
      .then(r => setList(r.data.applications))
      .catch(e => setErr(errMsg(e)));
  }, []);

  if (!list) return <><Alert>{err}</Alert><Spinner /></>;

  return (
    <>
      <PageTitle 
        title="My Applications & Interview Rounds" 
        sub="Track your company job applications, interview status, and take assigned recruitment tests." 
      />
      <Alert>{err}</Alert>

      <div className="card overflow-x-auto bg-zinc-900 border-zinc-800">
        {!list.length ? (
          <p className="text-sm text-zinc-400 py-6 text-center">You haven't applied to any job yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Company</th>
                <th className="th">Job Position</th>
                <th className="th">Match</th>
                <th className="th">Status</th>
                <th className="th">Assigned Interview Rounds (Max 3)</th>
              </tr>
            </thead>
            <tbody>
              {list.map(a => {
                const rounds = a.interviewRounds || [];

                return (
                  <tr key={a._id} className="hover:bg-zinc-800/40 border-t border-zinc-800/60 transition-colors">
                    <td className="td font-medium text-white">
                      <div>{a.jobId?.companyId?.name}</div>
                      <div className="text-xs text-zinc-400">{a.jobId?.companyId?.location}</div>
                    </td>
                    <td className="td text-zinc-200">
                      <div className="font-semibold">{a.jobId?.title}</div>
                      <div className="text-xs text-zinc-400">{a.jobId?.salary || a.jobId?.companyId?.package || 'Competitive'}</div>
                    </td>
                    <td className="td font-bold text-red-400">{a.matchScore}%</td>
                    <td className="td">
                      <Chip color={statusColor(a.status)}>{a.status}</Chip>
                    </td>
                    <td className="td">
                      {rounds.length === 0 ? (
                        <span className="text-xs text-zinc-500 italic">No interview rounds scheduled yet</span>
                      ) : (
                        <div className="flex flex-col gap-2 items-start">
                          {rounds.map((rnd, rIdx) => {
                            const isApt = rnd.roundType === 'aptitude';
                            const isTech = rnd.roundType === 'technical';
                            const is1on1 = rnd.roundType === 'one_on_one';
                            const sid = rnd.sessionId?._id || rnd.sessionId;

                            return (
                              <div key={rIdx} className="flex flex-wrap items-center gap-2">
                                {isApt && (
                                  rnd.status === 'completed' || rnd.score != null ? (
                                    <span className="px-2.5 py-1 rounded text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-medium inline-flex items-center gap-1.5">
                                      <span>✅</span> Aptitude (50Q): {rnd.score}% Completed
                                    </span>
                                  ) : rnd.status === 'terminated' ? (
                                    rnd.retakeRequest?.status === 'approved' ? (
                                      <Link
                                        to={`/interview?session=${sid}`}
                                        className="px-2.5 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors"
                                      >
                                        <span>✓</span> Re-take Approved: Start Aptitude (50 Mins)
                                      </Link>
                                    ) : rnd.retakeRequest?.requested && rnd.retakeRequest?.status === 'pending' ? (
                                      <span className="px-2.5 py-1 rounded text-xs bg-amber-950 text-amber-300 border border-amber-800 font-medium inline-flex items-center gap-1.5">
                                        <span>⏳</span> Aptitude: Re-take Requested (Pending Recruiter Review)
                                      </span>
                                    ) : (
                                      <Link
                                        to={`/interview?session=${sid}`}
                                        className="px-2.5 py-1 rounded text-xs bg-red-950 text-red-300 border border-red-800 hover:bg-red-900 font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors"
                                      >
                                        <span>🚫</span> Aptitude Closed (Request Re-take)
                                      </Link>
                                    )
                                  ) : (
                                    <Link
                                      to={`/interview?session=${sid}`}
                                      className="px-2.5 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors"
                                    >
                                      <span>📝</span> Start Aptitude (50 Mins, 50 Qs - Single Entry)
                                    </Link>
                                  )
                                )}

                                {isTech && (
                                  rnd.status === 'completed' || rnd.score != null ? (
                                    <span className="px-2.5 py-1 rounded text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-medium inline-flex items-center gap-1.5">
                                      <span>✅</span> Technical Quiz (30Q): {rnd.score}% Completed
                                    </span>
                                  ) : rnd.status === 'terminated' ? (
                                    rnd.retakeRequest?.status === 'approved' ? (
                                      <Link
                                        to={`/interview?session=${sid}`}
                                        className="px-2.5 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors"
                                      >
                                        <span>✓</span> Re-take Approved: Start Technical (30 Mins)
                                      </Link>
                                    ) : rnd.retakeRequest?.requested && rnd.retakeRequest?.status === 'pending' ? (
                                      <span className="px-2.5 py-1 rounded text-xs bg-amber-950 text-amber-300 border border-amber-800 font-medium inline-flex items-center gap-1.5">
                                        <span>⏳</span> Technical: Re-take Requested (Pending Recruiter Review)
                                      </span>
                                    ) : (
                                      <Link
                                        to={`/interview?session=${sid}`}
                                        className="px-2.5 py-1 rounded text-xs bg-red-950 text-red-300 border border-red-800 hover:bg-red-900 font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors"
                                      >
                                        <span>🚫</span> Technical Closed (Request Re-take)
                                      </Link>
                                    )
                                  ) : (
                                    <Link
                                      to={`/interview?session=${sid}`}
                                      className="px-2.5 py-1 rounded text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors"
                                    >
                                      <span>💻</span> Start Technical Quiz (30 Mins, 30 Qs - Single Entry)
                                    </Link>
                                  )
                                )}

                                {is1on1 && (
                                  <button
                                    onClick={() => setSelectedOneOnOne({ round: rnd, app: a })}
                                    className="px-2.5 py-1 rounded text-xs bg-zinc-800 hover:bg-zinc-700 text-purple-200 border border-purple-800/60 font-medium inline-flex items-center gap-1.5 transition-colors"
                                  >
                                    <span>🤝</span> View 1-on-1 Interview & Invitation
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: One on One Interview Invitation & Access Details for Student */}
      {selectedOneOnOne && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-purple-900/60 rounded-xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🤝</span> One-on-One Interview Invitation
              </h3>
              <button 
                onClick={() => setSelectedOneOnOne(null)} 
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-zinc-300">
              <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                <div className="text-xs text-zinc-400">Position & Company</div>
                <div className="font-semibold text-white text-base">{selectedOneOnOne.app.jobId?.title}</div>
                <div className="text-xs text-red-400">{selectedOneOnOne.app.jobId?.companyId?.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400">Scheduled Date</div>
                  <div className="font-medium text-white">
                    {selectedOneOnOne.round.oneOnOne?.meetingDate
                      ? new Date(selectedOneOnOne.round.oneOnOne.meetingDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'Scheduled'}
                  </div>
                </div>
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400">Time</div>
                  <div className="font-medium text-white">{selectedOneOnOne.round.oneOnOne?.meetingTime || 'As scheduled'}</div>
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                <div className="text-xs text-zinc-400">Interviewer</div>
                <div className="font-medium text-white">{selectedOneOnOne.round.oneOnOne?.interviewerName || 'Panel Interviewer'}</div>
              </div>

              {selectedOneOnOne.round.oneOnOne?.meetingLink && (
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400 mb-1">Meeting Link</div>
                  <a 
                    href={selectedOneOnOne.round.oneOnOne.meetingLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-primary text-xs !py-1.5 !px-3 inline-block"
                  >
                    Join Video Call
                  </a>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1 break-all">
                    {selectedOneOnOne.round.oneOnOne.meetingLink}
                  </div>
                </div>
              )}

              {selectedOneOnOne.round.oneOnOne?.instructions && (
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                  <div className="text-xs text-zinc-400 mb-1">Recruiter Instructions</div>
                  <p className="text-xs text-zinc-300">{selectedOneOnOne.round.oneOnOne.instructions}</p>
                </div>
              )}

              <div className="p-3 rounded bg-purple-950/40 border border-purple-800/60 text-xs text-purple-200 flex items-center gap-2">
                <span>📧</span>
                <span>
                  Official invitation notice delivered to your email: <strong>{selectedOneOnOne.round.oneOnOne?.emailSentTo}</strong>
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-800 flex justify-end">
              <button 
                onClick={() => setSelectedOneOnOne(null)} 
                className="btn-primary text-xs px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
