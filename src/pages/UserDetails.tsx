import { ChangeEvent } from "react"
import { useUserDetails } from "../hooks/useUserDetails"

export default function UserDetails() {

  const {
    form,
    errors,
    apiError,
    submitting,
    onChangeField,
    handleSubmit
  } = useUserDetails()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(../../public/bg-2.webp)] bg1 bg-cover">

      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg backdrop-blur-3xl z-50">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Assessment Registration
        </h2>

        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              disabled={submitting}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChangeField("name", e.target.value)
              }
              className="w-full border border-gray-300 text-sm p-3 rounded-lg focus:border-blue-400 outline-none disabled:opacity-80"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              disabled={submitting}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChangeField("email", e.target.value)
              }
              className="w-full border border-gray-300 text-sm p-3 rounded-lg focus:border-blue-400 outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              disabled={submitting}
              inputMode="numeric"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChangeField("phone", e.target.value)
              }
              className="w-full border border-gray-300 text-sm p-3 rounded-lg focus:border-blue-400 outline-none"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 cursor-pointer text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Continue"}
          </button>

        </form>
      </div>
    </div>
  )
}