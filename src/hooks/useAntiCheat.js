import { useEffect } from "react";
import toast from "react-hot-toast";

export function useAntiCheat() {
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        toast.error("Switching tabs is not allowed.");
      }
    };

    const handleContext = (e) => {
      e.preventDefault();
      toast.error("Right click disabled.");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("contextmenu", handleContext);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("contextmenu", handleContext);
    };
  }, []);
}