export interface MultiSelectOption {
  label?: string
  name?: string
  Name?: string
  value?: string | number
  id?: string | number
  Id?: string | number
}

export interface MultiSelectDropdownProps<T = MultiSelectOption> {
  options?: T[]
  value?: (string | number)[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  maxMenuHeight?: number
  getOptionLabel?: (option: T) => string
  getOptionValue?: (option: T) => string | number
}