import { useEffect, useState } from "react";
import usePgnStore from "../../../lib/store/usePgnStore";
import Chessboard from "../../board/Chessboard";
import MoveList from "../../board/MoveList";
import {
  FaStepBackward,
  FaStepForward,
  FaFastBackward,
  FaFastForward,
  FaPlay,
  FaPause,
} from "react-icons/fa";

import useChessSounds from "../../../lib/hooks/useSound";
import { apiInitialEval } from "./evaluation";
import { Chess } from "chess.js";
import { classifyMove } from "./classifications";
import { appIcons } from "../../board/icons";
import { Navigate } from "react-router-dom";

export default function ChessViewer() {
  const INITIAL_BOARD_FEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const { positions: parsedPositions, gameHeaders, opening } = usePgnStore();
  const { handleMoveSounds } = useChessSounds();

  // State management
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentFen, setCurrentFen] = useState(INITIAL_BOARD_FEN);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [evaluations, setEvaluations] = useState<ApiInitialEval[]>([
    apiInitialEval,
  ]);
  const [loading, setLoading] = useState(false);
  const [showSuggestionArrows, setShowSuggestionArrows] = useState(false);
  const [avgAccuracy, setAvgAccuracy] = useState<Accuracy>({
    white: 0,
    black: 0,
  });

  useEffect(() => {
    if (parsedPositions?.length) {
      setPositions(parsedPositions);
      resetToStart();
    }
  }, [parsedPositions]);

  const reviewPosition = async (
    position: Position,
    depth = 18
  ): Promise<ApiInitialEval> => {
    const game = new Chess(position.after);
    const isCheckMate = game.isCheckmate();
    const isDraw = game.isDraw();

    if (isCheckMate || isDraw) {
      return {
        isCheckMate,
        isDraw,
        error: true,
      } as ApiInitialEval;
    }

    try {
      const res = await fetch(`https://chess-api.com/v1`, {
        method: "POST",
        body: JSON.stringify({
          fen: position.after,
          depth,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        cache: "force-cache",
      });
      const data = await res.json();
      console.log(data);

      return data;
    } catch (error: unknown) {
      console.log("Request timed out, using fallback evaluation...");
      console.error("Error in reviewPosition:", error);
      return {
        error: true,
        message: error instanceof Error ? error.message : "Unknown error",
      } as ApiInitialEval;
    }
  };

  // Navigation functions
  const resetToStart = () => {
    setCurrentIndex(-1);
    setCurrentFen(INITIAL_BOARD_FEN);
  };

  const jumpToEnd = () => {
    if (!positions.length) return;
    setCurrentIndex(positions.length - 1);
    setCurrentFen(positions[positions.length - 1].after);
  };

  const handleNextMove = async () => {
    if (!positions.length || currentIndex >= positions.length - 1) return;
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setCurrentFen(positions[nextIndex].after);
    handleMoveSounds(positions[nextIndex]);

    setLoading(true);

    //Check if the evaluation already exists in the state
    if (evaluations[nextIndex + 1]) {
      setLoading(false);
      return;
    }

    const currentEvaluation = await reviewPosition(positions[nextIndex]);

    if (
      currentEvaluation.error ||
      currentEvaluation.isCheckMate ||
      currentEvaluation.isDraw
    ) {
      setLoading(false);
      return;
    }

    setEvaluations((prev) => [...prev, currentEvaluation]);

    const prevEvaluation = evaluations[currentIndex + 1];

    const { classification, accuracy } = classifyMove(
      positions[nextIndex],
      currentEvaluation,
      prevEvaluation,
      opening,
      positions[nextIndex],
      nextIndex
    );

    //Update the last evalution with the classification
    setEvaluations((prev) => {
      const updatedEvaluations = [...prev];
      updatedEvaluations[evaluations.length - 1] = {
        ...updatedEvaluations[evaluations.length - 1],
        classification,
        accuracy,
      };
      return updatedEvaluations;
    });

    setLoading(false);
    return;
  };

  const handlePreviousMove = () => {
    if (currentIndex === -1) return;
    const prevIndex = currentIndex - 1;

    if (prevIndex === -1) {
      resetToStart();
    } else {
      setCurrentIndex(prevIndex);
      setCurrentFen(positions[prevIndex].after);
      handleMoveSounds(positions[prevIndex]);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const getCurrentMove = (): MoveInfo | null => {
    if (currentIndex === -1 || !positions[currentIndex]) return null;
    return {
      from: positions[currentIndex].from,
      to: positions[currentIndex].to,
      classification: evaluations[currentIndex]?.classification || "null",
    };
  };

  const getBestMove = () => {
    const wasBestMove = evaluations[currentIndex + 1]?.move;
    if (!wasBestMove) return [];
    const from = wasBestMove.slice(0, 2);
    const to = wasBestMove.slice(2);

    return [
      {
        from,
        to,
        color: "green",
        size: 10,
      },
    ];
  };

  const handleSuggestionArrowsToggle = () => {
    setShowSuggestionArrows(!showSuggestionArrows);
  };

  const calculateAverageAccuracy = () => {
    let whiteTotal = 0;
    let blackTotal = 0;
    let whiteCount = 0;
    let blackCount = 0;

    evaluations.forEach((evaluation, index) => {
      if (evaluation.accuracy && !evaluation.error) {
        if (positions[index]?.color === "w") {
          whiteTotal += evaluation.accuracy;
          whiteCount++;
        } else {
          blackTotal += evaluation.accuracy;
          blackCount++;
        }
      }
    });

    setAvgAccuracy({
      white: whiteCount > 0 ? whiteTotal / whiteCount : 0,
      black: blackCount > 0 ? blackTotal / blackCount : 0,
    });
  };

  useEffect(() => {
    calculateAverageAccuracy();
  }, [evaluations]);

  if (!parsedPositions) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center min-h-screen bg-[#1e1e1e] p-4 gap-4">
      <div className="flex flex-col items-center">
        <Chessboard
          initialFen={currentFen}
          lastMove={getCurrentMove()}
          initialArrows={getBestMove()}
          boardWidth={500}
          whitePlayer={{
            name: gameHeaders?.White || "White",
            image: appIcons.mainIcon,
            rating: gameHeaders?.WhiteElo || "?",
            title: gameHeaders?.WhiteTitle || "",
          }}
          blackPlayer={{
            name: gameHeaders?.Black || "Black",
            image: appIcons.mainIcon,
            rating: gameHeaders?.BlackElo || "?",
            title: gameHeaders?.BlackTitle || "",
          }}
          showArrows={showSuggestionArrows}
          evaluation={evaluations[currentIndex + 1]?.eval || 0}
        />

        {/* Navigation controls */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            className={`p-3 rounded-lg ${
              currentIndex === -1
                ? "bg-gray-700/30 cursor-not-allowed"
                : "bg-gray-700/50 hover:bg-gray-600/50"
            }`}
            onClick={resetToStart}
            disabled={currentIndex === -1}
          >
            <FaFastBackward />
          </button>
          <button
            className={`p-3 rounded-lg ${
              currentIndex === -1
                ? "bg-gray-700/30 cursor-not-allowed"
                : "bg-gray-700/50 hover:bg-gray-600/50"
            }`}
            onClick={handlePreviousMove}
            disabled={currentIndex === -1}
          >
            <FaStepBackward />
          </button>

          <button
            className="p-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50"
            onClick={toggleAutoPlay}
          >
            {isAutoPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <button
            className={`p-3 rounded-lg ${
              !positions.length || currentIndex >= positions.length - 1
                ? "bg-gray-700/30 cursor-not-allowed"
                : "bg-gray-700/50 hover:bg-gray-600/50"
            }`}
            onClick={handleNextMove}
            disabled={
              !positions.length ||
              currentIndex >= positions.length - 1 ||
              loading
            }
          >
            <FaStepForward />
          </button>

          <button
            className={`p-3 rounded-lg ${
              !positions.length || currentIndex >= positions.length - 1
                ? "bg-gray-700/30 cursor-not-allowed"
                : "bg-gray-700/50 hover:bg-gray-600/50"
            }`}
            onClick={jumpToEnd}
            disabled={
              !positions.length || currentIndex >= positions.length - 1
            }
          >
            <FaFastForward />
          </button>
        </div>

        {/* Move indicator */}
        <div className="mt-4 text-gray-300">
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Accuracy White: {avgAccuracy?.white?.toFixed(2)}%
            </span>
            <span className="text-sm">
              Accuracy Black: {avgAccuracy?.black?.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-300">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showSuggestionArrows}
              onChange={handleSuggestionArrowsToggle}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="text-sm">Show suggestion arrows</span>
        </div>
        <div className="text-gray-400 text-sm">
          {opening?.name}
        </div>

        <MoveList
          positions={positions}
          currentIndex={currentIndex}
          evaluations={evaluations}
        />
      </div>
    </div>
  );
}
