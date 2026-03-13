import { Option } from "../types/hr"

export function normalizeLevelOptions(levels?: unknown[]): Option[] {
  const raw = levels?.length
    ? levels
    : ["Beginner", "Intermediate", "Professional"]

  return raw.map((l) => {
    if (typeof l === "string") {
      return { value: l, label: l }
    }

    const obj = l as Record<string, unknown>

    return {
      value: String(obj?.value ?? obj?.label ?? ""),
      label: String(obj?.label ?? obj?.value ?? ""),
    }
  })
}

export function normalizeTechOptions(options?: unknown[]): Option[] {
  if (!Array.isArray(options)) return []

  return options
    .map((t) => {
      if (!t) return null

      const obj = t as Record<string, unknown>

      if (obj.value && obj.label) {
        return {
          value: String(obj.value),
          label: String(obj.label),
        }
      }

      if (obj.id && obj.name) {
        return {
          value: String(obj.id),
          label: String(obj.name),
        }
      }

      return null
    })
    .filter(Boolean) as Option[]
}