import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import { createQuestion } from "../api/questionsApi"
import { useHrData } from "./useHrData"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QuestionOption {
  text: string
  isCorrect: boolean
}

export interface CreateQuestionForm {
  text: string
  techStackId: string
  level: string
  options: QuestionOption[]
}

export interface CreateQuestionErrors {
  text?: string
  techStackId?: string
  level?: string
  options?: string        // covers all-empty / no-correct-marked cases
  optionTexts?: string[]  // per-option empty errors (index-aligned)
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_OPTIONS: QuestionOption[] = [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
]

const DEFAULT_FORM: CreateQuestionForm = {
  text: "",
  techStackId: "",
  level: "",
  options: DEFAULT_OPTIONS,
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(form: CreateQuestionForm): CreateQuestionErrors {
  const errors: CreateQuestionErrors = {}

  if (!form.text.trim()) {
    errors.text = "Question text is required"
  }

  if (!form.techStackId) {
    errors.techStackId = "Please select a tech stack"
  }

  if (!form.level) {
    errors.level = "Please select a level"
  }

  // Per-option validation: every option must have text
  const optionTexts: string[] = form.options.map((opt) =>
    opt.text.trim() ? "" : "Option text is required"
  )
  if (optionTexts.some((e) => e !== "")) {
    errors.optionTexts = optionTexts
    errors.options = "All options must be filled in"
  }

  // At least one option must be marked correct (should always be true with
  // current UI, but guard anyway)
  if (!form.options.some((opt) => opt.isCorrect)) {
    errors.options = "Please mark one option as correct"
  }

  return errors
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCreateQuestion() {
  const { meta } = useHrData()

  const techOptions = useMemo(() => {
    return (meta?.techStacks ?? []).map((t: any) => ({
      value: (t.id ?? t.value) as string,
      label: (t.name ?? t.label) as string,
    }))
  }, [meta])

  const levelOptions = useMemo(() => {
    const raw = meta?.levels?.length
      ? meta.levels
      : ["Beginner", "Intermediate", "Professional"]
    return raw.map((l) =>
      typeof l === "string" ? l : (l as any)?.label || (l as any)?.value || ""
    )
  }, [meta])

  const [form, setForm]             = useState<CreateQuestionForm>(DEFAULT_FORM)
  const [errors, setErrors]         = useState<CreateQuestionErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // ── Field setters ───────────────────────────────────────────────────────

  const setField = <K extends keyof CreateQuestionForm>(
    key: K,
    value: CreateQuestionForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Clear the error for this field as soon as the user changes it
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const setOptionText = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, text: value } : opt
      ),
    }))
    // Clear per-option error for this index
    setErrors((prev) => {
      const next = [...(prev.optionTexts ?? ["", "", "", ""])]
      next[index] = ""
      const allClear = next.every((e) => e === "")
      return {
        ...prev,
        optionTexts: next,
        options: allClear ? undefined : prev.options,
      }
    })
  }

  const setCorrectOption = (index: number) =>
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => ({ ...opt, isCorrect: i === index })),
    }))

  const resetForm = () => {
    setForm(DEFAULT_FORM)
    setErrors({})
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return

    const validationErrors = validate(form)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Show the first error as a toast so the user knows exactly what to fix
      const firstMessage =
        validationErrors.text ||
        validationErrors.techStackId ||
        validationErrors.level ||
        validationErrors.options ||
        "Please fill in all required fields"
      toast.error(firstMessage)
      return
    }

    try {
      setSubmitting(true)
      await createQuestion({
        text:        form.text,
        techStackId: form.techStackId,
        level:       form.level,
        options:     form.options,
      })
      toast.success("Question created successfully.")
      resetForm()
    } catch (err: any) {
      toast.error(err?.message || "Failed to create question")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    form,
    errors,
    techOptions,
    levelOptions,
    submitting,
    setField,
    setOptionText,
    setCorrectOption,
    resetForm,
    handleSubmit,
  }
}