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
    const raw = meta?.levels?.length ? meta.levels : ["Beginner", "Intermediate", "Professional"]
    return raw.map((l) => (typeof l === "string" ? l : (l as any)?.label || (l as any)?.value || ""))
  }, [meta])

  const [form, setForm]           = useState<CreateQuestionForm>(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)

  const setField = <K extends keyof CreateQuestionForm>(key: K, value: CreateQuestionForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const setOptionText = (index: number, value: string) =>
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? { ...opt, text: value } : opt)),
    }))

  const setCorrectOption = (index: number) =>
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => ({ ...opt, isCorrect: i === index })),
    }))

  const resetForm = () => setForm(DEFAULT_FORM)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
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