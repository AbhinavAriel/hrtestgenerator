import type { RefObject } from "react";

interface CameraPreviewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: "idle" | "requesting" | "active" | "denied" | "error";
  snapshotCount: number;
}

export default function CameraPreview({
  videoRef,
  status,
  snapshotCount,
}: CameraPreviewProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-1.5" style={{ visibility: "hidden", pointerEvents: "none" }}>

      <div className="relative w-36 h-28 rounded-xl overflow-hidden border border-gray-300 bg-gray-900 shadow-xl">

        {/* Live feed */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            status === "active" ? "opacity-100" : "opacity-0"
          }`}
        />

        {status !== "active" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center">
            <StatusIcon status={status} />
            <span className="text-[10px] text-gray-400 leading-tight">
              {statusLabel(status)}
            </span>
          </div>
        )}

        {/* Recording indicator */}
        {status === "active" && (
          <span className="absolute top-1.5 left-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] text-white/80 font-medium">REC</span>
          </span>
        )}
      </div>

      {/* ── Denied / error warning pill ──────────────────────────────────── */}
      {(status === "denied" || status === "error") && (
        <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
          Camera unavailable
        </span>
      )}
    </div>
  );
}

function statusLabel(
  status: "idle" | "requesting" | "active" | "denied" | "error"
): string {
  if (status === "requesting") return "Requesting camera…";
  if (status === "denied")     return "Camera permission denied";
  if (status === "error")      return "Camera not available";
  return "";
}

function StatusIcon({
  status,
}: {
  status: "idle" | "requesting" | "active" | "denied" | "error";
}) {
  if (status === "requesting") {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-gray-500 border-t-white animate-spin" />
    );
  }
  if (status === "denied" || status === "error") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-red-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
        />
        <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth={1.5} />
      </svg>
    );
  }
  return null;
}