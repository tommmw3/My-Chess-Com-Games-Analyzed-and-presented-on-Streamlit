import React, { useState } from "react";
import { Chess } from "chess.js";
import { useNavigate } from "react-router-dom";
import usePgnStore from "../../../lib/store/usePgnStore";
import { ImportModal } from "../../modal";
import { appIcons } from "../../board/icons";
import { findOpening } from "../../../lib/openings/find-opening";

export default function Home() {
  const { setPositions, setGameHeaders, setOpening } = usePgnStore();
  const navigate = useNavigate();
  const [importPlatform, setImportPlatform] = useState<
    "chess.com" | "lichess" | null
  >(null);
  const [loading, setLoading] = useState(false);

  const samplePgn = `
    [Event "Scholar's Mate"]
    [Site "?"]
    [Date "2024.12.13"]
    [Round "?"]
    [White "White"]
    [Black "Black"]
    [Result "1-0"]

    1. e4 e5 
    2. Nf3 f6 
    3. Ne5 1-0
  `;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pgn = (formData.get("pgn") as string).trim();

    try {
      setLoading(true);
      const chess = new Chess();
      chess.loadPgn(pgn);

      const positions = chess.history({ verbose: true });
      const headers = chess.getHeaders();
      const opening = findOpening(positions as Position[]);

      setGameHeaders(headers);
      setPositions(positions as Position[]);
      setOpening(opening);

      navigate("/analysis");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1e1e1e] p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <img src={appIcons.mainIcon} alt="Chess" className="w-8 h-8" />
          Free Game Review
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-gray-300 text-sm font-medium">
            Paste your PGN below:
          </label>
          <textarea
            name="pgn"
            defaultValue={samplePgn}
            className="w-full h-64 p-3 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-xl font-medium hover:bg-blue-500 transition disabled:opacity-50"
          >
            {loading ? "Loading Opening" : "Analyze"}
          </button>
        </form>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setImportPlatform("chess.com")}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-800 text-white rounded-lg text-xl font-medium hover:bg-gray-700 transition"
          >
            Import from
            <img
              src={appIcons.ChessComIcon}
              alt="Chess.com"
              className="w-6 h-6 ml-2"
            />
          </button>
          <button
            onClick={() => setImportPlatform("lichess")}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-800 text-white rounded-lg text-xl font-medium hover:bg-gray-700 transition"
          >
            Import from
            <img
              src={appIcons.LichessIcon}
              alt="Lichess"
              className="w-6 h-6 ml-2"
            />
            Lichess
          </button>
        </div>
        <ImportModal
          isOpen={!!importPlatform}
          onClose={() => setImportPlatform(null)}
          platform={importPlatform || "chess.com"}
        />
      </div>
    </div>
  );
}
