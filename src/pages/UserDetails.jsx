import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createApplicant } from "../api/applicantApi";
import { useTest } from "../context/TestContext";

export default function UserDetails() {
  const navigate = useNavigate();
  const { setUser } = useTest();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Full name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChangeField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setApiError(""); // ✅ clear backend error when typing
    // optional: clear field error while typing
    setErrors((p) => {
      const copy = { ...p };
      delete copy[key];
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setApiError("");

    if (!validate()) return;

    try {
      setSubmitting(true);

      const result = await createApplicant({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

      // normalize id so rest of app always uses user.id
      const normalizedUser = {
        ...result,
        id: result?.id || result?.userId || result?.userID || result?.userID,
      };

      if (!normalizedUser.id) {
        // if backend didn't return id properly
        throw new Error("Registration succeeded but user id not returned.");
      }

      setUser(normalizedUser);
      navigate("/policy", { replace: true });
    } catch (error) {
      console.error("API Error:", error);
      setApiError(error?.message || "Something went wrong while registering");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(../../public/bg-2.webp)] bg1 bg-cover">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg backdrop-blur-3xl z-50">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Assessment Registration
        </h2>

        {/* ✅ show backend error */}
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
              className="w-full border border-gray-300 text-sm p-3 rounded-lg focus:border-blue-400 outline-none disabled:opacity-80"
              value={form.name}
              onChange={(e) => onChangeField("name", e.target.value)}
              disabled={submitting}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full border border-gray-300 text-sm p-3 rounded-lg focus:border-blue-400 outline-none"
              value={form.email}
              onChange={(e) => onChangeField("email", e.target.value)}
              disabled={submitting}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full border border-gray-300 text-sm p-3 rounded-lg focus:border-blue-400 outline-none"
              value={form.phone}
              onChange={(e) => onChangeField("phone", e.target.value)}
              inputMode="numeric"
              disabled={submitting}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
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
  );
}