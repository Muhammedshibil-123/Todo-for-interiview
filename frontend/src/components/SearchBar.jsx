import { useState, useEffect } from 'react';

// Debounced search — waits 400ms after the user stops typing
export default function SearchBar({ value, onChange }) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => onChange(local), 400);
    return () => clearTimeout(t);
  }, [local]);

  useEffect(() => { setLocal(value); }, [value]);

  return (
    <div className="search-wrapper">
      <span className="search-icon">🔍</span>
      <input
        id="search-input"
        type="text"
        className="search-input"
        placeholder="Search by title…"
        value={local}
        onChange={e => setLocal(e.target.value)}
      />
      {local && (
        <button className="search-clear" onClick={() => { setLocal(''); onChange(''); }}>
          ✕
        </button>
      )}
    </div>
  );
}
