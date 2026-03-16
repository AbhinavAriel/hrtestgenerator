import { useNavigate } from "react-router-dom"
import { useTest } from "../context/TestContext"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { getHrTestById } from "../api/hrApi"

interface LoaderProps {
  message?: string
}

function FullPageLoader({ message = "Loading..." }: LoaderProps) {
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

export default function PolicyAgreement() {

  const { user, setAgreed, testId } = useTest()
  const navigate = useNavigate()

  const [checked, setChecked] = useState<boolean>(false)
  const [checking, setChecking] = useState<boolean>(true)

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

        setChecking(true)

        const response: any = await getHrTestById(testId)
        const res = response?.data ?? response

        const test = res?.test ?? res?.Test

        const submittedAt =
          test?.submittedAtUtc ??
          test?.SubmittedAtUtc ??
          res?.submittedAtUtc ??
          res?.SubmittedAtUtc

        const status = (
          test?.status ??
          test?.Status ??
          res?.status ??
          res?.Status ??
          ""
        )
          .toString()
          .trim()
          .toLowerCase()

        const isSubmitted = Boolean(submittedAt) || status === "submitted"

        if (!mounted) return

        if (isSubmitted) {
          navigate(`/test/${testId}/already-submitted`, { replace: true })
          return
        }

      } catch (err: any) {

        toast.error(err?.message || "Unable to validate test status.")
        navigate("/", { replace: true })

      } finally {

        if (mounted) setChecking(false)

      }
    }

    validateTest()

    return () => {
      mounted = false
    }

  }, [user, testId, navigate])

  if (checking) {
    return <FullPageLoader message="Validating test status..." />
  }

  const handleContinue = () => {

  if (!checked) return

  if (!testId) {
    toast.error("Missing test info. Please open the test link again.")
    navigate("/", { replace: true })
    return
  }

  setAgreed(true)

  sessionStorage.setItem("policyAgreed", "true") 

  navigate(`/assessment/${testId}`, { replace: true })
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(../../bg-1.jpg)] bg-cover bg1">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl relative z-50">

        <h2 className="text-xl font-bold mb-4">
          Assessment Policy
        </h2>

        <div className="h-40 overflow-y-auto border border-gray-300 p-4 rounded-lg text-sm text-gray-600 mb-4">
          Please read carefully:
          <br />
          • No cheating allowed
          <br />
          • Do not refresh the page
          <br />
          • Timer will continue running
          <br />
          • Your answers are final once submitted
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="w-4 h-4"
          />
          <label>I agree to the terms and conditions</label>
        </div>

        <button
          disabled={!checked}
          onClick={handleContinue}
          className={`w-full p-3 rounded-lg text-white transition ${
            checked
              ? "bg-green-600 hover:bg-green-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Start Assessment
        </button>

      </div>
    </div>
  )
}