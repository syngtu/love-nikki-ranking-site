import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  searchText?: string;
}

interface Props {
  label: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
}

export function SearchableSelect({ label, value, options, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const text = (o.searchText ?? o.label).toLowerCase();
      return text.includes(q);
    });
  }, [options, query]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOption = (opt: SearchableSelectOption) => {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      selectOption(filtered[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="searchable-select" ref={containerRef}>
      <label className="searchable-select-label">{label}</label>
      <div className="searchable-select-input-wrap">
        <input
          type="text"
          className="searchable-select-input"
          value={open ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
        />
        <button
          type="button"
          className="searchable-select-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle dropdown"
        >
          ▾
        </button>
      </div>
      {open && filtered.length > 0 && (
        <ul className="searchable-select-dropdown" role="listbox">
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`searchable-select-option ${i === highlightIndex ? "highlighted" : ""} ${opt.value === value ? "selected" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(opt);
              }}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
      {open && filtered.length === 0 && (
        <div className="searchable-select-empty">No matches</div>
      )}
    </div>
  );
}
