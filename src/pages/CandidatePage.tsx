import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"

import { getHrTestByToken } from "../api/hrApi"
import { useTest } from "../context/TestContext"

type CandidateForm = {
  name: string
  email: string
  phone: string
  applicantId: string
  testId: string
}

const onlyDigits = (v: string) => (v || "").replace(/\D/g, "")

function FullPageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(../../public/bg-2.webp)] bg1 bg-cover px-4">
      <div className="bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-800 animate-spin" />
          <p className="text-sm text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default function CandidatePage() {

  const navigate = useNavigate()
  const { testId } = useParams()
  const { setUser, setTestId } = useTest()

  const safeToken = useMemo(() => (testId ?? "").trim(), [testId])

  const [checking, setChecking] = useState(true)
  const [apiError, setApiError] = useState("")

  const [form, setForm] = useState<CandidateForm>({
    name: "",
    email: "",
    phone: "",
    applicantId: "",
    testId: "",
  })

  useEffect(() => {

    if (!safeToken) {
      toast.error("Invalid test link.")
      navigate("/admin-login", { replace: true })
      return
    }

    let mounted = true

    const loadCandidate = async () => {
      try {

        setChecking(true)

        const response: any = await getHrTestByToken(safeToken)
        const res = response?.data ?? response

        const test = res?.test ?? res?.Test
        const applicant = res?.applicant ?? res?.Applicant

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
          .toLowerCase()

        if (submittedAt || status === "submitted") {
          navigate(`/test/${safeToken}/already-submitted`, { replace: true })
          return
        }

        const applicantId =
          res?.applicantId ??
          res?.ApplicantId ??
          applicant?.id ??
          applicant?.Id

        const resolvedTestId =
          res?.testId ??
          res?.TestId ??
          test?.id ??
          test?.Id

        if (!applicantId || !resolvedTestId) {
          throw new Error("Applicant or test details missing.")
        }

        const fullName =
          applicant?.fullName ??
          applicant?.FullName ??
          `${applicant?.firstName ?? ""} ${applicant?.lastName ?? ""}`.trim()

        const next: CandidateForm = {
          applicantId,
          testId: resolvedTestId,
          name: fullName || "",
          email: applicant?.email ?? applicant?.Email ?? "",
          phone: onlyDigits(applicant?.phoneNumber ?? applicant?.PhoneNumber ?? ""),
        }

        if (!mounted) return

        setForm(next)

        setTestId(resolvedTestId)

        setUser({
          id: applicantId,
          name: next.name,
          email: next.email,
          phone: next.phone,
        })

      } catch (err: any) {

        if (!mounted) return

        const msg = err?.message || "Unable to load candidate details."
        setApiError(msg)
        toast.error(msg)

      } finally {

        if (mounted) setChecking(false)

      }
    }

    loadCandidate()

    return () => {
      mounted = false
    }

  }, [safeToken, navigate, setUser, setTestId])

  const handleStart = (e: React.FormEvent) => {

    e.preventDefault()

    if (checking || apiError) return

    if (!form.email || form.phone.length !== 10) {
      toast.error("Candidate details incomplete. Contact admin.")
      return
    }

    navigate("/policy", { replace: true })
  }

  if (checking) {
    return <FullPageLoader message="Validating your test link..." />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(../../public/bg-2.webp)] bg1 bg-cover">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg backdrop-blur-3xl z-50">

        <h2 className="text-2xl font-bold mb-2 text-center">
          Candidate Details
        </h2>

        <p className="text-sm text-gray-600 mb-6 text-center">
          Verify your details before starting the assessment.
        </p>

        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {apiError}
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-3">

          <Input label="Full Name" value={form.name} disabled />

          <Input label="Email" value={form.email} disabled />

          <Input label="Phone Number" value={form.phone} disabled />

          <button
            type="submit"
            disabled={!!apiError}
            className="w-full bg-linear-to-r from-blue-500 to-blue-700 cursor-pointer font-semibold text-white p-3 rounded-lg text-base transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Start Test
          </button>

        </form>
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  disabled,
}: {
  label: string
  value: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="text-xs">{label}</label>
      <input
        value={value}
        readOnly
        disabled={disabled}
        className="w-full border border-gray-300 text-sm p-3 rounded-lg outline-none bg-gray-200"
      />
    </div>
  )
}