interface EvalBarProps {
  evaluation: number;
  height: string;
  isFlipped: boolean;
}

export default function EvalBar({
  evaluation,
  height,
  isFlipped,
}: EvalBarProps) {
  // Calculate white and black portions of the evaluation bar
  const evalPercentage = 50 + evaluation * 10; // Example scaling: evaluation ranges from -5 to +5
  const whiteHeight = Math.min(100, Math.max(0, evalPercentage));
  const blackHeight = 100 - whiteHeight;

  return (
    <div
      className={`w-6 rounded overflow-hidden flex flex-col ${
        isFlipped ? "flex-col-reverse" : ""
      }`}
      style={{ height }}
    >
      <div
        className="bg-white transition-all duration-300 flex items-center justify-center"
        style={{ height: `${whiteHeight}%` }}
      >
        <span className="text-black text-xs font-bold [writing-mode:vertical-rl] rotate-180">
          {evaluation > 0 ? `+${evaluation.toFixed(1)}` : ""}
        </span>
      </div>
      {/* Black portion */}
      <div
        className="bg-gray-900 transition-all duration-300 relative flex items-center justify-center"
        style={{ height: `${blackHeight}%` }}
      >
        <span className="text-white text-xs font-bold [writing-mode:vertical-rl] rotate-180">
          {evaluation < 0 ? evaluation.toFixed(1) : ""}
        </span>
        {/* Tooltip on hover */}
        <div className="absolute hidden group-hover:block bg-gray-700 text-white text-xs p-1 rounded -right-20 whitespace-nowrap">
          Evaluation: {evaluation?.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
