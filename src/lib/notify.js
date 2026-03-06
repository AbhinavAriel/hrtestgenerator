import toast from "react-hot-toast";

export function notifyError(err, fallback = "Something went wrong") {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback;

  toast.error(msg);
}

export function notifySuccess(message) {
  toast.success(message);
}