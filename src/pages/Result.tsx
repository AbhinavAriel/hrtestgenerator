import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTest } from "../context/TestContext";
import { clearCandidateToken } from "../lib/Candidateauth";
import BG2 from '../assets/bg-2.webp'

export default function Result() {

  const navigate = useNavigate();
  const { setAgreed, setAnswers, setIsSubmitted } = useTest();

  useEffect(() => {
    setAgreed(false);
    setAnswers({});
    setIsSubmitted(true);

    // Clear the candidate JWT — assessment session is over
    clearCandidateToken();

    const handlePopState = () => {
      navigate("/test-submitted", { replace: true });
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, setAgreed, setAnswers, setIsSubmitted]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center px-4" style={{ backgroundImage: `url(${BG2})` }}>
      <div className="w-full max-w-xl rounded-[28px] border border-white/30 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">

        <div className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-green-700">
          Assessment Complete
        </div>

        <h1 className="mt-5 text-3xl font-bold text-slate-900">
          Thank you!
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your responses have been recorded successfully. Our team will review your assessment and get back to you shortly.
        </p>

      </div>
    </div>
  );
}