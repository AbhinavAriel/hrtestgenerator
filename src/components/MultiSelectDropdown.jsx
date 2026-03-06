import { useEffect, useMemo, useRef, useState } from "react";

export default function MultiSelectDropdown({
  options = [],
  value = [],
  onChange,
  placeholder = "Select...",
  disabled = false,
  error = false,
  maxMenuHeight = 260,
  getOptionLabel,
  getOptionValue,
}) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const list = useMemo(() => (Array.isArray(options) ? options : []), [options]);
  const selectedArr = useMemo(() => (Array.isArray(value) ? value.map(String) : []), [value]);
  const selectedSet = useMemo(() => new Set(selectedArr), [selectedArr]);

  const labelOf = useMemo(() => {
    return (o) => {
      try {
        if (getOptionLabel) return String(getOptionLabel(o) ?? "");
      } catch {}
      if (o && typeof o === "object") return String(o.label ?? o.name ?? o.Name ?? "");
      return String(o ?? "");
    };
  }, [getOptionLabel]);

  const valueOf = useMemo(() => {
    return (o, idx) => {
      try {
        if (getOptionValue) {
          const v = getOptionValue(o);
          if (v !== null && v !== undefined && String(v).trim() !== "") return String(v);
        }
      } catch {}

      if (o && typeof o === "object") {
        const v = o.value ?? o.id ?? o.Id;
        if (v !== null && v !== undefined && String(v).trim() !== "") return String(v);
      }

      // ✅ fallback: stable key even if id missing (still show options)
      return `__idx__${idx}`;
    };
  }, [getOptionValue]);

  // ✅ normalize without dropping options
  const normalizedOptions = useMemo(() => {
    const seen = new Set();
    const acc = [];

    for (let i = 0; i < list.length; i++) {
      const opt = list[i];
      const id = valueOf(opt, i);
      const key = id.toLowerCase();

      if (seen.has(key)) continue;
      seen.add(key);

      acc.push({ opt, id, label: labelOf(opt) });
    }

    return acc;
  }, [list, valueOf, labelOf]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalizedOptions;

    return normalizedOptions.filter((x) => (x.label || "").toLowerCase().includes(q));
  }, [normalizedOptions, query]);

  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
    setTimeout(() => inputRef.current?.focus?.(), 0);
  };

  const close = () => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const toggleItem = (item) => {
    if (disabled) return;

    // if fallback id, don't allow selection because it won't match backend
    if (item.id.startsWith("__idx__")) return;

    const curr = selectedArr;
    onChange(curr.includes(item.id) ? curr.filter((x) => x !== item.id) : [...curr, item.id]);
  };

  const removeChip = (id) => {
    if (disabled) return;
    onChange(selectedArr.filter((x) => x !== String(id)));
  };

  const clearAll = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!disabled) onChange([]);
  };

  useEffect(() => {
    const onDocDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const onKeyDown = (e) => {
    if (disabled) return;

    if (!open && (e.key === "Enter" || e.key === "ArrowDown")) {
      e.preventDefault();
      openMenu();
      return;
    }

    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) toggleItem(item);
      return;
    }

    if (e.key === "Backspace" && !query && selectedArr.length) {
      removeChip(selectedArr[selectedArr.length - 1]);
    }
  };

  const selectedLabels = useMemo(() => {
    const map = new Map();
    normalizedOptions.forEach((x) => {
      if (!x.id.startsWith("__idx__")) map.set(x.id, x.label);
    });

    return selectedArr.map((id) => ({
      id,
      label: map.get(id) || id,
    }));
  }, [normalizedOptions, selectedArr]);

  const triggerClasses = [
    "min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition",
    disabled ? "opacity-60 cursor-not-allowed" : "cursor-text",
    error ? "border-red-400" : "border-gray-300",
    open ? "ring-2 ring-blue-200 border-blue-400" : "hover:border-gray-400",
  ].join(" ");

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={triggerClasses}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => (open ? inputRef.current?.focus?.() : openMenu())}
        onKeyDown={onKeyDown}
        aria-disabled={disabled}
      >
        <div className="flex flex-wrap items-center gap-2">
          {selectedLabels.map((x) => (
            <span
              key={x.id}
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-800"
            >
              {x.label}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChip(x.id);
                  }}
                  className="rounded-full px-1 text-blue-700 hover:bg-blue-100"
                  aria-label={`Remove ${x.label}`}
                >
                  ✕
                </button>
              )}
            </span>
          ))}

          <input
            ref={inputRef}
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
              if (!open) setOpen(true);
            }}
            onFocus={() => !disabled && setOpen(true)}
            onKeyDown={onKeyDown}
            className="flex-1 min-w-30 bg-transparent outline-none py-1"
            placeholder={selectedArr.length ? "" : placeholder}
          />

          {selectedArr.length ? (
            <button
              type="button"
              onClick={clearAll}
              disabled={disabled}
              className="rounded-lg px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
              title="Clear all"
            >
              Clear
            </button>
          ) : null}

          <span className="text-gray-500 select-none">▾</span>
        </div>
      </div>

      {open && (
        <div
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
          role="listbox"
        >
          <div className="max-h-65 overflow-auto" style={{ maxHeight: maxMenuHeight }}>
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No matches</div>
            ) : (
              filtered.map((item, idx) => {
                const selected = selectedSet.has(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => toggleItem(item)}
                    className={[
                      "w-full px-4 py-2.5 text-left text-sm flex items-center justify-between",
                      idx === activeIndex ? "bg-blue-50" : "bg-white",
                      "hover:bg-blue-50",
                      item.id.startsWith("__idx__") ? "opacity-60 cursor-not-allowed" : "",
                    ].join(" ")}
                    role="option"
                    aria-selected={selected}
                    disabled={item.id.startsWith("__idx__")}
                    title={item.id.startsWith("__idx__") ? "Invalid option id mapping" : undefined}
                  >
                    <span className="text-gray-900">{item.label}</span>
                    <span
                      className={[
                        "text-xs rounded-full px-2 py-1 border",
                        selected
                          ? "border-blue-200 bg-blue-100 text-blue-800"
                          : "border-gray-200 bg-gray-50 text-gray-600",
                      ].join(" ")}
                    >
                      {selected ? "Selected" : "Select"}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-600 flex items-center justify-between">
            <span>{selectedArr.length} selected</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                close();
              }}
              className="rounded-md px-2 py-1 hover:bg-gray-100"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}