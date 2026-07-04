import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import './TypeaheadInput.css';

const TypeaheadInput = ({ label, options, selected, onChange }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = options.filter(opt => 
    !selected.find(s => s.id === opt.id) &&
    (opt.name.toLowerCase().includes(query.toLowerCase()) || 
     (opt.email && opt.email.toLowerCase().includes(query.toLowerCase())))
  );

  const handleSelect = (option) => {
    onChange([...selected, option]);
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (idToRemove) => {
    onChange(selected.filter(item => item.id !== idToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (query.trim()) {
        const val = query.trim().replace(',', '');
        const match = filteredOptions.find(o => o.email === val || o.name === val);
        if (match) {
          handleSelect(match);
        } else {
          handleSelect({ id: 'custom-' + Date.now(), name: val, email: val });
        }
      }
    }
  };

  return (
    <div className="typeahead-wrapper" ref={wrapperRef}>
      <label className="input-label">{label}</label>
      <div className="typeahead-input-container input-field">
        {selected.map(item => (
          <span key={item.id} className="typeahead-pill">
            {item.name} {item.type === 'group' && '(Group)'}
            <button onClick={() => handleRemove(item.id)}><X size={12} /></button>
          </span>
        ))}
        <input 
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? "Type to search or enter new email..." : ""}
          className="typeahead-text-input"
        />
      </div>
      
      {isOpen && (query || filteredOptions.length > 0) && (
        <ul className="typeahead-dropdown glass-panel">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <li key={opt.id} onClick={() => handleSelect(opt)} className="typeahead-option">
                <div className="option-name">{opt.name} {opt.type === 'group' && <span className="tag-pill bg-accent">Group</span>}</div>
                {opt.email && <div className="option-email">{opt.email}</div>}
              </li>
            ))
          ) : (
            <li className="typeahead-option" onClick={() => handleSelect({ id: 'custom-' + Date.now(), name: query, email: query })}>
              <div className="option-name">Add "{query}"</div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default TypeaheadInput;
