import { useCallback } from "react";
import { Chess } from "chess.js";

// Sound URLs - using free sound effects from the web
// These are placeholder sounds - in production you'd host your own
const soundUrls: Record<string, string> = {
  movePiece: "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3",
  capturePiece: "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3",
  check: "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3",
  castle: "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/castle.mp3",
  promote: "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/promote.mp3",
  gameStart: "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-start.mp3",
  gameEnd: "https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3",
};

const sounds: Record<string, HTMLAudioElement> = {};

// Initialize sounds lazily
const getSound = (name: string): HTMLAudioElement | null => {
  if (!sounds[name] && soundUrls[name]) {
    try {
      sounds[name] = new Audio(soundUrls[name]);
      sounds[name].crossOrigin = "anonymous";
    } catch {
      return null;
    }
  }
  return sounds[name] || null;
};

const useChessSounds = () => {
  const chess = new Chess();

  const playSound = useCallback((soundName: string) => {
    const sound = getSound(soundName);

    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Silently fail - sound playback is not critical
      });
    }
  }, []);

  const handleMoveSounds = useCallback(
    (position: Position) => {
      chess.load(position.before);

      const move = chess.move({
        from: position.from,
        to: position.to,
        promotion: "q",
      });

      if (!move) {
        console.error("Invalid move:", position);
        return;
      }

      if (move.captured && !move.promotion && !chess.isGameOver()) {
        playSound(chess.isCheck() ? "check" : "capturePiece");
      } else if (move.san.includes("+")) {
        playSound("check");
      } else if (chess.isGameOver()) {
        playSound("gameEnd");
      } else if (move.san === "O-O" || move.san === "O-O-O") {
        playSound("castle");
      } else if (move.promotion) {
        playSound("promote");
      } else {
        playSound("movePiece");
      }
    },
    [chess, playSound]
  );

  return { playSound, handleMoveSounds };
};

export default useChessSounds;
