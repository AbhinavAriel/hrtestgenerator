import { Link, useParams } from "react-router-dom";

export default function TestAlreadySubmitted() {
  const { testId } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow p-6">
        <h1 className="text-xl font-semibold text-gray-900">Test already submitted</h1>
        <p className="mt-2 text-gray-600">
          Our records show this assessment has already been completed. You can’t take it again using the same link.
        </p>

      
      </div>
    </div>
  );
}