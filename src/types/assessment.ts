export interface Option {
  id: string
  text: string
}

export interface Question {
  id: string
  text: string
  options: Option[]
  correctAnswer?: string
}

export interface AnswerMap {
  [questionId: string]: string
}

export interface AnswerPayload {
  questionId: string
  selectedOption: string
}

export interface User {
  id: string
  name: string
  email?: string
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