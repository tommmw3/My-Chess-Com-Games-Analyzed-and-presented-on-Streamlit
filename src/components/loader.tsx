import { FaChessPawn, FaSpinner } from "react-icons/fa";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1e1e1e]">
      <div className="flex flex-col items-center gap-4">
        <FaChessPawn className="text-4xl text-gray-400 animate-bounce" />
        <FaSpinner className="animate-spin text-2xl text-gray-400" />
      </div>
    </div>
  );
}
