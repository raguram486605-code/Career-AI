import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api/client';
import { Alert, PageTitle, Spinner, Chip } from '../../components/ui';

const empty = { name: '', industry: '', location: '', website: '', package: '', contactName: '', contactEmail: '' };

export default function Companies() {
  const [list, setList] = useState(null);
  const [requests, setRequests] = useState([]);
  const [f, setF] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    Promise.all([
      api.get('/admin/companies'),
      api.get('/admin/company-requests')
    ])
      .then(([cRes, rRes]) => {
        setList(cRes.data.companies);
        setRequests(rRes.data.requests || []);
      })
      .catch(e => setErr(errMsg(e)));
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      if (editId) {
        await api.put(`/admin/companies/${editId}`, f);
        setMsg('Company updated successfully');
      } else {
        await api.post('/admin/companies', f);
        setMsg('Company added successfully');
      }
      setF(empty); setEditId(null); load();
    } catch (x) { setErr(errMsg(x)); }
  };

  const del = async (id) => {
    if (!confirm('Delete company and associated user accounts?')) return;
    try {
      await api.delete(`/admin/companies/${id}`);
      setMsg('Company deleted');
      load();
    } catch (x) { setErr(errMsg(x)); }
  };

  const approveRequest = async (userId) => {
    try {
      const res = await api.put(`/admin/company-requests/${userId}/approve`);
      setMsg(res.data.message || 'Company request approved!');
      load();
    } catch (x) { setErr(errMsg(x)); }
  };

  const rejectRequest = async (userId) => {
    try {
      const res = await api.put(`/admin/company-requests/${userId}/reject`);
      setMsg(res.data.message || 'Company request rejected');
      load();
    } catch (x) { setErr(errMsg(x)); }
  };

  if (!list) return <><Alert>{err}</Alert><Spinner /></>;

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <>
      <PageTitle title="Company Management & Approvals" sub="Only logged-in admin can add, edit, delete companies & accept recruiter access permissions" />
      <Alert type={msg ? 'success' : 'error'}>{msg || err}</Alert>

      {/* Admin Request Box for Company Permissions */}
      <div className="card mb-6 border-red-900/40 bg-zinc-900/90 shadow-xl shadow-red-950/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📥</span>
            <h2 className="font-bold text-white text-lg">Admin Request Box (Company Approvals)</h2>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${pendingRequests.length > 0 ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
            {pendingRequests.length} Pending Permission Request{pendingRequests.length !== 1 ? 's' : ''}
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-zinc-400 py-3 italic">No pending company account requests waiting for permission approval.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th">Company & Contact</th>
                  <th className="th">Email ID</th>
                  <th className="th">Industry</th>
                  <th className="th">Date</th>
                  <th className="th text-right">Admin Permission Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map(r => (
                  <tr key={r._id} className="border-t border-zinc-800/80">
                    <td className="td font-medium text-white">
                      <div>{r.companyId?.name || r.name}</div>
                      <div className="text-xs text-zinc-400">Recruiter: {r.name}</div>
                    </td>
                    <td className="td text-zinc-200">{r.email}</td>
                    <td className="td text-zinc-300">{r.companyId?.industry || 'Software'}</td>
                    <td className="td text-xs text-zinc-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="td text-right whitespace-nowrap">
                      <button
                        onClick={() => approveRequest(r._id)}
                        className="btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 mr-2 font-bold shadow-md shadow-emerald-950/50"
                      >
                        ✓ Accept Permission
                      </button>
                      <button
                        onClick={() => rejectRequest(r._id)}
                        className="btn bg-zinc-800 hover:bg-red-950 text-red-300 border border-zinc-700 hover:border-red-800 text-xs px-2.5 py-1.5"
                      >
                        ✕ Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Company Form */}
      <div className="card mb-6">
        <h2 className="font-semibold text-white mb-3">{editId ? 'Edit Company Details' : 'Add New Company'}</h2>
        <form onSubmit={submit} className="grid sm:grid-cols-3 gap-3">
          <input className="input" placeholder="Company name *" required value={f.name} onChange={set('name')} />
          <input className="input" placeholder="Industry" value={f.industry} onChange={set('industry')} />
          <input className="input" placeholder="Location" value={f.location} onChange={set('location')} />
          <input className="input" placeholder="Website" value={f.website} onChange={set('website')} />
          <input className="input" placeholder="Package (e.g. 6-9 LPA)" value={f.package} onChange={set('package')} />
          <input className="input" placeholder="Contact email" type="email" value={f.contactEmail} onChange={set('contactEmail')} />
          <div className="sm:col-span-3 flex gap-2 mt-2">
            <button className="btn-primary">{editId ? 'Update Company' : 'Add Company'}</button>
            {editId && <button type="button" className="btn-ghost" onClick={() => { setEditId(null); setF(empty); }}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* Company List Table */}
      <div className="card overflow-x-auto">
        <h2 className="font-semibold text-white mb-3">Registered Companies Directory ({list.length})</h2>
        <table className="w-full">
          <thead>
            <tr>
              {['Name', 'Industry', 'Location', 'Package', 'Contact Email', 'Status', ''].map(h => <th key={h} className="th">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c._id}>
                <td className="td font-medium text-white">{c.name}</td>
                <td className="td">{c.industry}</td>
                <td className="td">{c.location}</td>
                <td className="td">{c.package}</td>
                <td className="td">{c.contactEmail}</td>
                <td className="td">
                  <Chip color={c.status === 'approved' ? 'green' : c.status === 'pending' ? 'amber' : 'red'}>
                    {c.status || 'approved'}
                  </Chip>
                </td>
                <td className="td text-right whitespace-nowrap">
                  <button className="text-red-400 hover:text-red-300 text-sm font-medium mr-4" onClick={() => { setEditId(c._id); setF({ ...empty, ...c }); window.scrollTo(0, 300); }}>Edit</button>
                  <button className="text-zinc-400 hover:text-red-500 text-sm font-medium" onClick={() => del(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
