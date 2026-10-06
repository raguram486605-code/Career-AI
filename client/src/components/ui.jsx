import { useState } from 'react';

export const PageTitle = ({ title, sub, right }) => (
  <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
    <div><h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>{sub && <p className="text-zinc-400 text-sm mt-1">{sub}</p>}</div>
    {right}
  </div>
);

export const Spinner = ({ text = 'Loading...' }) => <div className="p-8 text-center text-zinc-400 animate-pulse">{text}</div>;

export const Alert = ({ type = 'error', children }) => children ? (
  <div className={`rounded-lg px-4 py-3 text-sm mb-4 ${type === 'error' ? 'bg-red-950/80 text-red-200 border border-red-800/80 shadow-md shadow-red-950/30' : 'bg-emerald-950/80 text-emerald-200 border border-emerald-800/80 shadow-md shadow-emerald-950/30'}`}>{children}</div>
) : null;

export const StatCard = ({ label, value, hint, color = 'text-red-500' }) => (
  <div className="card"><div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">{label}</div>
    <div className={`text-3xl font-extrabold mt-1.5 tracking-tight ${color}`}>{value ?? '-'}</div>{hint && <div className="text-xs text-zinc-400 mt-1">{hint}</div>}</div>
);

const tone = {
  green: 'bg-emerald-950/90 text-emerald-300 border-emerald-800/60',
  red: 'bg-red-950/90 text-red-300 border-red-800/60',
  amber: 'bg-amber-950/90 text-amber-300 border-amber-800/60',
  blue: 'bg-sky-950/90 text-sky-300 border-sky-800/60',
  gray: 'bg-zinc-800/90 text-zinc-300 border-zinc-700/60'
};
export const Chip = ({ children, color = 'gray', title }) => <span title={title} className={`chip ${tone[color]}`}>{children}</span>;

export const statusColor = (s) => ({ applied: 'blue', shortlisted: 'amber', selected: 'green', rejected: 'red', open: 'green', closed: 'gray' }[s] || 'gray');

export const scoreColor = (s) => (s >= 75 ? '#10b981' : s >= 55 ? '#84cc16' : s >= 35 ? '#f59e0b' : '#ef4444');

// Circular gauge for match score
export function ScoreGauge({ score = 0, size = 96 }) {
  const r = size / 2 - 8, c = 2 * Math.PI * r, off = c * (1 - Math.min(100, score) / 100), col = scoreColor(score);
  return (
    <svg width={size} height={size} role="img" aria-label={`Match ${score}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#27272a" strokeWidth="8" fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth="8" fill="none" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontSize={size / 4.2} fontWeight="700" fill={col}>{Math.round(score)}%</text>
    </svg>
  );
}

// Skill list editor: type + Enter to add, click x to remove.
export function SkillInput({ value = [], onChange, suggestions = [] }) {
  const [txt, setTxt] = useState('');
  const add = (s) => { const v = s.trim(); if (v && !value.some(x => x.toLowerCase() === v.toLowerCase())) onChange([...value, v]); setTxt(''); };
  const hints = txt ? suggestions.filter(s => s.toLowerCase().includes(txt.toLowerCase()) && !value.includes(s)).slice(0, 6) : [];
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(s => (
          <span key={s} className="chip bg-red-950/80 text-red-300 border-red-800/80 flex items-center gap-1.5">{s}
            <button type="button" aria-label={`remove ${s}`} onClick={() => onChange(value.filter(x => x !== s))} className="font-bold text-red-400 hover:text-white">x</button></span>
        ))}
      </div>
      <input className="input" placeholder="Type a skill and press Enter" value={txt} onChange={e => setTxt(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(txt); } }} />
      {hints.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{hints.map(h => <button type="button" key={h} className="chip bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white" onClick={() => add(h)}>+ {h}</button>)}</div>}
    </div>
  );
}

export function Bar({ label, value, max = 100, color = '#ef4444' }) {
  return (
    <div className="mb-2"><div className="flex justify-between text-xs text-zinc-400 mb-1 font-medium"><span>{label}</span><span>{Math.round(value)}%</span></div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} /></div></div>
  );
}

// Full explanation of a match result (used in student + admin views)
export function MatchBreakdown({ match }) {
  const b = match.breakdown;
  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <ScoreGauge score={match.score} />
        <div><div className="font-semibold text-white text-base">{match.verdict}</div>
          <div className="text-xs text-zinc-400">Score = 60% skill coverage + 25% semantic similarity + 15% project relevance</div></div>
      </div>
      <Bar label="Required-skill coverage (60%)" value={b.coverage} color="#ef4444" />
      <Bar label={`Resume vs job text similarity (25%) - ${b.embedder}`} value={b.semantic} color="#38bdf8" />
      <Bar label="Projects / experience relevance (15%)" value={b.projects} color="#fbbf24" />
      <div className="grid sm:grid-cols-3 gap-4 mt-4 text-sm">
        <div><div className="font-medium text-emerald-400 mb-1">Matched</div><div className="flex flex-wrap gap-1">{match.matchedSkills.map(s => <Chip key={s} color="green">{s}</Chip>)}{!match.matchedSkills.length && <span className="text-zinc-500">none</span>}</div></div>
        <div><div className="font-medium text-sky-400 mb-1">Implied (partial credit)</div><div className="flex flex-wrap gap-1">{match.impliedSkills.map(s => <Chip key={s.skill} color="blue" title={`via ${s.via}`}>{s.skill} ({Math.round(s.credit * 100)}%)</Chip>)}{!match.impliedSkills.length && <span className="text-zinc-500">none</span>}</div></div>
        <div><div className="font-medium text-red-400 mb-1">Missing</div><div className="flex flex-wrap gap-1">{match.missingSkills.map(s => <Chip key={s} color="red">{s}</Chip>)}{!match.missingSkills.length && <span className="text-emerald-400">nothing missing</span>}</div></div>
      </div>
    </div>
  );
}
