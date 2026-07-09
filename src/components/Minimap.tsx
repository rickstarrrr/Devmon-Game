/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { useGame } from "../context/GameContext";
import { MAPS } from "../constants/maps";
import { motion, AnimatePresence } from "motion/react";
import { Map, Minimize2, Compass } from "lucide-react";

export const Minimap: React.FC = () => {
  const { px, py, currentMapId, inBattle } = useGame();
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const stored = localStorage.getItem("devmon_minimap_open");
      return stored === "true";
    } catch {
      return false;
    }
  });

  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

  // Callback ref guarantees we capture the canvas element reliably when it mounts
  const canvasRef = useCallback((node: HTMLCanvasElement | null) => {
    setCanvasElement(node);
  }, []);

  // Toggle open state and persist to localStorage
  const toggleMinimap = () => {
    setIsOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("devmon_minimap_open", String(next));
      } catch (e) {}
      return next;
    });
  };

  // Keyboard shortcut: Press "N" or "n" to toggle the minimap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inBattle) return;
      if (e.key.toLowerCase() === "n") {
        toggleMinimap();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inBattle]);

  // Redraw loop utilizing requestAnimationFrame to keep player pulse animated in real-time
  useEffect(() => {
    if (!isOpen || inBattle || !canvasElement) return;

    let animFrameId: number;

    const draw = () => {
      const canvas = canvasElement;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animFrameId = requestAnimationFrame(draw);
        return;
      }

      const mapData = MAPS[currentMapId];
      if (!mapData) {
        animFrameId = requestAnimationFrame(draw);
        return;
      }

      const grid = mapData.grid;
      const rows = grid.length;
      const cols = grid[0].length;
      const scale = 8; // Larger, clearer pixel scale

      // Dynamically resize canvas to match the current grid exactly
      const targetWidth = cols * scale;
      const targetHeight = rows * scale;
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.imageSmoothingEnabled = false;

      // Cohesive palette matching the main game canvas TILE_COLORS
      const TILE_COLORS: Record<number, string> = {
        0: "#7cc66f", // Grass
        1: "#2e3a2e", // Tree wall
        2: "#d9c98a", // Path
        3: "#4d96ff", // Water
        4: "#3f8a3a", // Tall grass
        5: "#8a6d3f", // Door/exit
      };

      // 1. Draw grid cells
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tile = grid[r][c];
          ctx.fillStyle = TILE_COLORS[tile] || "#2e3a2e";
          ctx.fillRect(c * scale, r * scale, scale, scale);

          // Subtle coordinate grid overlay for a high-tech/tactical radar feel
          ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
          ctx.fillRect(c * scale, r * scale, 1, scale);
          ctx.fillRect(c * scale, r * scale, scale, 1);
        }
      }

      // 2. Draw exits
      if (mapData.exits) {
        mapData.exits.forEach((exit) => {
          const ew = exit.w || 1;
          const eh = exit.h || 1;
          // Translucent highlighted overlay
          ctx.fillStyle = "rgba(234, 179, 8, 0.25)";
          ctx.fillRect(exit.x * scale, exit.y * scale, ew * scale, eh * scale);

          // Stroke outline
          ctx.strokeStyle = "rgba(234, 179, 8, 0.8)";
          ctx.lineWidth = 1;
          ctx.strokeRect(exit.x * scale + 0.5, exit.y * scale + 0.5, ew * scale - 1, eh * scale - 1);
        });
      }

      // 3. Draw NPCs with professional styling
      if (mapData.npcs) {
        mapData.npcs.forEach((npc) => {
          let npcColor = "#9ca3af"; // Default gray
          let isSpecial = false;

          if (npc.leader) {
            npcColor = "#a855f7"; // Boss/Gym Leader (Purple)
            isSpecial = true;
          } else if (npc.shop) {
            npcColor = "#3b82f6"; // Vendor (Blue)
            isSpecial = true;
          } else if (npc.trainer) {
            npcColor = "#f43f5e"; // Trainer (Rose Red)
            isSpecial = true;
          } else if (npc.sprite === "sign") {
            npcColor = "#854d0e"; // Sign (Brown)
          }

          const npcX = npc.x * scale + scale / 2;
          const npcY = npc.y * scale + scale / 2;

          ctx.beginPath();
          ctx.arc(npcX, npcY, scale * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = npcColor;
          ctx.fill();

          if (isSpecial) {
            // Bright center core for major characters
            ctx.beginPath();
            ctx.arc(npcX, npcY, scale * 0.15, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
          }
        });
      }

      // 4. Draw Player with glowing, smooth real-time pulse animation
      const centerX = px * scale + scale / 2;
      const centerY = py * scale + scale / 2;
      const pulse = Math.sin(Date.now() / 150) * 0.2 + 1.0;

      // Glow ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, scale * 1.15 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
      ctx.fill();

      // Sharp indicator
      ctx.beginPath();
      ctx.arc(centerX, centerY, scale * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = "#ff003c";
      ctx.fill();

      // White core
      ctx.beginPath();
      ctx.arc(centerX, centerY, scale * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      animFrameId = requestAnimationFrame(draw);
    };

    animFrameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameId);
  }, [px, py, currentMapId, isOpen, inBattle, canvasElement]);

  if (inBattle) return null;

  const currentMapLabel = MAPS[currentMapId]?.label || "UNKNOWN ZONE";
  const gridRows = MAPS[currentMapId]?.grid?.length || 0;
  const gridCols = MAPS[currentMapId]?.grid?.[0]?.length || 0;
  const scaleValue = 8;

  return (
    <div id="game-minimap-container" className="absolute top-4 left-4 z-40 font-mono select-none">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="minimap-expanded"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="bg-neutral-950/90 border border-[#41E0A3]/50 rounded-lg p-2.5 shadow-2xl flex flex-col items-center gap-1.5 backdrop-blur-sm w-fit"
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between border-b border-neutral-800/60 pb-1.5 gap-4">
              <span className="text-[8px] text-[#41E0A3] font-black tracking-widest uppercase truncate max-w-[120px]" title={currentMapLabel}>
                🛰️ {currentMapLabel.replace(/FEATURE \d+: /, "")}
              </span>
              <button
                onClick={toggleMinimap}
                className="text-neutral-400 hover:text-[#41E0A3] transition-colors p-0.5 rounded cursor-pointer active:scale-95"
                title="Collapse Map (N)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Canvas Container with dynamic padding fitting the exact size of grid */}
            <div
              className="bg-neutral-900/60 p-1 rounded border border-neutral-800/80 flex items-center justify-center overflow-hidden"
              style={{
                width: `${gridCols * scaleValue + 10}px`,
                height: `${gridRows * scaleValue + 10}px`,
              }}
            >
              <canvas
                ref={canvasRef}
                className="block image-render-pixelated rounded-sm shadow-md"
                style={{
                  imageRendering: "pixelated",
                  width: `${gridCols * scaleValue}px`,
                  height: `${gridRows * scaleValue}px`,
                }}
              />
            </div>

            {/* Coordinates / Status footer */}
            <div className="w-full flex justify-between items-center text-[7px] text-neutral-400 border-t border-neutral-900 pt-1.5 uppercase font-bold px-0.5 gap-3">
              <span className="flex items-center gap-1">
                <Compass className="w-2.5 h-2.5 text-[#41E0A3]" /> X:{px} Y:{py}
              </span>
              <span className="text-neutral-500 font-medium">
                [GRID:{gridCols}x{gridRows}]
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="minimap-collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={toggleMinimap}
            className="bg-neutral-950/90 hover:bg-neutral-900 border border-[#41E0A3]/50 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-[8.5px] font-black text-neutral-200 uppercase tracking-widest cursor-pointer active:scale-95 transition-all shadow-lg backdrop-blur-sm"
            title="Expand Map (N)"
          >
            <Map className="w-3.5 h-3.5 text-[#41E0A3]" />
            <span>MAP (N)</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
