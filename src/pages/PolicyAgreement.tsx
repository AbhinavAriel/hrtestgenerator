import { useNavigate } from "react-router-dom"
import { useTest } from "../context/TestContext"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { getHrTestById } from "../api/hrApi"
import { useMediaPermissions, PermissionState } from "../hooks/useMediaPermissions"

// ─── Step type ───────────────────────────────────────────────────────────────

type Step = "loading" | "policy" | "permissions" | "ready"

// ─── Sub-components ──────────────────────────────────────────────────────────

function FullPageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(../../bg-1.jpg)] bg-cover bg1 px-4">
      <div className="bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-800 animate-spin" />
          <p className="text-sm text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  )
}

function PermissionRow({
  icon,
  label,
  state,
}: {
  icon: React.ReactNode
  label: string
  state: PermissionState
}) {
  const statusConfig = {
    idle:       { dot: "bg-gray-300",  text: "Not checked",  textCls: "text-gray-500" },
    requesting: { dot: "bg-yellow-400 animate-pulse", text: "Waiting for permission…", textCls: "text-yellow-600" },
    granted:    { dot: "bg-green-500", text: "Access granted", textCls: "text-green-600" },
    denied:     { dot: "bg-red-500",   text: "Access denied", textCls: "text-red-600" },
    error:      { dot: "bg-red-400",   text: "Device not found", textCls: "text-red-500" },
  }

  const { dot, text, textCls } = statusConfig[state]

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-100 bg-gray-50">
      <div className="flex items-center gap-3">
        <span className="text-gray-500">{icon}</span>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
        <span className={`text-xs font-medium ${textCls}`}>{text}</span>
      </div>
    </div>
  )
}

export default function PolicyAgreement() {

  const { user, setAgreed, testId } = useTest()
  const navigate = useNavigate()

  const [step, setStep]       = useState<Step>("loading")
  const [checked, setChecked] = useState(false)

  const {
    permissions,
    requesting,
    allGranted,
    requestPermissions,
  } = useMediaPermissions()

  // ── Step 1: validate test on mount ───────────────────────────────────────
  useEffect(() => {
    let mounted = true

    const validateTest = async () => {
      const applicantId = user?.id

      if (!applicantId) {
        navigate("/", { replace: true })
        return
      }

      if (!testId) {
        toast.error("Missing test info. Please open the test link again.")
        navigate("/", { replace: true })
        return
      }

      try {
        const response: any = await getHrTestById(testId)
        const res  = response?.data ?? response
        const test = res?.test ?? res?.Test

        const submittedAt =
          test?.submittedAtUtc ?? test?.SubmittedAtUtc ??
          res?.submittedAtUtc  ?? res?.SubmittedAtUtc

        const status = (
          test?.status ?? test?.Status ??
          res?.status  ?? res?.Status ?? ""
        ).toString().trim().toLowerCase()

        if (!mounted) return

        if (Boolean(submittedAt) || status === "submitted") {
          navigate("/test-submitted", { replace: true })
          return
        }

        setStep("policy")
      } catch (err: any) {
        toast.error(err?.message || "Unable to validate test status.")
        navigate("/", { replace: true })
      }
    }

    validateTest()
    return () => { mounted = false }
  }, [user?.id, testId, navigate])

  // ── Step 2 → 3: policy checkbox accepted ────────────────────────────────
  const handlePolicyNext = () => {
    if (!checked) return
    setStep("permissions")
  }

  const handleStartTest = () => {
    if (!allGranted) return

    if (!testId) {
      toast.error("Missing test info. Please open the test link again.")
      navigate("/", { replace: true })
      return
    }

    setAgreed(true)
    sessionStorage.setItem(`policyAgreed_${testId}`, "true")
    navigate("/assessment", { replace: true })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (step === "loading") {
    return <FullPageLoader message="Validating test status..." />
  }

  if (step === "policy") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[url(../../bg-1.jpg)] bg-cover bg1">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl relative z-50">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
            <h2 className="text-xl font-bold text-gray-900">Assessment Policy</h2>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Policy</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-400">Camera & Mic</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-400">Start Test</span>
            </div>
          </div>

          <div className="h-40 overflow-y-auto border border-gray-200 p-4 rounded-xl text-sm text-gray-600 mb-5 leading-relaxed">
            <p className="font-semibold text-gray-800 mb-2">Please read carefully before proceeding:</p>
            <ul className="space-y-1.5 list-none">
              <li>• No cheating or tab switching allowed</li>
              <li>• Do not refresh the page — timer continues running</li>
              <li>• Your answers are final once submitted</li>
              <li>• Camera access is required throughout the test</li>
              <li>• Violations may result in automatic submission</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 mb-6 p-3 rounded-xl border border-gray-200 bg-gray-50">
            <input
              type="checkbox"
              id="policy-check"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <label htmlFor="policy-check" className="text-sm text-gray-700 cursor-pointer">
              I have read and agree to the assessment terms and conditions
            </label>
          </div>

          <button
            disabled={!checked}
            onClick={handlePolicyNext}
            className={`w-full p-3 rounded-xl text-white font-semibold transition ${
              checked
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Continue →
          </button>

        </div>
      </div>
    )
  }

  // ── STEP 2: Camera & Mic permission ───────────────────────────────────────
  if (step === "permissions") {
    const anyDenied =
      permissions.camera === "denied" || permissions.mic === "denied"
    const anyError  =
      permissions.camera === "error"  || permissions.mic === "error"

    return (
      <div className="min-h-screen flex items-center justify-center bg-[url(../../bg-1.jpg)] bg-cover bg1">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl relative z-50">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
            <h2 className="text-xl font-bold text-gray-900">Camera & Microphone Access</h2>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-green-600 font-medium">Policy ✓</span>
            </div>
            <div className="flex-1 h-px bg-blue-200" />
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Camera & Mic</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-400">Start Test</span>
            </div>
          </div>

          {/* Explanation card */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 mb-5">
            <p className="text-sm text-blue-800 font-medium mb-1">
              This assessment requires camera access for proctoring.
            </p>
            <p className="text-xs text-blue-600">
              When you click "Allow Access", your browser will show a permission
              dialog. Click <strong>Allow</strong> to grant access
            </p>
          </div>

          {/* Permission rows */}
          <div className="space-y-3 mb-5">
            <PermissionRow
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 9.75v9A2.25 2.25 0 004.5 18.75z" />
                </svg>
              }
              label="Camera"
              state={permissions.camera}
            />
            <PermissionRow
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              }
              label="Microphone"
              state={permissions.mic}
            />
          </div>

          {/* Denied / error guidance */}
          {anyDenied && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-5">
              <p className="text-sm font-semibold text-red-700 mb-1">Permission was blocked</p>
              <p className="text-xs text-red-600">
                To fix this, click the camera icon in your browser's address bar
                and select <strong>Allow</strong>, then click "Allow Access" again.
              </p>
            </div>
          )}

          {anyError && !anyDenied && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-5">
              <p className="text-sm font-semibold text-amber-700 mb-1">Camera or microphone not found</p>
              <p className="text-xs text-amber-600">
                Make sure your camera and microphone are connected and not in use
                by another application, then try again.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("policy")}
              className="px-5 py-3 rounded-xl border cursor-pointer border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>

            {!allGranted ? (
              <button
                onClick={requestPermissions}
                disabled={requesting}
                className={`flex-1 py-3 rounded-xl text-white font-semibold text-sm transition ${
                  requesting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
              >
                {requesting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Waiting for permission…
                  </span>
                ) : anyDenied || anyError ? (
                  "Try Again"
                ) : (
                  "Allow Access"
                )}
              </button>
            ) : (
              <button
                onClick={handleStartTest}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition cursor-pointer"
              >
                Start Assessment →
              </button>
            )}
          </div>

        </div>
      </div>
    )
  }

  // Fallback (should never render — "ready" state navigates immediately)
  return null
}