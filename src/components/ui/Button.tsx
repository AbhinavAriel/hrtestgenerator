import { ButtonHTMLAttributes } from "react"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export default function Button({ loading, children, ...rest }: Props) {
  return (
    <button {...rest}>
      {loading ? "Loading..." : children}
    </button>
  )
}