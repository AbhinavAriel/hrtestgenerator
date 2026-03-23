export interface Option {
  id: string
  text: string
}

export interface Question {
  id: string
  text: string
  options: Option[]
  order?: number
  correctAnswer?: string
}

// null = question was skipped (no answer selected)
export type AnswerMap = Record<string, string | null>

export interface User {
  id?: string
  applicantId?: string
  userId?: string
  name?: string
  email?: string
  phone?: string
  [key: string]: any
}

export interface EditableOptionCardProps {
  value: string
  index: number
  selected: boolean
  onSelect: () => void
  onChange: (value: string) => void
  disabled?: boolean
}

export interface OptionCardProps {
  option: string
  index: number
  selected: boolean
  onSelect: () => void
  name: string
}