import React, { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import { fenToBoard, isLightSquare, Piece } from "./utils";
import PlayerInfo from "./PlayerInfo";
import { FiRefreshCw } from "react-icons/fi";
import { classificationConfig, pieceSymbols } from "./icons";
import { FaSpinner } from "react-icons/fa";
import EvalBar from "./eval-bar";

export default function Chessboard({
  initialFen,
  lastMove,
  initialArrows = [],
  boardWidth,
  whitePlayer,
  blackPlayer,
  showArrows,
  evaluation,
}: ChessboardProps) {
  const [board, setBoard] = useState<Piece[][]>(fenToBoard(initialFen));
  const [customSquares, setCustomSquares] = useState<
    Record<Square, CustomSquare>
  >({} as Record<Square, CustomSquare>);
  const [error, setError] = useState<string | null>(null);
  const [kingInCheck, setKingInCheck] = useState<Square | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>(initialArrows);
  const [isFlipped, setIsFlipped] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadPosition(initialFen);
    document.addEventListener("contextmenu", (e) => e.preventDefault());
  }, [initialFen]);

  useEffect(() => {
    setArrows(initialArrows);
    drawArrows();
  }, [initialArrows, lastMove, initialFen]);

  useEffect(() => {
    drawArrows();
  }, [arrows, showArrows, isFlipped]);

  const getPieceSymbol = (piece: Piece) => {
    return pieceSymbols[piece];
  };

  const getSquareStyle = (row: number, col: number) => {
    const squareName = `${String.fromCharCode(
      97 + (isFlipped ? 7 - col : col)
    )}${isFlipped ? row + 1 : 8 - row}` as Square;
    const style: React.CSSProperties = {};

    if (customSquares[squareName]?.color) {
      style.backgroundColor = customSquares[squareName].color;
    }

    const bgColor =
      (lastMove && classificationConfig[lastMove.classification].color) ||
      classificationConfig["null"].color;

    if (lastMove && squareName === lastMove.to) {
      style.backgroundColor = bgColor;
    }
    if (lastMove && squareName === lastMove.from) {
      style.backgroundColor = bgColor;
    }

    if (kingInCheck === squareName) {
      style.boxShadow = "inset 0 0 10px rgba(255, 0, 0, 0.6)";
      style.backgroundColor = "red";
    }

    return style;
  };

  const loadPosition = (fenToLoad: string) => {
    try {
      const newChess = new Chess(fenToLoad);
      setBoard(fenToBoard(newChess.fen()));
      setCustomSquares({} as Record<Square, CustomSquare>);
      setError(null);

      const turn = newChess.turn();
      if (newChess.inCheck()) {
        const kingSquare = newChess
          .board()
          .reduce((acc: Square | null, row, rowIndex) => {
            if (acc) return acc;
            const colIndex = row.findIndex(
              (piece) => piece?.type === "k" && piece.color === turn
            );
            return colIndex !== -1
              ? (`${String.fromCharCode(97 + colIndex)}${
                  8 - rowIndex
                }` as Square)
              : null;
          }, null);
        setKingInCheck(kingSquare);
      } else {
        setKingInCheck(null);
      }
    } catch {
      setError("Invalid FEN string. Please check and try again.");
    }
  };

  const drawArrows = () => {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    if (!canvas || !board) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showArrows) return;

    const drawSingleArrow = (arrow: Arrow) => {
      const fromSquare = board.querySelector(
        `[data-square="${arrow.from}"]`
      ) as HTMLElement;
      const toSquare = board.querySelector(
        `[data-square="${arrow.to}"]`
      ) as HTMLElement;

      if (fromSquare && toSquare) {
        const fromRect = fromSquare.getBoundingClientRect();
        const toRect = toSquare.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();

        const scaleX = canvas.width / boardRect.width;
        const scaleY = canvas.height / boardRect.height;

        const startX =
          (fromRect.left + fromRect.width / 2 - boardRect.left) * scaleX;
        const startY =
          (fromRect.top + fromRect.height / 2 - boardRect.top) * scaleY;
        const endX = (toRect.left + toRect.width / 2 - boardRect.left) * scaleX;
        const endY = (toRect.top + toRect.height / 2 - boardRect.top) * scaleY;

        ctx.strokeStyle = arrow.color;
        ctx.lineWidth = arrow.size * scaleX;
        ctx.lineCap = "round";

        const angle = Math.atan2(endY - startY, endX - startX);
        const arrowHeadLength = 15 * scaleX;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(
          endX - arrowHeadLength * Math.cos(angle),
          endY - arrowHeadLength * Math.sin(angle)
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
          endY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
          endY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = arrow.color;
        ctx.fill();
      }
    };

    arrows.forEach(drawSingleArrow);
  };

  const handleFlipBoard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center">
      <PlayerInfo {...(isFlipped ? whitePlayer : blackPlayer)} isTop={true} />
      <div className="flex items-center gap-2">
        <EvalBar evaluation={evaluation} height="500px" isFlipped={isFlipped} />
        <div
          ref={boardRef}
          className="grid grid-cols-8 border-2 border-gray-600 relative"
          style={{ width: boardWidth, height: boardWidth }}
        >
          <canvas
            ref={canvasRef}
            width={boardWidth}
            height={boardWidth}
            className="absolute top-0 left-0 pointer-events-none z-10"
          />
          {(isFlipped ? [...board].reverse() : board).map((row, rowIndex) =>
            (isFlipped ? [...row].reverse() : row).map((piece, colIndex) => {
              const square = `${String.fromCharCode(
                97 + (isFlipped ? 7 - colIndex : colIndex)
              )}${isFlipped ? rowIndex + 1 : 8 - rowIndex}` as Square;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  data-square={square}
                  className={`aspect-square flex items-center justify-center relative ${
                    isLightSquare(rowIndex, colIndex)
                      ? "bg-[#ebecd0]"
                      : "bg-[#779556]"
                  }`}
                  style={getSquareStyle(rowIndex, colIndex)}
                >
                  {piece && (
                    <img
                      src={getPieceSymbol(piece)}
                      alt={piece}
                      className="w-[85%] h-[85%] object-contain"
                    />
                  )}

                  {lastMove &&
                    lastMove.classification === "brilliant" &&
                    lastMove.to === square && (
                      <img
                        src={classificationConfig["brilliant"].emoji}
                        alt="brilliant"
                        className="animate-brilliant-icon w-1/2 h-1/2 absolute -top-3 -right-0 z-20"
                      />
                    )}
                  {lastMove &&
                    lastMove.classification !== "brilliant" &&
                    lastMove.classification !== "null" &&
                    lastMove.to === square && (
                      <img
                        src={classificationConfig[lastMove.classification].emoji}
                        alt={lastMove.classification}
                        className="w-1/2 h-1/2 absolute -top-3 -right-0 z-20"
                      />
                    )}
                  {lastMove &&
                    lastMove.classification === "null" &&
                    lastMove.to === square && (
                      <FaSpinner className="w-1/2 h-1/2 absolute -top-3 -right-0 z-20 animate-spin text-yellow-400" />
                    )}
                </div>
              );
            })
          )}
        </div>
        <button
          onClick={handleFlipBoard}
          className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50"
        >
          <FiRefreshCw />
        </button>
      </div>
      <PlayerInfo {...(isFlipped ? blackPlayer : whitePlayer)} isTop={false} />
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}
