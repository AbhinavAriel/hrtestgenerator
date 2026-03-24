import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTest } from "../context/TestContext"

export default function HomeRedirect() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, testId, agreed, isSubmitted } = useTest()

  useEffect(() => {
    if (user?.id && testId) {
      if (isSubmitted) { navigate("/result",     { replace: true }); return }
      if (agreed)      { navigate("/assessment", { replace: true }); return }
      navigate("/policy", { replace: true })
      return
    }
    navigate("/admin", { replace: true })
  }, [user, testId, agreed, isSubmitted, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white border rounded-xl shadow p-6 w-full max-w-md">
        <h1 className="text-lg font-semibold text-gray-900">Redirecting…</h1>
        <p className="text-sm text-gray-600 mt-2">We're sending you to the correct page.</p>
        <p className="text-xs text-gray-400 mt-4">Current path: {location.pathname}</p>
      </div>
    </div>
  )
}