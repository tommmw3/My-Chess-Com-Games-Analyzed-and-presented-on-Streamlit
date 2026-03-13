import { useEffect, useRef } from "react";
import { classificationConfig } from "./icons";

export default function MoveList({
  positions,
  currentIndex,
  evaluations,
}: {
  positions: Position[];
  currentIndex: number;
  evaluations: ApiInitialEval[];
}) {
  const currentMoveRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (currentMoveRef.current[currentIndex]) {
      currentMoveRef.current[currentIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex]);

  if (!positions || !positions.length)
    return (
      <div className="w-64 h-96 bg-gray-800 rounded-lg p-4 text-gray-400">
        Loading
      </div>
    );

  return (
    <div className="w-64 h-96 bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <span className="text-sm text-gray-400">
          Move Classification {currentIndex + 1} / {positions.length}
        </span>
      </div>
      <div className="h-[calc(100%-3rem)] overflow-y-auto p-2 space-y-1">
        {positions?.map((position, index) => (
          <div
            key={index}
            ref={(el) => (currentMoveRef.current[index] = el)}
            className={`flex items-center justify-between px-2 py-1 rounded-md ${
              index === currentIndex ? "bg-gray-700" : ""
            }`}
          >
            <span className="text-sm text-gray-300">
              {index + 1}. {position.san}
            </span>

            {evaluations[index]?.classification &&
            evaluations[index]?.classification === "error" ? (
              <span className="text-red-400 text-xs">Error</span>
            ) : (
              evaluations[index]?.classification && (
                <img
                  src={classificationConfig[evaluations[index].classification!].emoji}
                  alt={evaluations[index].classification}
                  className="w-5 h-5"
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
