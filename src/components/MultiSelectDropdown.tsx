import { useEffect, useMemo, useRef, useState } from "react"
import { MultiSelectDropdownProps } from "../types/ui"

interface NormalizedOption<T> {
  opt: T
  id: string
  label: string
}

export default function MultiSelectDropdown<T>({
  options = [],
  value = [],
  onChange,
  placeholder = "Select...",
  disabled = false,
  error = false,
  maxMenuHeight = 160,
  getOptionLabel,
  getOptionValue,
}: MultiSelectDropdownProps<T>) {

  const wrapRef  = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef  = useRef<HTMLDivElement | null>(null)

  const [open, setOpen]          = useState(false)
  const [query, setQuery]        = useState("")
  const [activeIndex, setActive] = useState(0)
  const [openUpward, setOpenUpward] = useState(false)

  const selectedArr = useMemo(() => value.map(String), [value])
  const selectedSet = useMemo(() => new Set(selectedArr), [selectedArr])

  // ── helpers ───────────────────────────────────────────────────────────────
  const labelOf = (o: any): string => {
    if (getOptionLabel) return String(getOptionLabel(o) ?? "")
    if (typeof o === "object") return String(o.label ?? o.name ?? o.Name ?? "")
    return String(o ?? "")
  }

  const valueOf = (o: any, idx: number): string => {
    if (getOptionValue) {
      const v = getOptionValue(o)
      if (v !== null && v !== undefined && String(v).trim() !== "") return String(v)
    }
    if (typeof o === "object") {
      const v = o.value ?? o.id ?? o.Id
      if (v !== null && v !== undefined && String(v).trim() !== "") return String(v)
    }
    return `__idx__${idx}`
  }

  const normalizedOptions: NormalizedOption<T>[] = useMemo(() => {
    const seen = new Set<string>()
    const acc: NormalizedOption<T>[] = []
    options.forEach((opt, i) => {
      const id  = valueOf(opt, i)
      const key = id.toLowerCase()
      if (seen.has(key)) return
      seen.add(key)
      acc.push({ opt, id, label: labelOf(opt) })
    })
    return acc
  }, [options])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q
      ? normalizedOptions.filter(x => x.label.toLowerCase().includes(q))
      : normalizedOptions
  }, [normalizedOptions, query])

  // ── open / close ──────────────────────────────────────────────────────────
  const openMenu = () => {
    if (disabled) return

    // Detect if there's enough space below, else open upward
    if (wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUpward(spaceBelow < maxMenuHeight + 60)
    }

    setOpen(true)
    setActive(0)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const close = () => {
    setOpen(false)
    setQuery("")
    setActive(0)
  }

  const toggleItem = (item: NormalizedOption<T>) => {
    if (disabled || item.id.startsWith("__idx__")) return
    onChange(
      selectedArr.includes(item.id)
        ? selectedArr.filter(x => x !== item.id)
        : [...selectedArr, item.id]
    )
  }

  const removeChip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) onChange(selectedArr.filter(x => x !== id))
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) onChange([])
  }

  // ── keyboard ──────────────────────────────────────────────────────────────
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === "Enter" || e.key === " ") openMenu(); return }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
    if (e.key === "Enter")     { e.preventDefault(); if (filtered[activeIndex]) toggleItem(filtered[activeIndex]) }
    if (e.key === "Escape")    close()
  }

  // scroll active item into view
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, open])

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // stop wheel from bubbling out of the list
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const stop = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const atTop    = scrollTop === 0 && e.deltaY < 0
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0
      if (atTop || atBottom) e.preventDefault()
      e.stopPropagation()
    }
    el.addEventListener("wheel", stop, { passive: false })
    return () => el.removeEventListener("wheel", stop)
  }, [open])

  // ── derived labels ────────────────────────────────────────────────────────
  const selectedLabels = useMemo(() => {
    const map = new Map<string, string>()
    normalizedOptions.forEach(x => { if (!x.id.startsWith("__idx__")) map.set(x.id, x.label) })
    return selectedArr.map(id => ({ id, label: map.get(id) || id }))
  }, [normalizedOptions, selectedArr])

  const triggerCls = [
    "min-h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-all duration-150",
    disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-text",
    error    ? "border-red-400 ring-1 ring-red-200"
             : open ? "border-blue-400 ring-2 ring-blue-100"
                    : "border-gray-300 hover:border-gray-400",
  ].join(" ")

  return (
    <div ref={wrapRef} className="relative" onKeyDown={onKeyDown}>

      {/* ── Trigger ── */}
      <div
        className={triggerCls}
        onClick={() => open ? inputRef.current?.focus() : openMenu()}
      >
        <div className="flex flex-wrap items-center gap-1.5">

          {selectedLabels.map(x => (
            <span
              key={x.id}
              className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 pl-2 pr-1 py-0.5 text-xs font-medium text-blue-700"
            >
              {x.label}
              {!disabled && (
                <button
                  type="button"
                  onClick={e => removeChip(x.id, e)}
                  className="rounded hover:bg-blue-200 p-0.5 text-blue-400 hover:text-blue-700 transition-colors"
                  tabIndex={-1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M6.414 5l2.293-2.293a1 1 0 00-1.414-1.414L5 3.586 2.707 1.293A1 1 0 001.293 2.707L3.586 5 1.293 7.293a1 1 0 001.414 1.414L5 6.414l2.293 2.293a1 1 0 001.414-1.414L6.414 5z" />
                  </svg>
                </button>
              )}
            </span>
          ))}

          <input
            ref={inputRef}
            value={query}
            disabled={disabled}
            onChange={e => { setQuery(e.target.value); setActive(0); if (!open) setOpen(true) }}
            className="flex-1 min-w-20 bg-transparent outline-none py-0.5 text-sm placeholder:text-gray-400"
            placeholder={selectedArr.length === 0 ? placeholder : ""}
          />

          <div className="ml-auto flex items-center gap-1 pl-1 shrink-0">
            {selectedArr.length > 0 && !disabled && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                tabIndex={-1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M6.414 5l2.293-2.293a1 1 0 00-1.414-1.414L5 3.586 2.707 1.293A1 1 0 001.293 2.707L3.586 5 1.293 7.293a1 1 0 001.414 1.414L5 6.414l2.293 2.293a1 1 0 001.414-1.414L6.414 5z" />
                </svg>
              </button>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>

        </div>
      </div>

      {/* ── Dropdown — opens upward if near bottom of screen ── */}
      {open && (
        <div
          className="absolute left-0 right-0 z-9999 rounded-lg border border-gray-200 bg-white shadow-lg"
          style={openUpward
            ? { bottom: "calc(100% + 4px)" }
            : { top:    "calc(100% + 4px)" }
          }
          onWheel={e => e.stopPropagation()}
        >
          {/* search hint */}
          {query && (
            <div className="px-3 py-1.5 text-xs text-gray-400 border-b border-gray-100 select-none">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          )}

          {/* scrollable list only */}
          <div
            ref={listRef}
            style={{ maxHeight: maxMenuHeight, overflowY: "auto" }}
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center select-none">
                No matches found
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isSelected = selectedSet.has(item.id)
                const isActive   = idx === activeIndex

                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => toggleItem(item)}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 transition-colors duration-75
                      ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}
                      ${isSelected ? "text-blue-700 font-medium" : "text-gray-700"}
                    `}
                  >
                    <span className="truncate">{item.label}</span>
                    <span className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors
                      ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white"}`}
                    >
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="currentColor">
                          <path fillRule="evenodd" d="M8.707 2.293a1 1 0 00-1.414 0L4 5.586 2.707 4.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          {/* footer */}
          {selectedArr.length > 0 && (
            <div className="px-3 py-1.5 border-t border-gray-100 flex items-center justify-between select-none">
              <span className="text-xs text-gray-400">{selectedArr.length} selected</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  )
}