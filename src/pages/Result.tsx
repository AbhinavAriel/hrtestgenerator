import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTest } from "../context/TestContext";

export default function Result() {

  const navigate = useNavigate();
  const { setAgreed, setAnswers, setIsSubmitted } = useTest();

  useEffect(() => {

    // Clear assessment state so candidate cannot go back
    setAgreed(false);
    setAnswers({});
    setIsSubmitted(true);

    const handlePopState = () => {
      navigate("/test-submitted", { replace: true });
    };

    // Push an extra history entry so back button is blocked
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };

  }, [navigate, setAgreed, setAnswers, setIsSubmitted]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl text-center">
        <div className="text-4xl font-bold text-blue-600 mb-4">
          Thank You!
        </div>
      </div>
    </div>
  );
}