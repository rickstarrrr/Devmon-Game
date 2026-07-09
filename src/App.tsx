/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GameProvider, useGame } from "./context/GameContext";
import { BootScreen } from "./components/BootScreen";
import { GameCanvas } from "./components/GameCanvas";
import { VirtualController } from "./components/VirtualController";
import { DialogBox } from "./components/DialogBox";
import { OverlayMenu } from "./components/OverlayMenu";
import { BattleScreen } from "./components/BattleScreen";
import { Toast } from "./components/Toast";
import { Minimap } from "./components/Minimap";
import { MAPS } from "./constants/maps";

const MainGameView: React.FC = () => {
  const {
    gold,
    badges,
    openMenu,
    fadeActive,
    inBattle,
    currentMapId,
    tryMove,
    interact,
    closeMenu,
    menuOpen,
  } = useGame();

  const [booted, setBooted] = useState(false);

  // Keyboard binding for desktop users
  useEffect(() => {
    if (!booted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Prevent scrolling when pressing arrow keys or space
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (key === "arrowup" || key === "w") {
        tryMove(0, -1);
      } else if (key === "arrowdown" || key === "s") {
        tryMove(0, 1);
      } else if (key === "arrowleft" || key === "a") {
        tryMove(-1, 0);
      } else if (key === "arrowright" || key === "d") {
        tryMove(1, 0);
      } else if (e.key === "Enter" || key === "e" || e.key === " ") {
        interact();
      } else if (key === "escape" || key === "x" || key === "b") {
        if (menuOpen) {
          closeMenu();
        }
      } else if (key === "m") {
        openMenu("main");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [booted, tryMove, interact, closeMenu, menuOpen]);

  // If game is not yet started, show BootScreen
  if (!booted) {
    return <BootScreen onStart={() => setBooted(true)} />;
  }

  return (
    <div className="w-full h-full relative bg-[#16201a] overflow-hidden select-none shadow-inner flex flex-col">
      {/* Game Map Rendering Canvas */}
      <GameCanvas />

      {/* HUD Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-end items-center z-30 pointer-events-none select-none">
        <div className="flex gap-2 pointer-events-auto">
          {/* Middle Left: Bits Display */}
          <div className="bg-neutral-950/85 text-white border border-[#41E0A3] px-2.5 py-1 rounded-sm text-[9px] font-mono font-black tracking-wider uppercase shadow-md flex items-center gap-1">
            <span className="text-yellow-500">💰</span> {gold} bits
          </div>

          {/* Middle Right: Stakeholders Display */}
          <div className="bg-neutral-950/85 text-white border border-[#41E0A3] px-2.5 py-1 rounded-sm text-[9px] font-mono font-black tracking-wider uppercase shadow-md flex items-center gap-1.5">
            <span className="text-[#41E0A3]">⬡</span> {badges.length}/4 STAKEHOLDER
          </div>

          {/* Right: Menu Launcher */}
          <button
            onClick={() => openMenu("main")}
            className="bg-neutral-950/85 hover:bg-neutral-900 border border-[#41E0A3] text-white px-2.5 py-1 rounded-sm text-[9px] font-mono font-black tracking-widest cursor-pointer active:scale-95 transition-all shadow-md uppercase"
          >
            MENU
          </button>
        </div>
      </div>

      {/* Modal views layer: Overlays, Battle Screens, Dialog panels */}
      <Minimap />
      <OverlayMenu />
      <BattleScreen />
      <DialogBox />
      <Toast />

      {/* Controls Overlay */}
      {!inBattle && <VirtualController />}

      {/* Map Transition Fade overlay */}
      <div
        className={`absolute inset-0 bg-neutral-950 z-49 pointer-events-none transition-opacity duration-300 ${
          fadeActive ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <div className="w-full h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 overflow-hidden relative">
        {/* Matrix ambient background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

        {/* Handheld Case Shell */}
        <div className="w-full max-w-[420px] h-full max-h-[820px] md:h-[95vh] md:rounded-2xl md:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.95)] md:border-[6px] md:border-neutral-800 relative overflow-hidden flex flex-col bg-neutral-950">
          <MainGameView />
        </div>
      </div>
    </GameProvider>
  );
}
