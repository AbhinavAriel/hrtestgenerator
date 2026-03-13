import { useEffect } from "react";
import toast from "react-hot-toast";

export function useAntiCheat(): void {
  useEffect(() => {
    const handleVisibility = (): void => {
      if (document.hidden) {
        toast.error("Switching tabs is not allowed.");
      }
    };

    const handleContext = (e: MouseEvent): void => {
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