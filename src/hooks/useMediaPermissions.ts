import { useCallback, useState } from "react"

export type PermissionState = "idle" | "requesting" | "granted" | "denied" | "error"

export interface MediaPermissions {
  camera: PermissionState
  mic: PermissionState
}

export interface UseMediaPermissionsReturn {
  permissions: MediaPermissions
  requesting: boolean
  allGranted: boolean
  requestPermissions: () => Promise<void>
  streamRef: React.MutableRefObject<MediaStream | null>
}

export function useMediaPermissions(): UseMediaPermissionsReturn {
  const streamRef = { current: null } as React.MutableRefObject<MediaStream | null>

  const [permissions, setPermissions] = useState<MediaPermissions>({
    camera: "idle",
    mic:    "idle",
  })
  const [requesting, setRequesting] = useState(false)

  const allGranted =
    permissions.camera === "granted" && permissions.mic === "granted"

  const requestPermissions = useCallback(async () => {
    if (requesting) return
    setRequesting(true)

    // Show both as "requesting" immediately so the UI reacts
    setPermissions({ camera: "requesting", mic: "requesting" })

    try {
      // Request camera + audio together — this fires ONE browser dialog
      // (just like Zoom's single "allow camera and microphone" prompt)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: true,
      })

      // Keep the stream alive — Assessment.tsx will reuse it
      streamRef.current = stream

      setPermissions({ camera: "granted", mic: "granted" })

    } catch (err: any) {
      const name = err?.name ?? ""

      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        // User explicitly blocked
        setPermissions({ camera: "denied", mic: "denied" })
      } else if (name === "NotFoundError") {
        // No camera/mic hardware at all
        setPermissions({ camera: "error", mic: "error" })
      } else {
        // Some other browser/OS error
        setPermissions({ camera: "error", mic: "error" })
      }
    } finally {
      setRequesting(false)
    }
  }, [requesting])

  return {
    permissions,
    requesting,
    allGranted,
    requestPermissions,
    streamRef,
  }
}