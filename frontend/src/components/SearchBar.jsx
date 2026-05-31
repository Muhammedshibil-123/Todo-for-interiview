// SearchBar — debounced search input
import { useState, useEffect } from 'react';

export default function SearchBar({ value, onChange }) {
  const [local, setLocal] = useState(value);

  // Debounce: wait 400ms after user stops typing before calling onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(local);
    }, 400);
    return () => clearTimeout(timer);
  }, [local]);

  // Sync if parent resets
  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className="search-wrapper">
      <span className="search-icon">🔍</span>
      <input
        id="search-input"
        type="text"
        className="search-input"
        placeholder="Search tasks by title..."
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
      {local && (
        <button className="search-clear" onClick={() => { setLocal(''); onChange(''); }}>
          ✕
        </button>
      )}
    </div>
  );
}
