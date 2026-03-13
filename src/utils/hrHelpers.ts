export function pillClass (name: string = "") : string {
    const n = name.toLowerCase();
    if (n.includes("react")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (n.includes("angular")) return "bg-red-50 text-red-700 border-red-200";
    if (n.includes("javascript")) return "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (n.includes("typescript")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (n.includes("c#") || n.includes("csharp")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (n.includes("python")) return "bg-green-50 text-green-700 border-green-200";
    if (n.includes("html")) return "bg-red-100 text-red-700 border-red-200";
    if (n.includes("css")) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };