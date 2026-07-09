/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";
import { MAPS, TILE } from "../constants/maps";
import { SPECIES } from "../constants/creatures";

export const GameCanvas: React.FC = () => {
  const { px, py, facing, moving, currentMapId } = useGame();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Capture mutable values in refs to keep requestAnimationFrame loop clean and performant
  const stateRef = useRef({ px, py, facing, moving, currentMapId });

  useEffect(() => {
    stateRef.current = { px, py, facing, moving, currentMapId };
  }, [px, py, facing, moving, currentMapId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;
    let animationFrameId: number;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const TILE_COLORS: Record<number, string> = {
      0: "#7cc66f", // grass
      1: "#2e3a2e", // tree wall
      2: "#d9c98a", // path
      3: "#4d96ff", // water
      4: "#3f8a3a", // tall grass
      5: "#8a6d3f", // door
    };

    const drawTree = (x: number, y: number, size: number, mx: number = 0, my: number = 0) => {
      const seed = Math.abs(mx * 31 + my * 17);
      
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.beginPath();
      ctx.ellipse(x + size * 0.5, y + size * 0.9, size * 0.35, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      // Trunk
      ctx.fillStyle = "#5a3a22";
      ctx.fillRect(x + size * 0.4, y + size * 0.55, size * 0.2, size * 0.45);
      
      // Determine leaf colors based on coordinates to add natural variety
      let leafColor1 = "#2f6e3a";
      let leafColor2 = "#3f8a4a";
      
      if (seed % 7 === 0) {
        // Golden autumn tree
        leafColor1 = "#b25e1d";
        leafColor2 = "#d97724";
      } else if (seed % 11 === 0) {
        // Red blossoms
        leafColor1 = "#a03d65";
        leafColor2 = "#c25080";
      } else if (seed % 13 === 0) {
        // Deep teal pine
        leafColor1 = "#1a4a40";
        leafColor2 = "#266658";
      }

      ctx.fillStyle = leafColor1;
      ctx.beginPath();
      ctx.ellipse(x + size * 0.5, y + size * 0.4, size * 0.42, size * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = leafColor2;
      ctx.beginPath();
      ctx.ellipse(x + size * 0.38, y + size * 0.32, size * 0.22, size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawGrassBlades = (x: number, y: number, size: number, seed: number) => {
      ctx.strokeStyle = "#5fae53";
      ctx.lineWidth = Math.max(1, size * 0.06);
      const n = 3;
      for (let i = 0; i < n; i++) {
        const bx = x + size * (0.2 + i * 0.3) + (seed % 3) * 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, y + size * 0.9);
        ctx.lineTo(bx - 2, y + size * 0.55);
        ctx.stroke();
      }
    };

    const drawPlayerSprite = (x: number, y: number, dir: string, isMoving: boolean) => {
      const bob = isMoving ? Math.sin(frameCount / 4) * 2 : 0;
      ctx.save();
      ctx.translate(x, y + bob);

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(TILE / 2, TILE * 0.92, TILE * 0.32, TILE * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = "#3a5fcf";
      ctx.fillRect(TILE * 0.22, TILE * 0.35, TILE * 0.56, TILE * 0.5);

      // Head
      ctx.fillStyle = "#ffd9a8";
      ctx.fillRect(TILE * 0.26, TILE * 0.08, TILE * 0.48, TILE * 0.34);

      // Hair
      ctx.fillStyle = "#3a2a1a";
      ctx.fillRect(TILE * 0.24, TILE * 0.04, TILE * 0.52, TILE * 0.14);

      // Eyes based on direction
      ctx.fillStyle = "#1a1a1a";
      if (dir === "down") {
        ctx.fillRect(TILE * 0.34, TILE * 0.22, TILE * 0.07, TILE * 0.07);
        ctx.fillRect(TILE * 0.58, TILE * 0.22, TILE * 0.07, TILE * 0.07);
      } else if (dir === "left") {
        ctx.fillRect(TILE * 0.32, TILE * 0.22, TILE * 0.07, TILE * 0.07);
      } else if (dir === "right") {
        ctx.fillRect(TILE * 0.6, TILE * 0.22, TILE * 0.07, TILE * 0.07);
      }

      // Legs
      ctx.fillStyle = "#222";
      ctx.fillRect(TILE * 0.26, TILE * 0.84, TILE * 0.18, TILE * 0.14);
      ctx.fillRect(TILE * 0.56, TILE * 0.84, TILE * 0.18, TILE * 0.14);
      ctx.restore();
    };

    const drawNpcSprite = (x: number, y: number, kind: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(TILE / 2, TILE * 0.92, TILE * 0.3, TILE * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      if (kind === "sign") {
        // wood post
        ctx.fillStyle = "#7a5230";
        ctx.fillRect(TILE * 0.44, TILE * 0.5, TILE * 0.12, TILE * 0.42);
        ctx.fillStyle = "#a9784a";
        ctx.fillRect(TILE * 0.14, TILE * 0.28, TILE * 0.72, TILE * 0.34);
        ctx.strokeStyle = "#5c3d22";
        ctx.lineWidth = 2;
        ctx.strokeRect(TILE * 0.14, TILE * 0.28, TILE * 0.72, TILE * 0.34);
        ctx.restore();
        return;
      }

      if (kind === "bounty_board") {
        // wood post / framing
        ctx.fillStyle = "#5c3d22"; // dark wood
        ctx.fillRect(TILE * 0.4, TILE * 0.5, TILE * 0.2, TILE * 0.42); // stand post
        
        ctx.fillStyle = "#7a5230"; // main board backing
        ctx.fillRect(TILE * 0.08, TILE * 0.16, TILE * 0.84, TILE * 0.44);
        
        ctx.strokeStyle = "#412a15";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(TILE * 0.08, TILE * 0.16, TILE * 0.84, TILE * 0.44);

        // draw tiny white and yellow poster papers pinned to the board
        ctx.fillStyle = "#fff8e7"; // parchment poster
        ctx.fillRect(TILE * 0.18, TILE * 0.22, TILE * 0.22, TILE * 0.32);
        ctx.strokeStyle = "#cbb185";
        ctx.lineWidth = 1;
        ctx.strokeRect(TILE * 0.18, TILE * 0.22, TILE * 0.22, TILE * 0.32);

        ctx.fillStyle = "#fff"; // second poster
        ctx.fillRect(TILE * 0.48, TILE * 0.24, TILE * 0.18, TILE * 0.26);
        ctx.strokeRect(TILE * 0.48, TILE * 0.24, TILE * 0.18, TILE * 0.26);

        ctx.fillStyle = "#ffe066"; // small yellow highlight/note
        ctx.fillRect(TILE * 0.72, TILE * 0.22, TILE * 0.14, TILE * 0.16);
        
        // draw a red "WANTED" stamp or ribbon on the large poster
        ctx.fillStyle = "#e0415c";
        ctx.fillRect(TILE * 0.22, TILE * 0.26, TILE * 0.14, TILE * 0.06);

        ctx.restore();
        return;
      }

      let bodyColor = "#c0524d";
      let headColor = "#f2c89b";
      if (kind === "npc_prof") bodyColor = "#e8e8e8";
      if (kind === "npc_leader") bodyColor = "#FFD23F";
      if (kind === "npc_shop") bodyColor = "#41A0E0";
      if (kind === "npc_customer") {
        bodyColor = "#E0415C";
        headColor = "#ffe0c0";
      }

      ctx.fillStyle = bodyColor;
      ctx.fillRect(TILE * 0.22, TILE * 0.35, TILE * 0.56, TILE * 0.5);
      ctx.fillStyle = headColor;
      ctx.fillRect(TILE * 0.26, TILE * 0.08, TILE * 0.48, TILE * 0.34);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(TILE * 0.34, TILE * 0.22, TILE * 0.06, TILE * 0.06);
      ctx.fillRect(TILE * 0.58, TILE * 0.22, TILE * 0.06, TILE * 0.06);
      ctx.restore();
    };

    const drawDecoration = (x: number, y: number, type: string) => {
      ctx.save();
      ctx.translate(x, y);

      if (type === "desk") {
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.beginPath();
        ctx.ellipse(TILE / 2, TILE * 0.92, TILE * 0.42, TILE * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#5c3d22";
        ctx.fillRect(TILE * 0.12, TILE * 0.62, TILE * 0.08, TILE * 0.3);
        ctx.fillRect(TILE * 0.8, TILE * 0.62, TILE * 0.08, TILE * 0.3);
        ctx.fillStyle = "#a9784a";
        ctx.fillRect(TILE * 0.06, TILE * 0.5, TILE * 0.88, TILE * 0.16);
        ctx.fillStyle = "#7a5230";
        ctx.fillRect(TILE * 0.06, TILE * 0.62, TILE * 0.88, TILE * 0.06);

        // tiny desk monitor
        ctx.fillStyle = "#2a2a2a";
        ctx.fillRect(TILE * 0.36, TILE * 0.26, TILE * 0.28, TILE * 0.22);
        ctx.fillStyle = "#5fc9e0";
        ctx.fillRect(TILE * 0.39, TILE * 0.29, TILE * 0.22, TILE * 0.15);
        ctx.fillStyle = "#2a2a2a";
        ctx.fillRect(TILE * 0.46, TILE * 0.48, TILE * 0.08, TILE * 0.05);
      } else if (type === "cubicle") {
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.beginPath();
        ctx.ellipse(TILE / 2, TILE * 0.95, TILE * 0.44, TILE * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7f93a8";
        ctx.fillRect(TILE * 0.08, -TILE * 0.55, TILE * 0.84, TILE * 1.45);
        ctx.fillStyle = "#9bacc0";
        ctx.fillRect(TILE * 0.08, -TILE * 0.55, TILE * 0.84, TILE * 0.12);
      } else if (type === "fence_h") {
        // Horizontal wooden fence
        ctx.fillStyle = "#7a5230"; // main wood color
        ctx.fillRect(TILE * 0.1, TILE * 0.25, TILE * 0.14, TILE * 0.65); // Left post
        ctx.fillRect(TILE * 0.76, TILE * 0.25, TILE * 0.14, TILE * 0.65); // Right post
        ctx.fillRect(TILE * 0.1, TILE * 0.38, TILE * 0.8, TILE * 0.1);  // Upper rail
        ctx.fillRect(TILE * 0.1, TILE * 0.62, TILE * 0.8, TILE * 0.1);  // Lower rail
        
        ctx.fillStyle = "rgba(0,0,0,0.16)";
        ctx.fillRect(TILE * 0.1, TILE * 0.88, TILE * 0.14, TILE * 0.06);
        ctx.fillRect(TILE * 0.76, TILE * 0.88, TILE * 0.14, TILE * 0.06);
      } else if (type === "fence_v") {
        // Vertical wooden fence
        ctx.fillStyle = "#7a5230";
        ctx.fillRect(TILE * 0.43, 0, TILE * 0.14, TILE); // Vertical post
        ctx.fillRect(TILE * 0.2, TILE * 0.2, TILE * 0.6, TILE * 0.08); // Top cross rail
        ctx.fillRect(TILE * 0.2, TILE * 0.7, TILE * 0.6, TILE * 0.08); // Bottom cross rail
      } else if (type === "fountain") {
        // Animated Water Fountain
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(TILE / 2, TILE * 0.9, TILE * 0.46, TILE * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stone boundary
        ctx.fillStyle = "#57606f";
        ctx.beginPath();
        ctx.ellipse(TILE / 2, TILE * 0.72, TILE * 0.44, TILE * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Water pool
        ctx.fillStyle = "#2e86de";
        ctx.beginPath();
        ctx.ellipse(TILE / 2, TILE * 0.7, TILE * 0.36, TILE * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fountain center riser
        ctx.fillStyle = "#8395a7";
        ctx.fillRect(TILE * 0.42, TILE * 0.38, TILE * 0.16, TILE * 0.28);

        // Fountain nozzle spray
        ctx.fillStyle = "#ffffff";
        const sprayH = TILE * 0.16 + Math.sin(frameCount / 4.5) * 3;
        ctx.fillRect(TILE * 0.46, TILE * 0.38 - sprayH, TILE * 0.08, sprayH);

        // Spray particles
        const phase = (frameCount % 12) / 12;
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fillRect(TILE * 0.38 - phase * 7, TILE * 0.34 - sprayH + phase * 8, 2, 2);
        ctx.fillRect(TILE * 0.62 + phase * 7, TILE * 0.34 - sprayH + phase * 8, 2, 2);
      } else if (type === "server_rack") {
        // High-tech server rack with blinking light patterns
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(TILE * 0.12, TILE * 0.86, TILE * 0.76, TILE * 0.1);

        ctx.fillStyle = "#2c3e50"; // rack chassis
        ctx.fillRect(TILE * 0.12, TILE * 0.05, TILE * 0.76, TILE * 0.85);
        ctx.strokeStyle = "#3498db";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(TILE * 0.12, TILE * 0.05, TILE * 0.76, TILE * 0.85);

        ctx.fillStyle = "#1e272e";
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(TILE * 0.18, TILE * 0.12 + i * TILE * 0.18, TILE * 0.64, TILE * 0.12);
          
          // Green light blinking
          ctx.fillStyle = (Math.floor(frameCount / 12) + i) % 3 === 0 ? "#2ecc71" : "#1b7a43";
          ctx.fillRect(TILE * 0.25, TILE * 0.16 + i * TILE * 0.18, 2, 2);

          // Orange light blinking
          ctx.fillStyle = (Math.floor(frameCount / 18) + i) % 2 === 0 ? "#e67e22" : "#9e5513";
          ctx.fillRect(TILE * 0.35, TILE * 0.16 + i * TILE * 0.18, 2, 2);

          // Red light flashing
          ctx.fillStyle = (Math.floor(frameCount / 30) + i) % 4 === 1 ? "#e74c3c" : "#7d251a";
          ctx.fillRect(TILE * 0.45, TILE * 0.16 + i * TILE * 0.18, 2, 2);
        }
      } else if (type === "street_lamp") {
        // Glowing lamppost with light beam
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(TILE / 2, TILE * 0.9, TILE * 0.22, TILE * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#2d3436";
        ctx.fillRect(TILE * 0.45, TILE * 0.25, TILE * 0.1, TILE * 0.65); // pole
        ctx.fillStyle = "#535c68";
        ctx.fillRect(TILE * 0.32, TILE * 0.18, TILE * 0.36, TILE * 0.08); // horizontal top

        // Lamp glow
        ctx.fillStyle = "#f1c40f";
        ctx.fillRect(TILE * 0.42, TILE * 0.26, TILE * 0.16, TILE * 0.1);

        // Draw dynamic soft light cone overlaying the map below
        const beamStrength = 0.12 + Math.sin(frameCount / 8) * 0.03;
        ctx.fillStyle = `rgba(241, 196, 15, ${beamStrength})`;
        ctx.beginPath();
        ctx.moveTo(TILE * 0.32, TILE * 0.26);
        ctx.lineTo(TILE * 0.68, TILE * 0.26);
        ctx.lineTo(TILE * 1.15, TILE * 1.0);
        ctx.lineTo(-TILE * 0.15, TILE * 1.0);
        ctx.closePath();
        ctx.fill();
      } else if (type === "flower_patch") {
        // Red, yellow, blue flowers cluster
        const seed = (x * 7 + y * 13) % 3;
        const mainColor = seed === 0 ? "#e74c3c" : seed === 1 ? "#f1c40f" : "#9b59b6";
        const accentColor = seed === 0 ? "#f1c40f" : seed === 1 ? "#ffffff" : "#f39c12";

        // Flower 1
        ctx.fillStyle = "#27ae60";
        ctx.fillRect(TILE * 0.15, TILE * 0.6, TILE * 0.15, TILE * 0.15);
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(TILE * 0.24, TILE * 0.52, TILE * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(TILE * 0.24, TILE * 0.52, TILE * 0.035, 0, Math.PI * 2);
        ctx.fill();

        // Flower 2
        ctx.fillStyle = "#27ae60";
        ctx.fillRect(TILE * 0.55, TILE * 0.4, TILE * 0.15, TILE * 0.15);
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(TILE * 0.64, TILE * 0.32, TILE * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(TILE * 0.64, TILE * 0.32, TILE * 0.03, 0, Math.PI * 2);
        ctx.fill();

        // Flower 3
        ctx.fillStyle = "#27ae60";
        ctx.fillRect(TILE * 0.38, TILE * 0.8, TILE * 0.15, TILE * 0.15);
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(TILE * 0.46, TILE * 0.72, TILE * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(TILE * 0.46, TILE * 0.72, TILE * 0.04, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === "roof_l") {
        // Modular house roof slope left
        ctx.fillStyle = "#7f8c8d"; // backing wall shadow
        ctx.fillRect(TILE * 0.2, TILE * 0.4, TILE * 0.8, TILE * 0.6);
        
        ctx.fillStyle = "#c0392b"; // primary clay roof color
        ctx.beginPath();
        ctx.moveTo(TILE * 1.0, TILE * 0.15);
        ctx.lineTo(TILE * 1.0, TILE * 1.0);
        ctx.lineTo(TILE * 0.25, TILE * 1.0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#962d22"; // roof ridge trim
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(TILE * 1.0, TILE * 0.15);
        ctx.lineTo(TILE * 0.25, TILE * 1.0);
        ctx.stroke();
      } else if (type === "roof_c") {
        // Modular house roof center
        ctx.fillStyle = "#c0392b";
        ctx.fillRect(0, TILE * 0.15, TILE, TILE * 0.85);

        ctx.strokeStyle = "#962d22";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, TILE * 0.42);
        ctx.lineTo(TILE, TILE * 0.42);
        ctx.moveTo(0, TILE * 0.72);
        ctx.lineTo(TILE, TILE * 0.72);
        ctx.stroke();
      } else if (type === "roof_r") {
        // Modular house roof slope right
        ctx.fillStyle = "#7f8c8d";
        ctx.fillRect(0, TILE * 0.4, TILE * 0.8, TILE * 0.6);

        ctx.fillStyle = "#c0392b";
        ctx.beginPath();
        ctx.moveTo(0, TILE * 0.15);
        ctx.lineTo(TILE * 0.75, TILE * 1.0);
        ctx.lineTo(0, TILE * 1.0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#962d22";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, TILE * 0.15);
        ctx.lineTo(TILE * 0.75, TILE * 1.0);
        ctx.stroke();
      } else if (type === "wall_l") {
        // Modular plaster wall left with windows
        ctx.fillStyle = "#bdc3c7";
        ctx.fillRect(TILE * 0.15, 0, TILE * 0.85, TILE);
        ctx.fillStyle = "#95a5a6"; // foundation trim
        ctx.fillRect(TILE * 0.15, TILE * 0.8, TILE * 0.85, TILE * 0.2);

        // Window
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(TILE * 0.38, TILE * 0.2, TILE * 0.44, TILE * 0.4);
        ctx.fillStyle = "#5fc9e0";
        ctx.fillRect(TILE * 0.42, TILE * 0.24, TILE * 0.36, TILE * 0.32);
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(TILE * 0.42, TILE * 0.24, TILE * 0.16, TILE * 0.16);
      } else if (type === "wall_door") {
        // Modular wall center with door & awning
        ctx.fillStyle = "#bdc3c7";
        ctx.fillRect(0, 0, TILE, TILE);
        ctx.fillStyle = "#95a5a6";
        ctx.fillRect(0, TILE * 0.8, TILE, TILE * 0.2);

        // Wooden door
        ctx.fillStyle = "#7a5230";
        ctx.fillRect(TILE * 0.22, TILE * 0.16, TILE * 0.56, TILE * 0.84);
        ctx.fillStyle = "#f1c40f"; // brass knob
        ctx.beginPath();
        ctx.arc(TILE * 0.68, TILE * 0.6, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Signboard awning
        ctx.fillStyle = "#34495e";
        ctx.fillRect(TILE * 0.04, -TILE * 0.08, TILE * 0.92, TILE * 0.22);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(TILE * 0.04, -TILE * 0.08, TILE * 0.92, TILE * 0.22);
      } else if (type === "wall_r") {
        // Modular plaster wall right with windows
        ctx.fillStyle = "#bdc3c7";
        ctx.fillRect(0, 0, TILE * 0.85, TILE);
        ctx.fillStyle = "#95a5a6";
        ctx.fillRect(0, TILE * 0.8, TILE * 0.85, TILE * 0.2);

        // Window
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(TILE * 0.18, TILE * 0.2, TILE * 0.44, TILE * 0.4);
        ctx.fillStyle = "#5fc9e0";
        ctx.fillRect(TILE * 0.22, TILE * 0.24, TILE * 0.36, TILE * 0.32);
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(TILE * 0.22, TILE * 0.24, TILE * 0.16, TILE * 0.16);
      }

      ctx.restore();
    };

    const render = () => {
      frameCount++;
      const { px: cx, py: cy, facing: cFacing, moving: cMoving, currentMapId: cMapId } = stateRef.current;

      const m = MAPS[cMapId];
      if (!m) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const viewW = canvas.width;
      const viewH = canvas.height;

      // Clear
      ctx.fillStyle = "#16201a";
      ctx.fillRect(0, 0, viewW, viewH);

      const tilesX = Math.ceil(viewW / TILE) + 2;
      const tilesY = Math.ceil(viewH / TILE) + 2;
      const camX = cx - Math.floor(tilesX / 2);
      const camY = cy - Math.floor(tilesY / 2);

      // Render terrain
      for (let ty = 0; ty < tilesY; ty++) {
        for (let tx = 0; tx < tilesX; tx++) {
          const mx = camX + tx;
          const my = camY + ty;
          const row = m.grid[my];
          const t = row && row[mx] !== undefined ? row[mx] : 1;

          const sx = (mx - camX) * TILE - (cx - camX) * TILE + viewW / 2 - TILE / 2;
          const sy = (my - camY) * TILE - (cy - camY) * TILE + viewH / 2 - TILE / 2;

          if (t === 1) {
            ctx.fillStyle = "#16201a";
            ctx.fillRect(sx, sy, TILE, TILE);
          } else {
            ctx.fillStyle = TILE_COLORS[t] || "#7cc66f";
            ctx.fillRect(sx, sy, TILE, TILE);

            if (t === 4) drawGrassBlades(sx, sy, TILE, mx + my);
            if (t === 2) {
              ctx.strokeStyle = "rgba(0, 0, 0, 0.04)";
              ctx.strokeRect(sx, sy, TILE, TILE);
            }
            if (t === 3) {
              // Wavy water flow
              ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
              const off = (frameCount / 12) % TILE;
              ctx.fillRect(sx, sy + off - TILE, TILE, 3);
            }
          }

          // Trees placements
          if (t === 1) {
            // Draw a beautiful tree for every boundary block to build dense, thick forest walls
            drawTree(sx, sy, TILE, mx, my);
          }
        }
      }

      // Render decorations
      if (m.decorations) {
        m.decorations.forEach((d) => {
          const sx = (d.x - camX) * TILE - (cx - camX) * TILE + viewW / 2 - TILE / 2;
          const sy = (d.y - camY) * TILE - (cy - camY) * TILE + viewH / 2 - TILE / 2;
          drawDecoration(sx, sy, d.type);
        });
      }

      // Render NPCs
      m.npcs.forEach((npc) => {
        const sx = (npc.x - camX) * TILE - (cx - camX) * TILE + viewW / 2 - TILE / 2;
        const sy = (npc.y - camY) * TILE - (cy - camY) * TILE + viewH / 2 - TILE / 2;
        drawNpcSprite(sx, sy, npc.sprite || "npc_gen");
      });

      // Render player in center
      drawPlayerSprite(viewW / 2 - TILE / 2, viewH / 2 - TILE / 2, cFacing, cMoving);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#16201a]">
      <canvas
        ref={canvasRef}
        className="block image-render-pixelated w-full h-full select-none pointer-events-none"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};
