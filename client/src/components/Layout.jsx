import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [['/', 'Dashboard'], ['/profile', 'Profile & Resume'], ['/jobs', 'Jobs & Match'], ['/roadmaps', 'Roadmaps'], ['/interview', 'Interview Prep'], ['/progress', 'Progress'], ['/applications', 'Applications']];
const adminLinks = [['/admin', 'Analytics'], ['/admin/companies', 'Companies'], ['/admin/jobs', 'Jobs'], ['/admin/matching', 'Student Matching'], ['/admin/shortlisted', 'Shortlisted'], ['/admin/reports', 'Reports']];
const companyLinks = [['/company', 'Recruiter Portal']];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const links = user.role === 'admin' ? adminLinks : user.role === 'company' ? companyLinks : studentLinks;
  const roleTitle = user.role === 'admin' ? 'Placement Admin' : user.role === 'company' ? 'Company Recruiter' : 'Student Portal';
  return (
    <div className="min-h-screen md:flex bg-zinc-950 text-zinc-100">
      <aside className="md:w-64 bg-zinc-950 text-zinc-200 md:min-h-screen p-5 shrink-0 border-r border-zinc-800/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-white text-lg shadow-md shadow-red-950/80">C</div>
            <span className="text-xl font-extrabold tracking-tight text-white">Career<span className="text-red-500">AI</span></span>
          </div>
          <div className="text-xs font-semibold tracking-wider uppercase text-red-400/80 mb-6 pl-1">{roleTitle}</div>
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/' || to === '/admin'}
                className={({ isActive }) => `px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${isActive ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-950/60 border border-red-500/30' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="hidden md:block mt-8 pt-4 border-t border-zinc-800/80 text-sm">
          <div className="font-semibold text-zinc-100 truncate">{user.name}</div>
          <div className="text-xs text-zinc-400 truncate mb-4">{user.email}</div>
          <button className="btn-ghost w-full !text-zinc-300 !border-zinc-700 hover:!bg-red-950/50 hover:!text-red-300 hover:!border-red-800/60" onClick={() => { logout(); nav('/login'); }}>Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full bg-zinc-950">
        <div className="md:hidden mb-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex justify-between items-center text-sm">
          <span className="font-semibold text-zinc-200">{user.name}</span>
          <button className="text-xs px-3 py-1 rounded bg-red-950 text-red-300 border border-red-800" onClick={() => { logout(); nav('/login'); }}>Logout</button>
        </div>
        {children}
      </main>
    </div>
  );
}
