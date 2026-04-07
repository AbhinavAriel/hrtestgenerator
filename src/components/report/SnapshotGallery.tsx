import { useEffect, useState } from "react"
import { SnapshotRecord } from "../../api/snapShot"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useImageSrc(snap: SnapshotRecord): { src: string | null; failed: boolean } {
  const src = snap.imageUrl || null
  return { src, failed: !src }
}

// ─── Broken-image placeholder ─────────────────────────────────────────────────

function BrokenImage({ small = false }: { small?: boolean }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gray-50">
      <svg
        className={`${small ? "w-5 h-5" : "w-8 h-8"} text-gray-300`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 15l5-5 4 4 3-3 4 4" />
      </svg>
      <span className={`${small ? "text-[8px]" : "text-xs"} text-gray-400`}>No preview</span>
    </div>
  )
}

// ─── Snapshot thumbnail ───────────────────────────────────────────────────────

function SnapshotThumb({ snap, onClick }: { snap: SnapshotRecord; onClick: () => void }) {
  const { src, failed } = useImageSrc(snap)
  const time = new Date(snap.capturedAt).toLocaleTimeString()

  return (
    <button
      onClick={onClick}
      disabled={failed}
      className="group relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100 hover:border-blue-400 transition disabled:cursor-default"
      title={new Date(snap.capturedAt).toLocaleString()}
    >
      {failed && <BrokenImage small />}
      {src && (
        <img
          src={src}
          alt={`Snapshot at ${time}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      )}
      <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate">
        {time}
      </span>
    </button>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  snap, total, index, onClose, onPrev, onNext,
}: {
  snap: SnapshotRecord
  total: number
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const { src, failed } = useImageSrc(snap)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose()
      if (e.key === "ArrowLeft")  onPrev()
      if (e.key === "ArrowRight") onNext()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full rounded-xl overflow-hidden shadow-2xl bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {total > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl"
            >‹</button>
            <button
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl"
            >›</button>
          </>
        )}

        <div className="min-h-48 flex items-center justify-center bg-black">
          {failed && <BrokenImage />}
          {src && (
            <img src={src} alt="Snapshot" className="w-full max-h-[70vh] object-contain" />
          )}
        </div>

        <div className="bg-white px-4 py-2 text-xs text-gray-600 flex justify-between items-center">
          <span>{index + 1} / {total} — {new Date(snap.capturedAt).toLocaleString()}</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 font-bold text-base"
          >✕</button>
        </div>
      </div>
    </div>
  )
}

// ─── Exported gallery ─────────────────────────────────────────────────────────

export function SnapshotGallery({
  snapshots,
  loading,
}: {
  snapshots: SnapshotRecord[]
  loading: boolean
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const selected = selectedIndex !== null ? snapshots[selectedIndex] : null

  const prev = () =>
    setSelectedIndex((i) => i !== null ? (i - 1 + snapshots.length) % snapshots.length : null)
  const next = () =>
    setSelectedIndex((i) => i !== null ? (i + 1) % snapshots.length : null)

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        Captured Snapshots
        {!loading && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({snapshots.length} captured)
          </span>
        )}
      </h2>

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 text-center">
          Loading snapshots…
        </div>
      )}

      {!loading && snapshots.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
          No proctoring snapshots found for this test.
        </div>
      )}

      {!loading && snapshots.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {snapshots.map((snap, i) => (
              <SnapshotThumb key={snap.id} snap={snap} onClick={() => setSelectedIndex(i)} />
            ))}
          </div>
        </div>
      )}

      {selected !== null && selectedIndex !== null && (
        <Lightbox
          snap={selected}
          total={snapshots.length}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  )
}