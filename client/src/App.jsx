import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import Jobs from './pages/student/Jobs';
import JobDetail from './pages/student/JobDetail';
import Roadmaps from './pages/student/Roadmaps';
import Interview from './pages/student/Interview';
import Progress from './pages/student/Progress';
import Applications from './pages/student/Applications';
import AdminDashboard from './pages/admin/Dashboard';
import Companies from './pages/admin/Companies';
import AdminJobs from './pages/admin/Jobs';
import Matching from './pages/admin/Matching';
import Shortlisted from './pages/admin/Shortlisted';
import Reports from './pages/admin/Reports';

import CompanyDashboard from './pages/company/Dashboard';

function Guard({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-zinc-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'company' ? '/company' : '/'} replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Guard role="student"><StudentDashboard /></Guard>} />
      <Route path="/profile" element={<Guard role="student"><Profile /></Guard>} />
      <Route path="/jobs" element={<Guard role="student"><Jobs /></Guard>} />
      <Route path="/jobs/:id" element={<Guard role="student"><JobDetail /></Guard>} />
      <Route path="/roadmaps" element={<Guard role="student"><Roadmaps /></Guard>} />
      <Route path="/interview" element={<Guard role="student"><Interview /></Guard>} />
      <Route path="/progress" element={<Guard role="student"><Progress /></Guard>} />
      <Route path="/applications" element={<Guard role="student"><Applications /></Guard>} />

      <Route path="/admin" element={<Guard role="admin"><AdminDashboard /></Guard>} />
      <Route path="/admin/companies" element={<Guard role="admin"><Companies /></Guard>} />
      <Route path="/admin/jobs" element={<Guard role="admin"><AdminJobs /></Guard>} />
      <Route path="/admin/matching" element={<Guard role="admin"><Matching /></Guard>} />
      <Route path="/admin/shortlisted" element={<Guard role="admin"><Shortlisted /></Guard>} />
      <Route path="/admin/reports" element={<Guard role="admin"><Reports /></Guard>} />

      <Route path="/company" element={<Guard role="company"><CompanyDashboard /></Guard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
