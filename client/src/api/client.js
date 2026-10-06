import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use((r) => r, (err) => {
  if (err.response?.status === 401 && !location.pathname.startsWith('/login')) {
    localStorage.removeItem('token');
    location.href = '/login';
  }
  return Promise.reject(err);
});

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

// download a CSV with the auth header
export async function downloadCsv(path, filename) {
  const res = await api.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default api;
