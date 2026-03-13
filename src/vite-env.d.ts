/// <reference types="vite/client" />

type classification =
  | "brilliant"
  | "great"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "book"
  | "null"
  | "error";

interface ApiInitialEval {
  error?: boolean;
  text: string;
  fen: string;
  type: string;
  depth: number;
  move: string | null;
  eval: number;
  centipawns: number;
  mate: number | null;
  debug: string;
  taskId: string;
  color: string;
  piece: string;
  from: string;
  to: string;
  san: string;
  classification?: classification;
  accuracy?: number;
  isCheckMate?: boolean;
  isDraw?: boolean;
  message?: string;
}

interface Position {
  color: string;
  from: string;
  to: string;
  piece: string;
  flags: string;
  san: string;
  lan: string;
  before: string;
  after: string;
}

interface CustomSquare {
  color?: string;
  emoji?: string;
}

interface MoveInfo {
  from: string;
  to: string;
  classification: classification;
  color?: string;
}

interface Arrow {
  from: string;
  to: string;
  color: string;
  size: number;
}

interface PlayerInfoProps {
  name: string;
  image: string;
  rating: string;
  title: string;
  isTop?: boolean;
}

interface ChessboardProps {
  initialFen: string;
  lastMove?: MoveInfo | null;
  initialArrows?: Arrow[];
  boardWidth: number;
  whitePlayer: PlayerInfoProps;
  blackPlayer: PlayerInfoProps;
  showArrows: boolean;
  evaluation: number;
}

interface Accuracy {
  white: number;
  black: number;
}

interface Opening {
  pgn: string;
  name: string;
  eco: string;
  moveSan: string[];
}

interface Move {
  lan: string;
}

interface ClassificationResponse {
  classification: classification;
  accuracy: number;
}
