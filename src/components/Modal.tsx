import { ReactNode } from "react"

type ModalProps = {
  open: boolean
  title?: string
  children: ReactNode
  onClose: () => void
  disableClose?: boolean
}

export default function Modal({
  open,
  title,
  children,
  onClose,
  disableClose,
}: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={() => !disableClose && onClose()}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-gray-200 animate-[fadeIn_.2s_ease-out]">

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {title}
            </h2>

            <button
              onClick={onClose}
              disabled={disableClose}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5">
          {children}
        </div>

      </div>
    </div>
  )
}