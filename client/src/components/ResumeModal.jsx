import { useEffect, useState } from 'react';
import api, { errMsg } from '../api/client';
import { Alert, Chip, ScoreGauge, Spinner } from './ui';

export default function ResumeModal({ studentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    setErr('');
    api.get(`/resumes/${studentId}`)
      .then(res => setData(res.data))
      .catch(e => setErr(errMsg(e)))
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleDownload = async () => {
    if (!studentId || !data) return;
    setDownloading(true);
    try {
      const res = await api.get(`/resumes/${studentId}/download`, { responseType: 'blob' });
      const filename = data.resume?.fileName || `${(data.student?.name || 'Student').replace(/\s+/g, '_')}_Resume.txt`;
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download resume: ' + errMsg(e));
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = () => {
    if (!data?.resume?.text) return;
    navigator.clipboard.writeText(data.resume.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-4xl w-full shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Top Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-red-950/40">
              📄
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>{data?.student?.name || 'Candidate Resume'}</span>
                {data?.profile?.cgpa && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                    CGPA {data.profile.cgpa}
                  </span>
                )}
              </h2>
              <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                <span>📧 {data?.student?.email || 'N/A'}</span>
                <span>📞 {data?.profile?.phone || 'N/A'}</span>
                <span>🎓 {data?.profile?.branch || 'IT'} ({data?.profile?.graduationYear || '2026'})</span>
                <span>🆔 Roll: {data?.profile?.rollNo || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleDownload}
              disabled={downloading || loading || !data}
              className="btn bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-md shadow-emerald-950/40 inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Download Resume Document"
            >
              <span>{downloading ? '⏳' : '⬇️'}</span>
              <span>{downloading ? 'Downloading...' : 'Download Resume'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 text-lg leading-none transition-colors cursor-pointer"
              title="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {err && <Alert type="error">{err}</Alert>}
          {loading && <Spinner text="Loading candidate resume..." />}

          {data && (
            <>
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                  <ScoreGauge score={data.resume?.quality?.score || 85} size={54} />
                  <div>
                    <div className="text-xs text-zinc-400">Resume Quality</div>
                    <div className="text-sm font-bold text-white">
                      {data.resume?.quality?.score ? `${data.resume.quality.score} / 100` : 'Evaluated'}
                    </div>
                    <div className="text-[10px] text-zinc-500">AI Checklist Score</div>
                  </div>
                </div>

                <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl">
                  <div className="text-xs text-zinc-400">File Details</div>
                  <div className="text-sm font-semibold text-white truncate" title={data.resume?.fileName}>
                    📎 {data.resume?.fileName || 'Resume Document'}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Uploaded: {data.resume?.uploadedAt ? new Date(data.resume.uploadedAt).toLocaleDateString() : 'Auto-generated'}
                  </div>
                </div>

                <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl">
                  <div className="text-xs text-zinc-400">Career Aspirations</div>
                  <div className="text-sm font-semibold text-sky-400 truncate">
                    {data.profile?.targetRoles?.length ? data.profile.targetRoles.join(', ') : 'Software Engineering'}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    GitHub: {data.resume?.hasGithub ? '✅ Present' : 'Not linked'}
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5">
                <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>⚡</span> Technical Skills ({data.profile?.skills?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(data.profile?.skills || []).map(s => (
                    <Chip key={s} color="blue">{s}</Chip>
                  ))}
                  {(!data.profile?.skills || data.profile.skills.length === 0) && (
                    <span className="text-xs text-zinc-500 italic">No skills specified</span>
                  )}
                </div>
              </div>

              {/* Suggestions / Highlights */}
              {data.resume?.quality?.suggestions?.length > 0 && (
                <div className="bg-zinc-950/50 border border-amber-900/40 rounded-xl p-3.5 text-xs">
                  <div className="font-semibold text-amber-300 mb-1.5 flex items-center gap-1">
                    <span>💡</span> Recommendations & Feedback
                  </div>
                  <ul className="list-disc list-inside text-zinc-300 space-y-1">
                    {data.resume.quality.suggestions.map((s, idx) => (
                      <li key={idx} className="text-zinc-300">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Resume Viewer Display */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>📑</span> Complete Resume Document Display
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{copied ? '✅' : '📋'}</span>
                      <span>{copied ? 'Copied' : 'Copy Text'}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="text-xs px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>⬇️</span>
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto selection:bg-red-900 selection:text-white shadow-inner">
                  {data.resume?.text || 'Resume content is empty.'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Authorized preview for Company Recruiters & Placement Admins
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading || loading || !data}
              className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
            >
              <span>⬇️</span> Download Resume File
            </button>
            <button
              onClick={onClose}
              className="btn text-xs px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
