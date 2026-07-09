/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useGame } from "../context/GameContext";
import { unlockAudio } from "../utils/audio";

export const BootScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { startGame } = useGame();
  const [hasSave, setHasSave] = useState(false);
  const [saveTimeStr, setSaveTimeStr] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("devmon_save_v1");
      if (raw) {
        const payload = JSON.parse(raw);
        if (payload && payload.player) {
          setHasSave(true);
          const savedTime = payload.savedAt || Date.now();
          const d = new Date(savedTime);
          if (!isNaN(d.getTime())) {
            setSaveTimeStr(
              `Save found: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            );
          } else {
            setSaveTimeStr("Save found (date unknown)");
          }
        }
      }
    } catch (e) {
      setHasSave(false);
    }
  }, []);

  const handleAction = (load: boolean) => {
    unlockAudio();
    startGame(load);
    onStart();
  };

  return (
    <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center z-50 text-neutral-100 select-none font-mono">
      {/* Matrix background inside the screen */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center z-10"
      >
        <div className="text-[10px] tracking-[0.25em] text-neutral-500 font-bold mb-1.5 uppercase">
          ▲ DEVMON GAME SYSTEM
        </div>
        <h1 className="text-6xl font-display font-black tracking-tighter text-white italic uppercase leading-none drop-shadow-[0_4px_12px_rgba(59,130,246,0.35)]">
          DEVMON
        </h1>
        <div className="text-[10px] text-blue-400 mt-2.5 tracking-[0.2em] font-bold">
          A Plopz Game
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col gap-3 mt-12 w-52 z-10"
      >
        <button
          onClick={() => handleAction(false)}
          className="bg-blue-600 hover:bg-blue-500 border border-blue-400 text-white text-xs tracking-[0.15em] py-3.5 rounded-lg font-black uppercase shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          NEW GAME
        </button>

        <button
          onClick={() => handleAction(true)}
          disabled={!hasSave}
          className={`border text-xs tracking-[0.15em] py-3.5 rounded-lg font-black uppercase transition-all ${
            hasSave
              ? "bg-neutral-900 border-neutral-700 text-neutral-100 hover:bg-neutral-800 active:scale-[0.98] cursor-pointer shadow-md"
              : "border-neutral-800 text-neutral-600 bg-neutral-950/40 cursor-not-allowed opacity-40"
          }`}
        >
          LOAD GAME
        </button>
      </motion.div>

      {saveTimeStr && (
        <div className="text-[9px] text-neutral-500 mt-6 tracking-wide max-w-[80%] text-center uppercase font-bold z-10">
          💾 {saveTimeStr}
        </div>
      )}

      <div className="absolute bottom-8 text-[9px] text-neutral-600 tracking-[0.15em] font-black uppercase">
        PRODUCT // DEV // AGILE
      </div>
    </div>
  );
};
