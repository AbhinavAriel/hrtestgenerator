import { useCallback, useEffect, useRef, useState } from "react"
import { uploadSnapshot } from "../api/snapShot"

interface UseAssessmentCameraProps {
  testId: string
  applicantId: string
  enabled?: boolean         
  intervalSeconds?: number  
  submittedRef: React.RefObject<boolean>
}

interface UseAssessmentCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  cameraStatus: "idle" | "requesting" | "active" | "denied" | "error"
  snapshotCount: number
  stopCamera: () => void
}

export function useAssessmentCamera({
  testId,
  applicantId,
  enabled = true,
  intervalSeconds = 30,
  submittedRef,
}: UseAssessmentCameraProps): UseAssessmentCameraReturn {

  const videoRef   = useRef<HTMLVideoElement | null>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const canvasRef  = useRef<HTMLCanvasElement | null>(null)
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null)

  const [cameraStatus, setCameraStatus] = useState<
    "idle" | "requesting" | "active" | "denied" | "error"
  >("idle")

  const [snapshotCount, setSnapshotCount] = useState(0)

  const getCanvas = (): HTMLCanvasElement => {
    if (!canvasRef.current) {
      const c = document.createElement("canvas")
      c.width  = 320
      c.height = 240
      canvasRef.current = c
    }
    return canvasRef.current
  }

  const captureRef = useRef<() => Promise<void>>(async () => {})

  const captureAndUpload = useCallback(async () => {
    if (submittedRef.current)       return
    if (!videoRef.current)          return
    if (!streamRef.current?.active) return
    if (cameraStatus !== "active")  return

    try {
      const canvas = getCanvas()
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8)

      await uploadSnapshot({
        testId,
        applicantId,
        imageData:  dataUrl,
        capturedAt: new Date().toISOString(),
      })

      setSnapshotCount((c) => c + 1)
    } catch (err) {
      console.warn("[Camera] Snapshot upload failed:", err)
    }
  }, [testId, applicantId, cameraStatus, submittedRef])

  useEffect(() => {
    captureRef.current = captureAndUpload
  }, [captureAndUpload])

  const stopCamera = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current)
      intervalId.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  useEffect(() => {
    if (!enabled || !testId || !applicantId) return

    let mounted = true

    const start = async () => {
      setCameraStatus("requesting")

      try {
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: false,
        })

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.muted     = true
          videoRef.current.volume    = 0
          videoRef.current.play().catch(() => {})
        }

        setCameraStatus("active")

        // First capture after 5 s, then every intervalSeconds
        const t = setTimeout(() => {
          captureRef.current()
          intervalId.current = setInterval(
            () => captureRef.current(),
            intervalSeconds * 1000
          )
        }, 5_000)

        return () => clearTimeout(t)

      } catch (err: any) {
        if (!mounted) return

        if (
          err?.name === "NotAllowedError" ||
          err?.name === "PermissionDeniedError"
        ) {
          setCameraStatus("denied")
          console.warn("[Camera] Permission revoked after policy page.")
        } else {
          setCameraStatus("error")
          console.warn("[Camera] Stream error:", err?.message)
        }
      }
    }

    start()

    return () => {
      mounted = false
      stopCamera()
    }
  }, [enabled, testId, applicantId])

  useEffect(() => {
    if (submittedRef.current) stopCamera()
  }, [submittedRef.current, stopCamera])

  return { videoRef, cameraStatus, snapshotCount, stopCamera }
}