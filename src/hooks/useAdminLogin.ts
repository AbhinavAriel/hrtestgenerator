import { useMemo, useState, ChangeEvent, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginAdmin } from "../api/authApi";

// saveAdminSession is no longer called here — loginAdmin() handles it
// internally so the session is always persisted in exactly one place.

interface LoginForm {
  email: string;
  password: string;
}

export function useAdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const redirectTo = useMemo(
    () => (location.state as any)?.from?.pathname || "/admin",
    [location.state]
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);

      // loginAdmin() calls the API, saves the full session to localStorage
      // under "admin_session", and returns the AdminSession object.
      await loginAdmin({
        email: form.email.trim(),
        password: form.password,
      });

      toast.success("Admin login successful.");
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      toast.error(error?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    submitting,
    onChange,
    onSubmit,
    redirectTo,
  };
}