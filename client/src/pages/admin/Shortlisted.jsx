import { useEffect, useState } from 'react';
import api, { downloadCsv, errMsg } from '../../api/client';
import { Alert, Chip, PageTitle, Spinner, statusColor } from '../../components/ui';
import ResumeModal from '../../components/ResumeModal';

export default function Shortlisted() {
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const [viewResumeStudentId, setViewResumeStudentId] = useState(null);

  useEffect(() => {
    api.get('/admin/shortlisted')
      .then(r => setList(r.data.shortlisted))
      .catch(e => setErr(errMsg(e)));
  }, []);

  if (!list) return <><Alert>{err}</Alert><Spinner /></>;

  return (
    <>
      <PageTitle
        title="Shortlisted Students"
        sub="Candidates marked shortlisted or selected across all campus recruitment drives."
        right={
          <button className="btn-ghost" onClick={() => downloadCsv('/admin/reports/shortlisted.csv', 'shortlisted_students.csv')}>
            📥 Download CSV
          </button>
        }
      />
      <div className="card overflow-x-auto bg-zinc-900 border-zinc-800">
        <table className="w-full">
          <thead>
            <tr>
              {['Student & Resume', 'Company', 'Job Opening', 'Match', 'Status'].map(h => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(a => (
              <tr key={a._id} className="hover:bg-zinc-800/40 border-t border-zinc-800/60 transition-colors">
                <td className="td">
                  <div className="font-bold text-white">{a.studentId?.name}</div>
                  <div className="text-xs text-zinc-400">{a.studentId?.email}</div>
                  {a.studentId?._id && (
                    <button
                      onClick={() => setViewResumeStudentId(a.studentId._id)}
                      className="mt-1 text-[11px] px-2 py-0.5 rounded bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      📄 View Resume
                    </button>
                  )}
                </td>
                <td className="td text-zinc-300 font-medium">{a.jobId?.companyId?.name || 'Company'}</td>
                <td className="td text-zinc-300">{a.jobId?.title}</td>
                <td className="td font-semibold text-white">{a.matchScore}%</td>
                <td className="td"><Chip color={statusColor(a.status)}>{a.status}</Chip></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="text-sm text-zinc-400 p-4">No candidate shortlisted yet.</p>}
      </div>

      {viewResumeStudentId && (
        <ResumeModal
          studentId={viewResumeStudentId}
          onClose={() => setViewResumeStudentId(null)}
        />
      )}
    </>
  );
}
