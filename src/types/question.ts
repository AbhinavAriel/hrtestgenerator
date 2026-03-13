export interface Question {
  id: string
  text: string
  question: string
  options: string[]
  correctAnswer: string
}

export interface Option {
  id: string
  text: string
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