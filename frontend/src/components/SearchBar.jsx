import { useState, useEffect } from 'react';

export default function SearchBar({ value, onChange }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => onChange(local), 400);
    return () => clearTimeout(t);
  }, [local]);

  useEffect(() => { setLocal(value); }, [value]);

  return (
    <div className="relative flex items-center w-full">
      <span className="absolute left-4 text-textMuted">🔍</span>
      <input
        type="text"
        className="w-full bg-surface border border-border rounded-xl pl-12 pr-10 py-2.5 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-textMuted/40"
        placeholder="Search by title…"
        value={local}
        onChange={e => setLocal(e.target.value)}
      />
      {local && (
        <button 
          className="absolute right-3 p-1.5 text-textMuted hover:text-white hover:bg-surfaceHover rounded-md transition-colors flex items-center justify-center" 
          onClick={() => { setLocal(''); onChange(''); }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}
