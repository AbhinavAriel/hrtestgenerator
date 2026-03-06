import { useLocation } from "react-router-dom";

export default function Result() {
  const location = useLocation();

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
