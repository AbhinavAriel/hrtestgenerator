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
  maxMenuHeight = 260,
  getOptionLabel,
  getOptionValue,
}: MultiSelectDropdownProps<T>) {

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)

  const selectedArr = useMemo(() => value.map(String), [value])
  const selectedSet = useMemo(() => new Set(selectedArr), [selectedArr])

  const labelOf = (o: any) => {
    if (getOptionLabel) return String(getOptionLabel(o) ?? "")
    if (typeof o === "object") return String(o.label ?? o.name ?? o.Name ?? "")
    return String(o ?? "")
  }

  const valueOf = (o: any, idx: number) => {
    if (getOptionValue) {
      const v = getOptionValue(o)
      if (v !== null && v !== undefined && String(v).trim() !== "")
        return String(v)
    }

    if (typeof o === "object") {
      const v = o.value ?? o.id ?? o.Id
      if (v !== null && v !== undefined && String(v).trim() !== "")
        return String(v)
    }

    return `__idx__${idx}`
  }

  const normalizedOptions: NormalizedOption<T>[] = useMemo(() => {
    const seen = new Set<string>()
    const acc: NormalizedOption<T>[] = []

    options.forEach((opt, i) => {
      const id = valueOf(opt, i)
      const key = id.toLowerCase()

      if (seen.has(key)) return
      seen.add(key)

      acc.push({ opt, id, label: labelOf(opt) })
    })

    return acc
  }, [options])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return normalizedOptions

    return normalizedOptions.filter((x) =>
      x.label.toLowerCase().includes(q)
    )
  }, [normalizedOptions, query])

  const openMenu = () => {
    if (disabled) return
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const close = () => {
    setOpen(false)
    setQuery("")
    setActiveIndex(0)
  }

  const toggleItem = (item: NormalizedOption<T>) => {
    if (disabled || item.id.startsWith("__idx__")) return

    onChange(
      selectedArr.includes(item.id)
        ? selectedArr.filter((x) => x !== item.id)
        : [...selectedArr, item.id]
    )
  }

  const removeChip = (id: string) => {
    if (!disabled) onChange(selectedArr.filter((x) => x !== id))
  }

  const clearAll = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!disabled) onChange([])
  }

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        close()
    }

    document.addEventListener("mousedown", onDocDown)
    return () => document.removeEventListener("mousedown", onDocDown)
  }, [])

  const selectedLabels = useMemo(() => {
    const map = new Map<string, string>()

    normalizedOptions.forEach((x) => {
      if (!x.id.startsWith("__idx__")) map.set(x.id, x.label)
    })

    return selectedArr.map((id) => ({
      id,
      label: map.get(id) || id,
    }))
  }, [normalizedOptions, selectedArr])

  const triggerClasses = [
    "min-h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition",
    disabled ? "opacity-60 cursor-not-allowed" : "cursor-text",
    error ? "border-red-400" : "border-gray-300",
    open ? "ring-2 ring-blue-200 border-blue-400" : "hover:border-gray-400",
  ].join(" ")

  return (
    <div ref={wrapRef} className="relative">

      <div
        className={triggerClasses}
        onClick={() => (open ? inputRef.current?.focus() : openMenu())}
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
                    e.stopPropagation()
                    removeChip(x.id)
                  }}
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
              setQuery(e.target.value)
              setActiveIndex(0)
              if (!open) setOpen(true)
            }}
            className="flex-1 min-w-30 bg-transparent outline-none py-1"
            placeholder={selectedArr.length ? "" : placeholder}
          />

          {selectedArr.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-gray-600"
            >
              Clear
            </button>
          )}

          <span className="text-gray-500 select-none">▾</span>
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-xl">
          <div
            className="overflow-auto"
            style={{ maxHeight: maxMenuHeight }}
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                No matches
              </div>
            ) : (
              filtered.map((item, idx) => {
                const selected = selectedSet.has(item.id)

                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => toggleItem(item)}
                    className={`w-full px-4 py-2 text-left text-sm flex justify-between ${
                      idx === activeIndex ? "bg-blue-50" : ""
                    }`}
                  >
                    <span>{item.label}</span>

                    <span className="text-xs">
                      {selected ? "Selected" : "Select"}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

    </div>
  )
}