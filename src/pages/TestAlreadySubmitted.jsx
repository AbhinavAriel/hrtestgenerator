import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

export default function TestAlreadySubmitted() {
  const { testId } = useParams();

  const message = useMemo(() => {
    if (testId) {
      return "Our records show this assessment has already been completed. You cannot retake the same test using this link.";
    }

    return "This assessment has already been submitted from your current session. Please contact admin if you need any further assistance.";
  }, [testId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(../../public/bg-2.webp)] bg-cover bg-center px-4">
      <div className="w-full max-w-xl rounded-[28px] border border-white/30 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
          Assessment Status
        </div>

        <h1 className="mt-5 text-3xl font-bold text-slate-900">Test submitted</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        

      </div>
    </div>
  );
}