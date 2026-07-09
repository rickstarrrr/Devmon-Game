/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { useGame } from "../context/GameContext";

export const VirtualController: React.FC = () => {
  const { tryMove, interact, closeMenu, menuOpen } = useGame();
  const intervals = useRef<Record<string, number | null>>({});

  const startHold = (direction: "up" | "down" | "left" | "right", dx: number, dy: number, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (intervals.current[direction]) return;

    tryMove(dx, dy);

    // Continuous movement intervals (160ms repeat)
    const id = window.setInterval(() => {
      tryMove(dx, dy);
    }, 165);
    intervals.current[direction] = id;
  };

  const endHold = (direction: "up" | "down" | "left" | "right") => {
    if (intervals.current[direction]) {
      window.clearInterval(intervals.current[direction]!);
      intervals.current[direction] = null;
    }
  };

  const handleActionA = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    interact();
  };

  const handleActionB = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (menuOpen) {
      closeMenu();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[220px] z-40 pointer-events-none select-none font-mono">
      {/* D-Pad Container */}
      <div className="absolute left-4 bottom-5 w-36 h-36 pointer-events-auto">
        {/* Up */}
        <button
          onTouchStart={(e) => startHold("up", 0, -1, e)}
          onTouchEnd={() => endHold("up")}
          onMouseDown={(e) => startHold("up", 0, -1, e)}
          onMouseUp={() => endHold("up")}
          onMouseLeave={() => endHold("up")}
          className="absolute w-12 h-12 left-12 top-0 bg-neutral-900/70 border border-neutral-700 rounded-xl active:bg-blue-600 active:border-blue-400 text-neutral-100 text-lg font-black flex items-center justify-center select-none active:scale-[0.95] transition-all cursor-pointer shadow-lg"
        >
          ▲
        </button>

        {/* Down */}
        <button
          onTouchStart={(e) => startHold("down", 0, 1, e)}
          onTouchEnd={() => endHold("down")}
          onMouseDown={(e) => startHold("down", 0, 1, e)}
          onMouseUp={() => endHold("down")}
          onMouseLeave={() => endHold("down")}
          className="absolute w-12 h-12 left-12 top-24 bg-neutral-900/70 border border-neutral-700 rounded-xl active:bg-blue-600 active:border-blue-400 text-neutral-100 text-lg font-black flex items-center justify-center select-none active:scale-[0.95] transition-all cursor-pointer shadow-lg"
        >
          ▼
        </button>

        {/* Left */}
        <button
          onTouchStart={(e) => startHold("left", -1, 0, e)}
          onTouchEnd={() => endHold("left")}
          onMouseDown={(e) => startHold("left", -1, 0, e)}
          onMouseUp={() => endHold("left")}
          onMouseLeave={() => endHold("left")}
          className="absolute w-12 h-12 left-0 top-12 bg-neutral-900/70 border border-neutral-700 rounded-xl active:bg-blue-600 active:border-blue-400 text-neutral-100 text-lg font-black flex items-center justify-center select-none active:scale-[0.95] transition-all cursor-pointer shadow-lg"
        >
          ◀
        </button>

        {/* Right */}
        <button
          onTouchStart={(e) => startHold("right", 1, 0, e)}
          onTouchEnd={() => endHold("right")}
          onMouseDown={(e) => startHold("right", 1, 0, e)}
          onMouseUp={() => endHold("right")}
          onMouseLeave={() => endHold("right")}
          className="absolute w-12 h-12 left-24 top-12 bg-neutral-900/70 border border-neutral-700 rounded-xl active:bg-blue-600 active:border-blue-400 text-neutral-100 text-lg font-black flex items-center justify-center select-none active:scale-[0.95] transition-all cursor-pointer shadow-lg"
        >
          ▶
        </button>
      </div>

      {/* Action Buttons */}
      <div className="absolute right-4 bottom-5 w-[160px] h-36 pointer-events-auto">
        {/* Button B */}
        <button
          onTouchStart={handleActionB}
          onMouseDown={handleActionB}
          className="absolute bottom-2 left-0 w-16 h-16 bg-[#3b82f6] hover:bg-blue-500 border border-blue-400 text-white rounded-full flex items-center justify-center font-display font-black text-xl select-none active:scale-95 transition-all cursor-pointer shadow-lg"
        >
          B
        </button>

        {/* Button A */}
        <button
          onTouchStart={handleActionA}
          onMouseDown={handleActionA}
          className="absolute top-2 right-0 w-16 h-16 bg-[#ef4444] hover:bg-rose-500 border border-rose-400 text-white rounded-full flex items-center justify-center font-display font-black text-xl select-none active:scale-95 transition-all cursor-pointer shadow-lg"
        >
          A
        </button>
      </div>
    </div>
  );
};
