/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useGame, CATCH_HP_THRESHOLD, BattleSummary, MAP_WEATHER } from "../context/GameContext";
import { SPECIES, TYPE_LABEL, TYPE_COLOR, drawCreature } from "../constants/creatures";
import { QUESTIONS } from "../constants/questions";
import { ITEMS } from "../constants/items";
import { motion, AnimatePresence } from "motion/react";
import { StatusBadge } from "./StatusBadge";
import { WeatherOverlay } from "./WeatherOverlay";
import {
  sfxCursor,
  sfxCatchThrow,
  sfxCatchShake,
  sfxCatchSuccess,
  sfxCatchFail,
} from "../utils/audio";

const DIFFICULTY_LABEL: Record<number, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };

const STATUS_INFO: Record<string, { name: string; desc: string; icon: string }> = {
  BURN: { name: "Burnout", desc: "A burnt-out developer loses a portion of their maximum energy (HP) at the end of each turn due to endless sprint changes and overwork.", icon: "🔥" },
  PAR: { name: "Merge Conflict", desc: "A complex merge conflict leaves the developer locked in manual resolution, with a 25% chance to skip actions each turn.", icon: "⚡" },
  PSN: { name: "Toxic Codebase", desc: "Deeply poisoned by clean-code violations. Takes increasing damage at the end of each turn as technical debt accumulates.", icon: "☠️" },
  FRZ: { name: "Sprint Lock", desc: "Completely frozen in a sprint planning meeting. Cannot execute any moves until unlocked or defrosted.", icon: "❄️" },
  SLP: { name: "Meeting Fatigue", desc: "Passed out due to extreme meeting fatigue. Cannot take any actions until waking up after several turns.", icon: "💤" }
};

const ZONE_THEMES: Record<string, {
  name: string;
  bgGradient: string;
  glowColor: string;
  gridColor: string;
  ambientSymbol: string;
  accentColorText: string;
}> = {
  town: {
    name: "VERSION TOWN",
    bgGradient: "from-emerald-950/80 via-neutral-900 to-neutral-950",
    glowColor: "rgba(16, 185, 129, 0.22)",
    gridColor: "rgba(16, 185, 129, 0.05)",
    ambientSymbol: "♣ MODULES",
    accentColorText: "text-emerald-400/30",
  },
  feature1: {
    name: "USER ONBOARDING",
    bgGradient: "from-sky-950/80 via-neutral-900 to-neutral-950",
    glowColor: "rgba(14, 165, 233, 0.22)",
    gridColor: "rgba(14, 165, 233, 0.05)",
    ambientSymbol: "👤 ACCOUNTS",
    accentColorText: "text-sky-400/30",
  },
  feature3: {
    name: "SEARCH & DISCOVERY",
    bgGradient: "from-teal-950/80 via-neutral-900 to-neutral-950",
    glowColor: "rgba(20, 184, 166, 0.22)",
    gridColor: "rgba(20, 184, 166, 0.05)",
    ambientSymbol: "🔍 QUERY",
    accentColorText: "text-teal-400/30",
  },
  feature2: {
    name: "PAYMENTS INTEGRATION",
    bgGradient: "from-amber-950/80 via-neutral-900 to-neutral-950",
    glowColor: "rgba(245, 158, 11, 0.22)",
    gridColor: "rgba(245, 158, 11, 0.05)",
    ambientSymbol: "💳 BALANCE",
    accentColorText: "text-amber-400/30",
  },
  feature4: {
    name: "CHECKOUT FLOW",
    bgGradient: "from-purple-950/80 via-neutral-900 to-neutral-950",
    glowColor: "rgba(168, 85, 247, 0.22)",
    gridColor: "rgba(168, 85, 247, 0.05)",
    ambientSymbol: "🛒 CHECKOUT",
    accentColorText: "text-purple-400/30",
  },
  stakeholderfloor: {
    name: "STAKEHOLDER REVIEW",
    bgGradient: "from-slate-900 via-neutral-900 to-neutral-950",
    glowColor: "rgba(65, 224, 163, 0.22)",
    gridColor: "rgba(65, 224, 163, 0.05)",
    ambientSymbol: "⬡ SIGN-OFF",
    accentColorText: "text-[#41E0A3]/30",
  },
  customerhq: {
    name: "CUSTOMER HQ",
    bgGradient: "from-rose-950/85 via-neutral-900 to-neutral-950",
    glowColor: "rgba(244, 63, 94, 0.24)",
    gridColor: "rgba(244, 63, 94, 0.05)",
    ambientSymbol: "👑 PRODUCTION",
    accentColorText: "text-rose-400/30",
  },
};

const renderEnvironmentBackground = (mapId: string) => {
  switch (mapId) {
    case "town":
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Grassy fields and distant mountains */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-emerald-950/20 to-transparent" />
          
          {/* Distant Mountains */}
          <div className="absolute bottom-[20%] left-[-10%] right-[-10%] h-[35%] flex items-end opacity-20">
            <div className="w-[45%] h-[90%] bg-emerald-950/80 rounded-t-[100%] mr-[-15%] filter blur-[1px]" />
            <div className="w-[50%] h-full bg-emerald-950/95 rounded-t-[100%] mr-[-15%] filter blur-[1px]" />
            <div className="w-[40%] h-[75%] bg-emerald-950/70 rounded-t-[100%] filter blur-[1px]" />
          </div>

          {/* Midground Hills */}
          <div className="absolute bottom-[10%] left-[-5%] right-[-5%] h-[22%] flex items-end opacity-35">
            <div className="w-[60%] h-[80%] bg-emerald-900/60 rounded-t-[120%] mr-[-20%]" />
            <div className="w-[60%] h-full bg-emerald-900/50 rounded-t-[120%]" />
          </div>

          {/* Grass tufts scattered around the floor */}
          <div className="absolute bottom-[10%] left-[15%] text-emerald-500/20 text-xs select-none">🌾</div>
          <div className="absolute bottom-[12%] right-[20%] text-emerald-500/20 text-sm select-none">🌾</div>
          <div className="absolute bottom-[4%] left-[45%] text-emerald-500/15 text-lg select-none">🌱</div>
          
          {/* Soft ground overlay */}
          <div className="absolute bottom-0 inset-x-0 h-[15%] bg-emerald-950/20" />
        </div>
      );
    case "feature1": // User Onboarding - Serene cloudscape / windy meadow
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Sky clouds and windy hills */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-sky-950/20 to-transparent" />
          
          {/* Distant peaks */}
          <div className="absolute bottom-[25%] left-[-5%] right-[-5%] h-[25%] flex items-end opacity-15">
            <div className="w-[50%] h-[95%] bg-sky-950/90 rounded-t-[80%] mr-[-10%] rotate-[10deg] filter blur-[0.5px]" />
            <div className="w-[50%] h-[90%] bg-sky-950/80 rounded-t-[80%] ml-[-10%] rotate-[-8deg] filter blur-[0.5px]" />
          </div>

          {/* Dynamic CSS Clouds floating */}
          <div className="absolute top-[15%] left-[10%] w-24 h-6 bg-sky-400/5 rounded-full blur-md animate-pulse duration-[8000ms]" />
          <div className="absolute top-[22%] right-[15%] w-32 h-8 bg-sky-400/5 rounded-full blur-lg animate-pulse duration-[12000ms]" />

          {/* Midground hills */}
          <div className="absolute bottom-[8%] left-[-5%] right-[-5%] h-[22%] flex items-end opacity-25">
            <div className="w-[55%] h-full bg-sky-900/60 rounded-t-[140%] mr-[-15%]" />
            <div className="w-[60%] h-[85%] bg-sky-900/50 rounded-t-[140%]" />
          </div>

          {/* Wind lines */}
          <div className="absolute bottom-[15%] left-[25%] w-16 h-0.5 bg-sky-400/5 rounded-full" />
          <div className="absolute bottom-[8%] right-[30%] w-20 h-0.5 bg-sky-400/5 rounded-full" />
        </div>
      );
    case "feature3": // Search & Discovery - Teal Canyons / Database Caves
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-teal-950/20 to-transparent" />
          
          {/* Jagged Canyon Walls/Pillars */}
          <div className="absolute bottom-[15%] left-[-10%] w-[35%] h-[60%] bg-teal-950/30 rounded-tr-[40px] border-r border-teal-900/20" />
          <div className="absolute bottom-[15%] right-[-10%] w-[35%] h-[60%] bg-teal-950/30 rounded-tl-[40px] border-l border-teal-900/20" />
          
          {/* Distant Cave / Mountain background */}
          <div className="absolute bottom-[10%] inset-x-0 h-[25%] flex items-end opacity-20">
            <div className="w-[40%] h-[90%] bg-teal-950 mr-[-10%]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            <div className="w-[45%] h-full bg-teal-950 mr-[-10%]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            <div className="w-[35%] h-[75%] bg-teal-950" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          </div>

          {/* Teal glowing crystal nodes */}
          <div className="absolute bottom-[35%] left-[12%] w-2 h-4 bg-teal-400/15 rounded-full blur-[2px] animate-pulse" />
          <div className="absolute bottom-[45%] right-[15%] w-3 h-5 bg-teal-400/10 rounded-full blur-[3px] animate-pulse duration-1000" />
        </div>
      );
    case "feature2": // Payments Integration - Golden Peaks / Sunset Plateau
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-amber-950/20 to-transparent" />
          
          {/* Giant Golden Mountains in distance */}
          <div className="absolute bottom-[15%] left-[-10%] right-[-10%] h-[40%] flex items-end opacity-15">
            <div className="w-[50%] h-full bg-amber-950/80" style={{ clipPath: 'polygon(50% 10%, 0% 100%, 100% 100%)' }} />
            <div className="w-[60%] h-[85%] bg-amber-950/60 ml-[-20%]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          </div>

          {/* Midground plateaus */}
          <div className="absolute bottom-[8%] left-0 right-0 h-[18%] flex items-end opacity-30">
            <div className="w-[45%] h-[80%] bg-amber-900/60 rounded-t-lg mr-[-5%]" />
            <div className="w-[65%] h-full bg-amber-900/50 rounded-t-lg" />
          </div>

          {/* Golden dust sparkles rising */}
          <div className="absolute bottom-[25%] left-[20%] w-1.5 h-1.5 bg-amber-400/20 rounded-full animate-bounce" />
          <div className="absolute bottom-[35%] right-[25%] w-1 h-1 bg-amber-400/15 rounded-full animate-pulse" />
        </div>
      );
    case "feature4": // Checkout Flow - Deep Purple Obsidian Valley
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-purple-950/20 to-transparent" />
          
          {/* Obsidian jagged ridges */}
          <div className="absolute bottom-[12%] left-[-5%] right-[-5%] h-[35%] flex items-end opacity-15">
            <div className="w-[35%] h-full bg-purple-950/85" style={{ clipPath: 'polygon(0% 100%, 40% 20%, 80% 100%)' }} />
            <div className="w-[45%] h-[90%] bg-purple-950/70 ml-[-15%]" style={{ clipPath: 'polygon(10% 100%, 50% 10%, 90% 100%)' }} />
            <div className="w-[35%] h-[80%] bg-purple-950/55 ml-[-15%]" style={{ clipPath: 'polygon(20% 100%, 60% 30%, 100% 100%)' }} />
          </div>

          {/* Floating violet hex modules / data crystals */}
          <div className="absolute top-[20%] left-[40%] w-10 h-10 border border-purple-500/10 rounded-md rotate-[45deg] opacity-10 animate-spin duration-[15000ms]" />
          <div className="absolute top-[30%] right-[30%] w-6 h-6 border border-purple-500/5 rounded-md rotate-[15deg] opacity-10 animate-spin duration-[20000ms]" />

          {/* Dark foreground overlay */}
          <div className="absolute bottom-0 inset-x-0 h-[10%] bg-purple-950/10" />
        </div>
      );
    case "stakeholderfloor": // Stakeholder Review - High-tech neon server workspace / Digital mountain grid
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-neutral-900/30 to-transparent" />
          
          {/* Grid-like futuristic skyscraper silhouettes or digital pillars */}
          <div className="absolute bottom-[12%] inset-x-0 h-[45%] flex items-end justify-around opacity-10">
            <div className="w-12 h-[90%] bg-emerald-950 border-t border-x border-emerald-500/20 rounded-t-sm" />
            <div className="w-16 h-[60%] bg-emerald-950 border-t border-x border-emerald-500/20 rounded-t-sm" />
            <div className="w-14 h-[80%] bg-emerald-950 border-t border-x border-emerald-500/20 rounded-t-sm" />
            <div className="w-10 h-[95%] bg-emerald-950 border-t border-x border-emerald-500/20 rounded-t-sm" />
          </div>

          {/* Laser scanning lines / green matrix data streams */}
          <div className="absolute top-[30%] inset-x-0 h-0.5 bg-emerald-500/5 shadow-[0_0_8px_rgba(16,185,129,0.15)] animate-pulse" />
          <div className="absolute top-[55%] inset-x-0 h-0.5 bg-emerald-500/5 shadow-[0_0_6px_rgba(16,185,129,0.1)] animate-pulse" />
        </div>
      );
    case "customerhq": // Customer HQ - Royal Gilded Castle / Red Peak Penthouse
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-rose-950/20 to-transparent" />
          
          {/* Majestic rose peak summit / spires in the distance */}
          <div className="absolute bottom-[10%] left-[-10%] right-[-10%] h-[45%] flex items-end opacity-15">
            <div className="w-[50%] h-[95%] bg-rose-950/90" style={{ clipPath: 'polygon(30% 0%, 0% 100%, 100% 100%)' }} />
            <div className="w-[60%] h-full bg-rose-950/70 ml-[-25%]" style={{ clipPath: 'polygon(50% 10%, 0% 100%, 100% 100%)' }} />
            <div className="w-[45%] h-[85%] bg-rose-950/50 ml-[-20%]" style={{ clipPath: 'polygon(70% 0%, 0% 100%, 100% 100%)' }} />
          </div>

          {/* Glowing gold royal particle trails */}
          <div className="absolute bottom-[40%] left-[25%] w-1.5 h-1.5 bg-amber-400/15 rounded-full blur-[1px] animate-ping" />
          <div className="absolute bottom-[28%] right-[20%] w-2 h-2 bg-amber-400/20 rounded-full blur-[1px] animate-ping duration-1500" />
          
          {/* Clean floor outline */}
          <div className="absolute bottom-0 inset-x-0 h-[10%] bg-rose-950/20" />
        </div>
      );
    default:
      return null;
  }
};

const INSULTS_HIGH = [
  "Your strategy has a cognitive complexity of O(n³).",
  "ERROR 404: Player talent not found.",
  "Is that your final attack? Looks like a legacy script.",
  "My test coverage is 100%. You can't touch this.",
  "Are you running on Internet Explorer? So slow.",
  "A stack overflow waiting to happen on your side.",
  "Did you compile your strategy with warnings enabled?",
  "LGTM! I don't see any bugs in my code, you're doomed.",
  "Your codebase must be spaghetti because you are in a tangled mess."
];

const INSULTS_MID = [
  "Warning: Unhandled Promise Rejection in your logic!",
  "Refactoring active. Re-allocating main memory...",
  "Just a minor memory leak, don't get excited.",
  "Nice hit. Still cleaner than legacy jQuery, though.",
  "Compiling automated revenge sequence...",
  "Your queries are slow, but I suppose they are indexing.",
  "Who allowed you to push directly to production?",
  "Is this a DDoS attack? Stop spamming questions!"
];

const INSULTS_LOW = [
  "FATAL ERROR: Heap limit allocation exceeded!",
  "Segmentation fault (core dumped)!",
  "ALERT: Hotfix needed! Developer is sleeping!",
  "Out of Memory: Killed process 'Confidence'!",
  "CRITICAL EXCEPTION: Cannot resolve variable 'Victorious'!",
  "My tech debt is catching up with me!",
  "Wait! Let me submit a pull request for a heal!",
  "Rollback failed! System instability imminent!",
  "Warning: System temperature critical. Cooling fan failure!"
];

export const BattleScreen: React.FC = () => {
  const {
    inBattle,
    battle,
    battleMsg,
    party,
    bag,
    answerQuestion,
    useItemInBattle,
    switchPartyInBattle,
    attemptCatchInBattle,
    runFromBattle,
    setBattleMsg,
    currentMapId,
    leveledUpMon,
    dismissLevelUp,
    battleSummary,
    dismissBattleSummary,
  } = useGame();

  const [viewState, setViewState] = useState<"actions" | "quiz" | "items" | "switch" | "scan">("actions");
  const [introActive, setIntroActive] = useState(true);

  useEffect(() => {
    if (inBattle && battle) {
      setIntroActive(true);
      const timer = setTimeout(() => {
        setIntroActive(false);
      }, 3000); // 3-second camera pan over opposing Devmon
      return () => clearTimeout(timer);
    }
  }, [inBattle, battle?.enemyIdx]);

  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [revealingAnswer, setRevealingAnswer] = useState(false);
  const [effectiveness, setEffectiveness] = useState<"super" | "not_very" | "normal" | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<{ name: string; desc: string } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<{ name: string; desc: string; icon: string } | null>(null);

  // Opponent speech bubble state
  const [bubbleText, setBubbleText] = useState<string>("");
  const [bubbleVisible, setBubbleVisible] = useState<boolean>(false);
  const bubbleTimeoutRef = useRef<any>(null);

  const updateEnemySnark = React.useCallback((currentHp: number, maxHp: number) => {
    const hpPercent = (currentHp / maxHp) * 100;
    let pool = INSULTS_HIGH;
    if (hpPercent < 35) {
      pool = INSULTS_LOW;
    } else if (hpPercent <= 70) {
      pool = INSULTS_MID;
    }
    const randomMsg = pool[Math.floor(Math.random() * pool.length)];
    setBubbleText(randomMsg);
    setBubbleVisible(true);

    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }
    bubbleTimeoutRef.current = setTimeout(() => {
      setBubbleVisible(false);
    }, 5500);
  }, []);

  // Clear speech bubble timeouts on unmount
  useEffect(() => {
    return () => {
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }
    };
  }, []);

  // Catch Animation State
  const [catchItemUsed, setCatchItemUsed] = useState<string | null>(null);
  const [catchAnimationState, setCatchAnimationState] = useState<"idle" | "thrown" | "suck" | "shake" | "burst" | "fail">("idle");
  const [catchStageMsg, setCatchStageMsg] = useState<string>("");
  const [catchCodeParticles, setCatchCodeParticles] = useState<Array<{ id: number; char: string; tx: number; ty: number; delay: number }>>([]);

  const spawnCatchParticles = (type: "suck" | "success" | "fail") => {
    const chars = type === "success"
      ? ["✓", "MERGED", "OK", "1", "0", "++", "DEPLOYED"]
      : type === "fail"
      ? ["✗", "CONFLICT", "ERR", "!", "404", "CRASH", "FAIL"]
      : ["0", "1", "{", "}", "[", "]", ";", "=>"];

    const newParticles = Array.from({ length: 15 }).map((_, i) => {
      const angle = (i / 15) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const distance = type === "suck" ? 60 : 80;
      return {
        id: Math.random() + i,
        char: chars[Math.floor(Math.random() * chars.length)],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        delay: Math.random() * 0.3,
      };
    });
    setCatchCodeParticles(newParticles);
  };

  // Creature Animation States
  const [playerAnim, setPlayerAnim] = useState<"idle" | "attack" | "shake" | "faint" | "enter">("idle");
  const [enemyAnim, setEnemyAnim] = useState<"idle" | "attack" | "shake" | "faint" | "enter">("idle");

  const lastEnemyHp = useRef<number | null>(null);
  const lastPlayerHp = useRef<number | null>(null);
  const lastEnemyIdx = useRef<number | null>(null);
  const lastPlayerIdx = useRef<number | null>(null);

  const enemyCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync state variables
  const isTransitioning = useRef(false);

  // Auto-sync damage, attack, entry, and faint animations based on HP and index updates
  useEffect(() => {
    if (!inBattle || !battle) {
      lastEnemyHp.current = null;
      lastPlayerHp.current = null;
      lastEnemyIdx.current = null;
      lastPlayerIdx.current = null;
      return;
    }

    const enemy = battle.enemyTeam[battle.enemyIdx];
    const player = party[battle.playerIdx];
    if (!enemy || !player) return;

    // 1. Check if Enemy changed (e.g. trainer switches or next creature sent out)
    if (lastEnemyIdx.current !== battle.enemyIdx) {
      lastEnemyIdx.current = battle.enemyIdx;
      lastEnemyHp.current = enemy.hp;
      setEnemyAnim("enter");
      updateEnemySnark(enemy.hp, enemy.maxHp);
      const t = setTimeout(() => setEnemyAnim("idle"), 600);
      return () => clearTimeout(t);
    }

    // 2. Check if Player changed (e.g. party switch)
    if (lastPlayerIdx.current !== battle.playerIdx) {
      lastPlayerIdx.current = battle.playerIdx;
      lastPlayerHp.current = player.hp;
      setPlayerAnim("enter");
      const t = setTimeout(() => setPlayerAnim("idle"), 600);
      return () => clearTimeout(t);
    }

    // 3. Monitor Enemy HP changes (Enemy took damage -> Player attacked)
    if (lastEnemyHp.current !== null && lastEnemyHp.current !== enemy.hp) {
      const diff = lastEnemyHp.current - enemy.hp;
      lastEnemyHp.current = enemy.hp;

      if (diff > 0) {
        setPlayerAnim("attack");
        updateEnemySnark(enemy.hp, enemy.maxHp);
        const tShake = setTimeout(() => {
          setPlayerAnim("idle");
          if (enemy.hp <= 0) {
            setEnemyAnim("faint");
          } else {
            setEnemyAnim("shake");
          }
        }, 220);

        const tReset = setTimeout(() => {
          if (enemy.hp > 0) {
            setEnemyAnim("idle");
          }
        }, 700);

        return () => {
          clearTimeout(tShake);
          clearTimeout(tReset);
        };
      }
    }

    // 4. Monitor Player HP changes (Player took damage -> Enemy attacked)
    if (lastPlayerHp.current !== null && lastPlayerHp.current !== player.hp) {
      const diff = lastPlayerHp.current - player.hp;
      lastPlayerHp.current = player.hp;

      if (diff > 0) {
        setEnemyAnim("attack");
        const tShake = setTimeout(() => {
          setEnemyAnim("idle");
          if (player.hp <= 0) {
            setPlayerAnim("faint");
          } else {
            setPlayerAnim("shake");
          }
        }, 220);

        const tReset = setTimeout(() => {
          if (player.hp > 0) {
            setPlayerAnim("idle");
          }
        }, 700);

        return () => {
          clearTimeout(tShake);
          clearTimeout(tReset);
        };
      }
    }
  }, [inBattle, battle?.enemyIdx, battle?.playerIdx, battle?.enemyTeam, party, updateEnemySnark]);


  useEffect(() => {
    if (inBattle && battle) {
      setViewState("actions");
      setActiveQuestion(null);
      setSelectedOpt(null);
      setRevealingAnswer(false);
      setCatchAnimationState("idle");
      setCatchItemUsed(null);
    }
  }, [inBattle, battle?.enemyIdx, battle?.playerIdx]);

  // Re-draw combatant canvases on render ticks
  useEffect(() => {
    if (!inBattle || !battle) return;

    const enemy = battle.enemyTeam[battle.enemyIdx];
    const player = party[battle.playerIdx];

    if (enemy && enemyCanvasRef.current) {
      drawCreature(enemyCanvasRef.current, enemy.species, {
        silhouette: catchAnimationState === "suck" || catchAnimationState === "shake",
      });
    }

    if (player && playerCanvasRef.current) {
      drawCreature(playerCanvasRef.current, player.species);
    }
  }, [inBattle, battle?.enemyIdx, battle?.playerIdx, party, catchAnimationState]);

  if (!inBattle || !battle) return null;

  const enemy = battle.enemyTeam[battle.enemyIdx];
  const player = party[battle.playerIdx];
  if (!enemy || !player) return null;

  const enemySp = SPECIES[enemy.species];
  const playerSp = SPECIES[player.species];

  const enemyHpPercent = (enemy.hp / enemy.maxHp) * 100;
  let bubbleBorderClass = "border-emerald-500/70 shadow-[0_0_8px_rgba(16,185,129,0.3)] bg-neutral-950/95";
  let bubbleTextClass = "text-emerald-300";
  let bubbleHeader = "💬 REMOTE COMPILING...";

  if (enemyHpPercent < 35) {
    bubbleBorderClass = "border-rose-500 bg-rose-950/95 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse";
    bubbleTextClass = "text-rose-200";
    bubbleHeader = "🚨 SYSTEM FATAL EXCEPTION";
  } else if (enemyHpPercent <= 70) {
    bubbleBorderClass = "border-amber-500/70 shadow-[0_0_8px_rgba(245,158,11,0.3)] bg-neutral-950/95";
    bubbleTextClass = "text-amber-300";
    bubbleHeader = "⚠️ COMPILING WITH WARNINGS";
  }

  const hpBarClass = (hp: number, max: number) => {
    const pct = hp / max;
    if (pct < 0.20) return "bg-[#ef4444]"; // red
    if (pct < 0.50) return "bg-[#facc15]"; // yellow
    return "bg-[#22c55e]"; // green
  };

  const truncateOption = (text: string, maxLen = 85) => {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen - 1).trim() + "…";
  };

  // Launch Quiz question
  const triggerFight = () => {
    sfxCursor();
    // Choose a question based on type
    const questionsPool = QUESTIONS[playerSp.type];
    const askedSet = battle.askedSet;

    let pool = questionsPool.filter((q: any) => !askedSet.has(q.q));
    if (pool.length === 0) {
      askedSet.clear();
      pool = questionsPool;
    }

    // Skew difficulty by level
    const enemyLevel = enemy.level || 1;
    let weights = { 1: 0.70, 2: 0.25, 3: 0.05 };
    if (enemyLevel > 6 && enemyLevel <= 12) weights = { 1: 0.40, 2: 0.45, 3: 0.15 };
    else if (enemyLevel > 12 && enemyLevel <= 18) weights = { 1: 0.20, 2: 0.45, 3: 0.35 };
    else if (enemyLevel > 18) weights = { 1: 0.10, 2: 0.30, 3: 0.60 };

    const byDifficulty: Record<number, any[]> = { 1: [], 2: [], 3: [] };
    pool.forEach((q: any) => byDifficulty[q.difficulty || 1].push(q));

    const available = [1, 2, 3].filter((d) => byDifficulty[d].length > 0);
    let chosenDifficulty = available[0];

    const totalWeight = available.reduce((sum, d) => sum + weights[d as 1 | 2 | 3], 0);
    let rand = Math.random() * totalWeight;

    for (const d of available) {
      if (rand < weights[d as 1 | 2 | 3]) {
        chosenDifficulty = d;
        break;
      }
      rand -= weights[d as 1 | 2 | 3];
    }

    const bucket = byDifficulty[chosenDifficulty];
    const question = bucket[Math.floor(Math.random() * bucket.length)];

    askedSet.add(question.q);
    setActiveQuestion(question);
    setViewState("quiz");
    setSelectedOpt(null);
    setRevealingAnswer(false);
  };

  const handleSelectOption = (idx: number) => {
    if (revealingAnswer) return;
    setSelectedOpt(idx);
    setRevealingAnswer(true);

    const isCorrect = idx === activeQuestion.a;
    answerQuestion(isCorrect, idx, activeQuestion);

    if (isCorrect) {
      const pSp = SPECIES[player.species];
      const eSp = SPECIES[enemy.species];
      let mult = 1.0;
      if (pSp.type === "product" && eSp.type === "dev") mult = 1.5;
      else if (pSp.type === "dev" && eSp.type === "agile") mult = 1.5;
      else if (pSp.type === "agile" && eSp.type === "product") mult = 1.5;
      else if (eSp.type === "product" && pSp.type === "dev") mult = 0.6;
      else if (eSp.type === "dev" && pSp.type === "agile") mult = 0.6;
      else if (eSp.type === "agile" && pSp.type === "product") mult = 0.6;

      if (mult > 1.0) {
        setEffectiveness("super");
      } else if (mult < 1.0) {
        setEffectiveness("not_very");
      } else {
        setEffectiveness("normal");
      }
      setTimeout(() => {
        setEffectiveness(null);
      }, 1800);
    }

    // Auto-progress back to "actions" state after 1.2 seconds, matching battle flow timers
    setTimeout(() => {
      setViewState("actions");
      setRevealingAnswer(false);
      setSelectedOpt(null);
    }, 1200);
  };

  const triggerItemsOverlay = () => {
    sfxCursor();
    setViewState("items");
  };

  const triggerSwitchOverlay = () => {
    sfxCursor();
    setViewState("switch");
  };

  const triggerCatchWorkflow = () => {
    sfxCursor();
    // Catch item filter
    const docItem = "Onboarding Doc";
    if (!bag[docItem] || bag[docItem] <= 0) {
      setBattleMsg("You have no Onboarding Docs left! Visit the shop keeper to restock.");
      return;
    }

    const enemyHpPct = enemy.hp / enemy.maxHp;
    if (enemyHpPct >= CATCH_HP_THRESHOLD) {
      setBattleMsg(
        `Too healthy! ${enemy.nick} is at ${Math.round(
          enemyHpPct * 100
        )}% HP. Weaken it under ${Math.round(CATCH_HP_THRESHOLD * 100)}% HP first.`
      );
      return;
    }

    // Trigger local animation & throw sound
    sfxCatchThrow();
    setCatchItemUsed(docItem);
    setCatchAnimationState("thrown");
    setCatchStageMsg("SENDING PUSH REQUEST...");
    const isSuccessful = attemptCatchInBattle(docItem);

    // Sync animation cycles locally
    setTimeout(() => {
      setCatchAnimationState("suck");
      setCatchStageMsg("ABSORBING CORE MODULES...");
      spawnCatchParticles("suck");
    }, 300);

    setTimeout(() => {
      sfxCatchShake();
      setCatchAnimationState("shake");
      setCatchStageMsg("PARSING BYTECODE...");
    }, 750);

    // Intermediate compilation step messages
    setTimeout(() => {
      setCatchStageMsg("RESOLVING CONFLICTS...");
    }, 1100);

    setTimeout(() => {
      setCatchStageMsg("RUNNING TESTS...");
    }, 1450);

    setTimeout(() => {
      if (isSuccessful) {
        sfxCatchSuccess();
        setCatchAnimationState("burst");
        setCatchStageMsg("MERGE SUCCESSFUL!");
        spawnCatchParticles("success");
      } else {
        sfxCatchFail();
        setCatchAnimationState("fail");
        setCatchStageMsg("MERGE CONFLICT!");
        spawnCatchParticles("fail");
      }
    }, 1800);

    // Completely cleanup catch animation state after it finishes
    setTimeout(() => {
      setCatchAnimationState("idle");
      setCatchCodeParticles([]);
      setCatchStageMsg("");
    }, 3400);
  };

  const triggerScan = () => {
    sfxCursor();
    setViewState("scan");
  };

  const theme = ZONE_THEMES[currentMapId] || ZONE_THEMES.town;

  return (
    <div className="absolute inset-0 bg-neutral-950 select-none font-mono flex flex-col z-35 overflow-hidden animate-fade-in text-neutral-100">
      {/* Upper Combat Arena */}
      <div className={`relative flex-1 bg-gradient-to-b ${theme.bgGradient} overflow-hidden flex flex-col justify-between p-4 border-b border-neutral-850`}>
        {/* Camera-Panning Scenic Wrapper */}
        <motion.div
          animate={
            introActive
              ? {
                  scale: [1.6, 1.55, 1.0],
                  x: [-70, -50, 0],
                  y: [35, 25, 0],
                  rotate: [-0.6, 0.4, 0],
                }
              : {
                  scale: 1,
                  x: 0,
                  y: 0,
                  rotate: 0,
                }
          }
          transition={{ duration: 3.0, ease: [0.25, 1, 0.5, 1] }}
          style={{ transformOrigin: "80% 20%" }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Environment Background Layers */}
          {renderEnvironmentBackground(currentMapId)}

          {/* Dynamic Map Zone Weather Overlay */}
          <WeatherOverlay mapId={currentMapId} />

          {/* Ground Oval Accents */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[38%] opacity-80 pointer-events-none rounded-t-[50%]"
            style={{ background: `radial-gradient(circle at center, ${theme.glowColor} 0%, transparent 75%)` }}
          />

          {/* Dynamic Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-45"
            style={{
              backgroundImage: `linear-gradient(to right, ${theme.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${theme.gridColor} 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Combat Canvas Layouts */}
          <div className="relative flex-1 w-full flex items-center justify-between pointer-events-none my-2 px-2 h-full">
            {/* Enemy Sprite (Right aligned) */}
            <div className="absolute right-8 top-24 flex flex-col items-center">
              <div className="relative w-24 h-24">
                
                {/* Target Scanner Overlay during cinematic zoom */}
                <AnimatePresence>
                  {introActive && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute -inset-4 flex items-center justify-center pointer-events-none z-20"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute w-24 h-24 border border-dashed border-red-500/40 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1.15, 0.95, 1.05, 0.95] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-28 h-28 flex flex-col justify-between"
                      >
                        <div className="flex justify-between">
                          <div className="w-3 h-3 border-t-2 border-l-2 border-red-500" />
                          <div className="w-3 h-3 border-t-2 border-r-2 border-red-500" />
                        </div>
                        <div className="flex justify-between">
                          <div className="w-3 h-3 border-b-2 border-l-2 border-red-500" />
                          <div className="w-3 h-3 border-b-2 border-r-2 border-red-500" />
                        </div>
                      </motion.div>
                      <motion.div
                        animate={{ y: [-40, 40, -40] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-1/2 -translate-x-1/2 w-32 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                      />
                      <div className="absolute bottom-[-24px] bg-red-950/90 border border-red-500/60 rounded px-1.5 py-0.5 text-[6.5px] font-mono font-black text-red-400 tracking-widest uppercase animate-pulse">
                        🎯 TARGET ACQUIRED ⋅ {Math.round(enemyHpPercent)}% HP
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Opponent Speech Bubble */}
                <AnimatePresence>
                  {bubbleVisible && bubbleText && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`absolute bottom-full mb-3 right-[-8px] w-48 p-2 rounded-xl border z-30 flex flex-col pointer-events-auto text-left ${bubbleBorderClass}`}
                    >
                      {/* Small Header */}
                      <span className="text-[7px] font-mono font-black tracking-widest opacity-85 mb-1 flex items-center gap-1">
                        {bubbleHeader}
                      </span>
                      {/* Content */}
                      <p className={`text-[8.5px] font-mono leading-tight font-bold ${bubbleTextClass}`}>
                        "{bubbleText}"
                      </p>
                      {/* Speech Bubble Arrow pointing down to the center */}
                      <div 
                        className={`absolute bottom-[-5px] left-[71%] -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b ${
                          enemyHpPercent < 35 ? "bg-rose-950/95 border-rose-500" : (enemyHpPercent <= 70 ? "bg-neutral-950/95 border-amber-500/70" : "bg-neutral-950/95 border-emerald-500/70")
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <canvas
                  ref={enemyCanvasRef}
                  width={96}
                  height={96}
                  className={`w-full h-full object-contain transition-all duration-300 ${
                    catchAnimationState === "suck" ? "scale-0 opacity-0 rotate-[180deg] duration-500" : ""
                  } ${
                    catchAnimationState === "shake" || catchAnimationState === "burst" ? "opacity-0 scale-0 animate-none" : ""
                  } ${
                    catchAnimationState === "fail" ? "animate-glitch-reappear" : ""
                  } ${
                    catchAnimationState === "idle" && enemy.hp > 0 ? "scale-100 opacity-100" : ""
                  } ${
                    enemy.hp <= 0 && enemyAnim !== "faint" ? "scale-0 opacity-0 pointer-events-none" : ""
                  } ${
                    enemyAnim === "attack" ? "animate-enemy-attack" : ""
                  } ${
                    enemyAnim === "shake" ? "animate-battle-shake" : ""
                  } ${
                    enemyAnim === "faint" ? "animate-battle-faint" : ""
                  } ${
                    enemyAnim === "enter" ? "animate-creature-enter" : ""
                  }`}
                />

                {/* Effectiveness Indicator Overlay */}
                {effectiveness && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.8 }}
                    animate={{ opacity: [0, 1, 1, 0], y: [12, -24, -24, -36], scale: [0.8, 1.1, 1.1, 0.95] }}
                    transition={{ duration: 1.6, times: [0, 0.15, 0.85, 1], ease: "easeOut" }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none w-max"
                  >
                    {effectiveness === "super" && (
                      <span className="bg-[#FF8A3D] text-white border border-amber-950/80 font-black text-[8px] px-2 py-0.5 rounded shadow-md tracking-wider animate-bounce uppercase flex items-center gap-1">
                        💥 SUPER EFFECTIVE!
                      </span>
                    )}
                    {effectiveness === "not_very" && (
                      <span className="bg-[#4D96FF] text-white border border-blue-950/80 font-black text-[8px] px-2 py-0.5 rounded shadow-md tracking-wider uppercase flex items-center gap-1">
                        💤 NOT VERY EFFECTIVE
                      </span>
                    )}
                    {effectiveness === "normal" && (
                      <span className="bg-neutral-800 text-neutral-100 border border-neutral-700 font-bold text-[8px] px-2 py-0.5 rounded shadow-md tracking-wider uppercase">
                        ⚔️ EFFECTIVE
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Holographic expanding rings wave for Capture Success/Failure */}
                <AnimatePresence>
                  {catchAnimationState === "burst" && (
                    <motion.div
                      initial={{ scale: 0.2, opacity: 1 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                      <div className="w-24 h-24 rounded-full border-4 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.5)]" />
                    </motion.div>
                  )}
                  {catchAnimationState === "fail" && (
                    <motion.div
                      initial={{ scale: 0.2, opacity: 1 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                      <div className="w-24 h-24 rounded-full border-4 border-rose-500/60 shadow-[0_0_30px_rgba(239,68,68,0.5)]" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Floating tech/code particle streams */}
                <AnimatePresence>
                  {catchCodeParticles.map((p) => {
                    const isSuck = catchAnimationState === "suck";
                    const isBurst = catchAnimationState === "burst";
                    const isFail = catchAnimationState === "fail";
                    
                    return (
                      <motion.div
                        key={p.id}
                        initial={
                          isSuck 
                            ? { x: p.tx, y: p.ty, scale: 1.2, opacity: 0 }
                            : { x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }
                        }
                        animate={
                          isSuck
                            ? { x: 0, y: 0, scale: 0.2, opacity: [0, 1, 0] }
                            : { 
                                x: p.tx, 
                                y: p.ty, 
                                scale: [0.2, 1, 0], 
                                opacity: [1, 1, 0], 
                                rotate: [0, Math.random() * 360] 
                              }
                        }
                        transition={{
                          duration: 0.8,
                          delay: p.delay,
                          ease: "easeOut"
                        }}
                        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono font-black text-[9px] pointer-events-none z-50 select-none ${
                          isBurst 
                            ? "text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                            : isFail 
                            ? "text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                            : "text-cyan-400"
                        }`}
                      >
                        {p.char}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Holographic Document capture device throwing & processing sequence overlay */}
                {catchAnimationState !== "idle" && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ y: 140, x: -140, scale: 0.3, rotate: 0, opacity: 0 }}
                      animate={
                        catchAnimationState === "thrown"
                          ? { y: 0, x: 0, scale: 1.1, rotate: 720, opacity: 1 }
                          : catchAnimationState === "suck"
                          ? { y: 0, x: 0, scale: 1.2, rotate: 0, opacity: 1 }
                          : catchAnimationState === "shake"
                          ? { 
                              y: [0, -4, 4, -4, 4, 0], 
                              x: [0, -3, 3, -3, 3, 0],
                              rotate: [-5, 5, -5, 5, 0],
                              scale: 1, 
                              opacity: 1 
                            }
                          : catchAnimationState === "burst"
                          ? { 
                              scale: [1, 1.4, 0], 
                              y: [0, -20, -100], 
                              opacity: [1, 1, 0],
                              rotate: [0, 15, -15, 360] 
                            }
                          : { 
                              y: [0, 8, 40], 
                              scale: [1, 0.8, 0], 
                              opacity: [1, 1, 0], 
                              rotate: [0, 90] 
                            }
                      }
                      transition={
                        catchAnimationState === "shake"
                          ? {
                              duration: 1.05,
                              ease: "linear",
                              repeat: Infinity,
                            }
                          : catchAnimationState === "burst"
                          ? {
                              duration: 1.2,
                              ease: "easeOut",
                            }
                          : {
                              duration: 0.45,
                              ease: "easeInOut",
                            }
                      }
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
                    >
                      {/* The holographic document folder device */}
                      <div 
                        className={`relative w-18 h-20 rounded-xl border-2 flex flex-col items-center justify-between p-1.5 font-mono select-none shadow-2xl transition-colors duration-300 ${
                          catchAnimationState === "burst"
                            ? "bg-emerald-950/95 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.7)]"
                            : catchAnimationState === "fail"
                            ? "bg-rose-950/95 border-rose-500 shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse"
                            : catchAnimationState === "shake"
                            ? "bg-amber-950/90 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                            : "bg-neutral-900/95 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                        }`}
                      >
                        {/* Holographic tab descriptor */}
                        <div 
                          className={`absolute -top-2.5 left-2 px-1.5 py-0.5 rounded text-[5px] font-black tracking-widest uppercase text-neutral-950 transition-colors duration-300 ${
                            catchAnimationState === "burst"
                              ? "bg-emerald-400"
                              : catchAnimationState === "fail"
                              ? "bg-rose-400"
                              : catchAnimationState === "shake"
                              ? "bg-amber-400"
                              : "bg-cyan-400"
                          }`}
                        >
                          {catchAnimationState === "burst" ? "MERGED" : catchAnimationState === "fail" ? "CRASHED" : "ONBOARD"}
                        </div>

                        {/* Simulated decorative code document lines */}
                        <div className="w-full flex flex-col gap-1 mt-1 opacity-60">
                          <div className={`h-1 w-12 rounded transition-colors duration-300 ${
                            catchAnimationState === "burst" ? "bg-emerald-400" : catchAnimationState === "fail" ? "bg-rose-400" : "bg-cyan-400"
                          }`} />
                          <div className="h-1 w-8 bg-neutral-600 rounded" />
                          <div className={`h-1 w-10 rounded transition-colors duration-300 ${
                            catchAnimationState === "burst" ? "bg-emerald-500/50" : "bg-neutral-700"
                          }`} />
                        </div>

                        {/* Center active spinner node */}
                        <div className="relative my-1">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className={`w-6 h-6 rounded-full border border-dashed transition-colors duration-300 ${
                              catchAnimationState === "burst"
                                ? "border-emerald-400"
                                : catchAnimationState === "fail"
                                ? "border-rose-400"
                                : catchAnimationState === "shake"
                                ? "border-amber-400"
                                : "border-cyan-400"
                            }`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-[9px] font-black transition-colors duration-300 ${
                              catchAnimationState === "burst"
                                ? "text-emerald-400"
                                : catchAnimationState === "fail"
                                ? "text-rose-400 animate-bounce"
                                : catchAnimationState === "shake"
                                ? "text-amber-400 animate-pulse"
                                : "text-cyan-400"
                            }`}>
                              {catchAnimationState === "burst" ? "✓" : catchAnimationState === "fail" ? "✗" : "⚙"}
                            </span>
                          </div>
                        </div>

                        {/* Small text footer representing parsing progress */}
                        <span className={`text-[6px] font-mono tracking-tight text-center font-black transition-colors duration-300 ${
                          catchAnimationState === "burst"
                            ? "text-emerald-300"
                            : catchAnimationState === "fail"
                            ? "text-rose-300"
                            : catchAnimationState === "shake"
                            ? "text-amber-300"
                            : "text-cyan-300"
                        }`}>
                          {catchStageMsg}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Player Sprite (Left aligned bottom) */}
            <div className="absolute left-8 bottom-4 flex flex-col items-center">
              <canvas
                ref={playerCanvasRef}
                width={110}
                height={110}
                className={`w-28 h-28 object-contain transition-all duration-300 ${
                  player.hp <= 0 && playerAnim !== "faint" ? "scale-0 opacity-0 pointer-events-none" : ""
                } ${
                  playerAnim === "attack" ? "animate-player-attack" : ""
                } ${
                  playerAnim === "shake" ? "animate-battle-shake" : ""
                } ${
                  playerAnim === "faint" ? "animate-battle-faint" : ""
                } ${
                  playerAnim === "enter" ? "animate-creature-enter" : ""
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Cinematic Widescreen Bars */}
        <AnimatePresence>
          {introActive && (
            <>
              <motion.div
                initial={{ y: -32 }}
                animate={{ y: 0 }}
                exit={{ y: -32 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute top-0 inset-x-0 h-8 bg-neutral-950/95 z-45 border-b border-neutral-900 flex items-center justify-between px-4 font-mono select-none"
              >
                <span className="text-[7.5px] text-amber-500 font-black tracking-widest uppercase">
                  🎬 INITIATING DEVMON PREVIEW
                </span>
                <span className="text-[7px] text-neutral-500">
                  CAMERA_ACTIVE // LOCKED
                </span>
              </motion.div>
              <motion.div
                initial={{ y: 32 }}
                animate={{ y: 0 }}
                exit={{ y: 32 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute bottom-0 inset-x-0 h-8 bg-neutral-950/95 z-45 border-t border-neutral-900 flex items-center justify-center font-mono select-none"
              >
                <span className="text-[7.5px] text-[#41E0A3] font-black tracking-widest animate-pulse">
                  📡 LOCKED ONTO {enemySp.name.toUpperCase()} ⋅ SPRINT SCAN IN PROGRESS
                </span>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Ambient developer decorative elements */}
        <div className="absolute top-12 left-4 pointer-events-none select-none font-mono text-[7px] opacity-40 tracking-widest uppercase text-neutral-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          SYS_STATE: BATTLE_PROD
        </div>
        <div className="absolute top-12 right-4 pointer-events-none select-none font-mono text-[7px] opacity-50 tracking-widest uppercase text-neutral-400 font-black">
          {theme.ambientSymbol} // {theme.name}
        </div>

        {/* Dynamic Weather HUD */}
        {(() => {
          const weather = MAP_WEATHER[currentMapId] || MAP_WEATHER.town;
          let weatherColor = "border-amber-500/30 text-amber-400 bg-amber-950/40";
          let weatherIcon = "☀️";
          if (weather.type === "rain") {
            weatherColor = "border-sky-500/30 text-sky-400 bg-sky-950/40";
            weatherIcon = "🌧️";
          } else if (weather.type === "digital") {
            weatherColor = "border-emerald-500/30 text-emerald-400 bg-emerald-950/40";
            weatherIcon = "⚡";
          } else if (weather.type === "snow") {
            weatherColor = "border-teal-500/30 text-teal-300 bg-teal-950/40";
            weatherIcon = "❄️";
          } else if (weather.type === "stormy") {
            weatherColor = "border-purple-500/30 text-purple-400 bg-purple-950/40";
            weatherIcon = "⛈️";
          } else if (weather.type === "foggy") {
            weatherColor = "border-neutral-500/30 text-neutral-300 bg-neutral-900/60";
            weatherIcon = "🌫️";
          } else if (weather.type === "glitch") {
            weatherColor = "border-rose-500/30 text-rose-400 bg-rose-950/40";
            weatherIcon = "👾";
          }

          return (
            <motion.div 
              animate={{ opacity: introActive ? 0 : 1 }}
              transition={{ duration: 0.3 }}
              id="battle-weather-hud" 
              className={`absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black tracking-wider uppercase shadow-md backdrop-blur-sm z-25 ${weatherColor}`}
            >
              <span>{weatherIcon}</span>
              <span>{weather.name}</span>
              <span className="text-[7.5px] opacity-60 font-medium lowercase hidden sm:inline">({weather.desc})</span>
            </motion.div>
          );
        })()}

        {/* Enemy HP Card (Top Left) */}
        <motion.div 
          animate={{ 
            opacity: introActive ? 0 : 1, 
            y: introActive ? -15 : 0,
            scale: introActive ? 0.95 : 1
          }}
          transition={{ duration: 0.4, delay: introActive ? 0 : 0.2 }}
          className="bg-neutral-900/95 border border-neutral-700 rounded-xl p-2.5 min-w-[140px] max-w-[175px] shadow-lg shadow-neutral-950/40 self-start z-10 mt-12 ml-2"
        >
          <div className="flex justify-between items-center text-[10px] font-black text-neutral-100 uppercase tracking-wider gap-1.5">
            <span className="truncate">
              {enemy.nick}{" "}
              <span className="text-[7.5px] font-black font-mono" style={{ color: TYPE_COLOR[enemySp.type] }}>
                ({TYPE_LABEL[enemySp.type]})
              </span>
            </span>
            <span
              className="text-[8px] text-white px-2 py-0.5 rounded-sm font-black font-mono flex-shrink-0"
              style={{ backgroundColor: TYPE_COLOR[enemySp.type] }}
            >
              {TYPE_LABEL[enemySp.type]}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${hpBarClass(enemy.hp, enemy.maxHp)}`}
              style={{
                width: `${(enemy.hp / enemy.maxHp) * 100}%`,
                transition: "width 0.7s ease-out, background-color 0.7s ease-out"
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[8px] text-neutral-400 font-bold font-mono tracking-tight">
              LV.{enemy.level} ⋅ {enemy.hp}/{enemy.maxHp} HP
            </span>
            {enemy.status && (
              <StatusBadge 
                status={enemy.status} 
                onClick={() => {
                  const info = STATUS_INFO[enemy.status];
                  if (info) {
                    setSelectedStatus({ name: info.name, desc: info.desc, icon: info.icon });
                  }
                }}
              />
            )}
          </div>
          {enemySp.trait && (
            <div 
              onClick={() => setSelectedTrait({ name: enemySp.trait.name, desc: enemySp.trait.desc })}
              className="text-[7.5px] text-neutral-400 font-bold uppercase tracking-wider bg-neutral-950/50 hover:bg-neutral-950/80 active:scale-[0.98] px-1.5 py-0.5 rounded border border-neutral-800/60 mt-1 truncate cursor-pointer transition-all flex items-center gap-1 select-none" 
              title={enemySp.trait.desc}
            >
              <span className="animate-spin-slow">⚙️</span> {enemySp.trait.name}
            </div>
          )}
        </motion.div>

        {/* Player Stats HP card */}
        <motion.div 
          animate={{ 
            opacity: introActive ? 0 : 1, 
            y: introActive ? 15 : 0,
            scale: introActive ? 0.95 : 1
          }}
          transition={{ duration: 0.4, delay: introActive ? 0 : 0.2 }}
          className="bg-neutral-900/95 border border-neutral-700 rounded-xl p-2.5 min-w-[140px] max-w-[175px] shadow-lg shadow-neutral-950/40 self-end z-10 mb-2 mr-2" 
          id="player-hp-card"
        >
          <div className="flex justify-between items-center text-[10px] font-black text-neutral-100 uppercase tracking-wider gap-1.5">
            <span id="player-name" className="truncate">
              {player.nick}{" "}
              <span className="text-[7.5px] font-black font-mono" style={{ color: TYPE_COLOR[playerSp.type] }}>
                ({TYPE_LABEL[playerSp.type]})
              </span>
            </span>
            <span
              className="text-[8px] text-white px-2 py-0.5 rounded-sm font-black font-mono flex-shrink-0"
              style={{ backgroundColor: TYPE_COLOR[playerSp.type] }}
            >
              {TYPE_LABEL[playerSp.type]}
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${hpBarClass(player.hp, player.maxHp)}`}
              id="player-hp-fill"
              style={{
                width: `${(player.hp / player.maxHp) * 100}%`,
                transition: "width 0.7s ease-out, background-color 0.7s ease-out"
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[8px] text-neutral-400 font-bold font-mono tracking-tight" id="player-lv">
              LV.{player.level} ⋅ {player.hp}/{player.maxHp} HP
            </span>
            {player.status && (
              <StatusBadge 
                status={player.status} 
                onClick={() => {
                  const info = STATUS_INFO[player.status];
                  if (info) {
                    setSelectedStatus({ name: info.name, desc: info.desc, icon: info.icon });
                  }
                }}
              />
            )}
          </div>
          {playerSp.trait && (
            <div 
              onClick={() => setSelectedTrait({ name: playerSp.trait.name, desc: playerSp.trait.desc })}
              className="text-[7.5px] text-neutral-400 font-bold uppercase tracking-wider bg-neutral-950/50 hover:bg-neutral-950/80 active:scale-[0.98] px-1.5 py-0.5 rounded border border-neutral-800/60 mt-1 truncate cursor-pointer transition-all flex items-center gap-1 select-none" 
              title={playerSp.trait.desc}
            >
              <span className="animate-spin-slow">⚙️</span> {playerSp.trait.name}
            </div>
          )}
        </motion.div>
      </div>

      {/* LOWER BATTLE CONTAINER */}
      <div id="battle-lower" className="bg-neutral-950 border-t-2 border-neutral-850 p-4 flex flex-col h-[38%]">
        <div id="battle-msg" className="text-[11px] font-mono leading-relaxed text-blue-400 min-height-[32px] mb-3 font-bold uppercase tracking-wide">
          {battleMsg}
        </div>

        {/* Core combat action buttons */}
        {introActive ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-neutral-900/40 border border-[#41E0A3]/30 rounded-xl p-4 gap-2 animate-pulse">
            <div className="text-[10px] text-[#41E0A3] font-black tracking-widest uppercase flex items-center gap-1.5 animate-bounce">
              ⚡ SYNCING STRIKE PROTOCOLS...
            </div>
            <div className="h-1.5 w-48 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.0, ease: "linear" }}
                className="h-full bg-[#41E0A3]"
              />
            </div>
            <div className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">
              Compiling environment variables & binding ports...
            </div>
          </div>
        ) : (
          viewState === "actions" && (
            <div id="battle-actions" className="grid grid-cols-2 gap-2 flex-1">
              <button className="bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded-xl text-[10px] font-mono font-black text-neutral-100 uppercase cursor-pointer active:bg-blue-600 active:border-blue-400 hover:bg-neutral-850 transition-all flex items-center justify-center tracking-widest py-2.5 shadow-sm" onClick={triggerFight}>
                ⚔ ANSWER
              </button>
              <button className="bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded-xl text-[10px] font-mono font-black text-neutral-100 uppercase cursor-pointer active:bg-blue-600 active:border-blue-400 hover:bg-neutral-850 transition-all flex items-center justify-center tracking-widest py-2.5 shadow-sm" onClick={triggerItemsOverlay}>
                🎒 ITEM
              </button>
              <button className="bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded-xl text-[10px] font-mono font-black text-neutral-100 uppercase cursor-pointer active:bg-blue-600 active:border-blue-400 hover:bg-neutral-850 transition-all flex items-center justify-center tracking-widest py-2.5 shadow-sm" onClick={triggerCatchWorkflow}>
                🤝 CATCH
              </button>
              <button className="bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded-xl text-[10px] font-mono font-black text-neutral-100 uppercase cursor-pointer active:bg-blue-600 active:border-blue-400 hover:bg-neutral-850 transition-all flex items-center justify-center tracking-widest py-2.5 shadow-sm" onClick={triggerScan}>
                ℹ️ SCAN
              </button>
              <button className="bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded-xl text-[10px] font-mono font-black text-neutral-100 uppercase cursor-pointer active:bg-blue-600 active:border-blue-400 hover:bg-neutral-850 transition-all flex items-center justify-center tracking-widest py-2.5 shadow-sm" onClick={triggerSwitchOverlay}>
                🔁 SWITCH
              </button>
              <button className="bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded-xl text-[10px] font-mono font-black text-neutral-100 uppercase cursor-pointer active:bg-blue-600 active:border-blue-400 hover:bg-neutral-850 transition-all flex items-center justify-center tracking-widest py-2.5 shadow-sm" onClick={runFromBattle}>
                🏃 RUN
              </button>
            </div>
          )
        )}

        {/* View state panels */}
        {viewState === "quiz" && activeQuestion && (
          <div className="flex flex-col flex-1 h-full animate-fade-in text-neutral-100">
            <div className="text-[11px] font-bold text-neutral-200 mb-2 leading-snug flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-sm text-[8px] font-mono font-black tracking-wider text-white uppercase ${activeQuestion.difficulty === 3 ? 'bg-red-600' : activeQuestion.difficulty === 2 ? 'bg-orange-500' : 'bg-green-600'}`}>
                {DIFFICULTY_LABEL[activeQuestion.difficulty || 1]}
              </span>
              {activeQuestion.q}
            </div>

            <div className="grid grid-cols-2 gap-1.5 flex-1">
              {activeQuestion.opts.map((opt: string, idx: number) => {
                const isSelected = selectedOpt === idx;
                const isCorrect = idx === activeQuestion.a;
                let optClass = "bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-600 active:bg-neutral-850";

                if (revealingAnswer) {
                  if (isCorrect) {
                    optClass = "bg-green-500/10 border-green-500 text-green-400 font-black";
                  } else if (isSelected) {
                    optClass = "bg-red-500/10 border-red-500 text-red-400 font-black";
                  } else {
                    optClass = "opacity-40 bg-neutral-950 border-neutral-900 text-neutral-500";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={revealingAnswer}
                    onClick={() => handleSelectOption(idx)}
                    className={`border rounded-xl text-[10px] p-2 leading-tight flex items-center justify-start text-left cursor-pointer transition-all ${optClass}`}
                  >
                    <span>{truncateOption(opt)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Items overlay overlay panel */}
        {viewState === "items" && (
          <div className="flex flex-col flex-1 animate-fade-in bg-neutral-900 border border-neutral-850 p-3 rounded-xl">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[10px] font-black font-mono text-neutral-400 uppercase tracking-widest">🎒 Usable Items</span>
              <button
                className="text-[9px] bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-100 px-2 py-1 rounded-sm font-black cursor-pointer uppercase transition-all"
                onClick={() => setViewState("actions")}
              >
                ◀ BACK
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-[85px] overflow-y-auto">
              {Object.entries(bag)
                .filter(([name, qty]) => (qty as number) > 0 && !ITEMS[name].catchRate)
                .map(([name, qty]) => (
                  <button
                    key={name}
                    onClick={() => {
                      const item = ITEMS[name];
                      if (item.revive && player.hp > 0) return;
                      if (!item.revive && player.hp <= 0) return;
                      useItemInBattle(name);
                      setViewState("actions");
                    }}
                    className="bg-neutral-950/60 border border-neutral-800 p-2 rounded-lg flex flex-col items-start text-left cursor-pointer active:bg-neutral-900 hover:border-neutral-700 transition-all"
                  >
                    <span className="text-[10px] font-black font-mono text-neutral-200">{name} x{qty as number}</span>
                    <span className="text-[8px] text-neutral-500 line-clamp-1 mt-0.5">{ITEMS[name].desc}</span>
                  </button>
                ))}
              {Object.entries(bag).filter(([name, qty]) => (qty as number) > 0 && !ITEMS[name].catchRate).length === 0 && (
                <div className="col-span-2 text-center py-4 text-[10px] text-neutral-500 uppercase tracking-wider font-bold">No usable healing items in bag!</div>
              )}
            </div>
          </div>
        )}

        {/* Party Switch overlay panel */}
        {viewState === "switch" && (
          <div className="flex flex-col flex-1 animate-fade-in bg-neutral-900 border border-neutral-850 p-3 rounded-xl">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[10px] font-black font-mono text-neutral-400 uppercase tracking-widest">🔁 Swap Team</span>
              <button
                className="text-[9px] bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-100 px-2 py-1 rounded-sm font-black cursor-pointer uppercase transition-all"
                onClick={() => setViewState("actions")}
              >
                ◀ BACK
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-[85px] overflow-y-auto">
              {party.map((c, idx) => {
                const sp = SPECIES[c.species];
                const active = idx === battle.playerIdx;
                const fainted = c.hp <= 0;

                return (
                  <button
                    key={idx}
                    disabled={active || fainted}
                    onClick={() => {
                      switchPartyInBattle(idx);
                      setViewState("actions");
                    }}
                    className={`p-2 border rounded-lg flex flex-col text-left cursor-pointer transition-all ${
                      active
                        ? "border-blue-500 bg-blue-500/10 text-blue-400 cursor-not-allowed"
                        : fainted
                        ? "border-neutral-900 opacity-30 cursor-not-allowed bg-neutral-950/50 text-neutral-600"
                        : "border-neutral-800 bg-neutral-950/80 text-neutral-200 hover:border-neutral-700 active:bg-neutral-900"
                    }`}
                  >
                    <span className="text-[10px] font-black text-neutral-100">
                      {c.nick} <span className="text-[8px] text-neutral-400 font-mono">LV.{c.level}</span>
                    </span>
                    <span className="text-[8px] text-neutral-500 font-mono mt-0.5">
                      {c.hp}/{c.maxHp} HP {active ? " [ACTIVE]" : fainted ? " [FAINTED]" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Scan overlay panel */}
        {viewState === "scan" && (
          <div className="flex flex-col flex-1 animate-fade-in bg-neutral-900 border border-neutral-850 p-2.5 rounded-xl text-left select-none max-h-[140px] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center mb-1.5 flex-shrink-0">
              <span className="text-[10px] font-black font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                🔍 SYSTEM DEVMON SCAN
              </span>
              <button
                className="text-[9px] bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-100 px-2 py-0.5 rounded-sm font-black cursor-pointer uppercase transition-all"
                onClick={() => setViewState("actions")}
              >
                ◀ BACK
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
              {/* Opponent Scan Specs */}
              <div className="bg-neutral-950/70 border border-neutral-800 p-2 rounded-lg flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-wide truncate">
                      {enemy.nick} <span className="text-[8px] text-neutral-500 font-normal">({enemySp.name})</span>
                    </span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded text-neutral-300 font-mono font-black bg-neutral-900 border border-neutral-800 shrink-0">
                      LV.{enemy.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <span 
                      className="text-[7.5px] font-black px-1.5 py-0.5 rounded text-white font-mono uppercase" 
                      style={{ backgroundColor: TYPE_COLOR[enemySp.type] }}
                    >
                      {TYPE_LABEL[enemySp.type]}
                    </span>
                    <span className="text-[8px] text-neutral-400 font-mono">
                      HP: {enemy.hp}/{enemy.maxHp}
                    </span>
                  </div>

                  <p className="text-[8.5px] text-neutral-300 leading-tight italic font-mono line-clamp-2">
                    "{enemySp.desc}"
                  </p>
                </div>
              </div>

              {/* Architectural Type Matrix */}
              <div className="bg-neutral-950/50 border border-neutral-800 p-1.5 rounded-lg flex flex-col justify-between text-[8px] min-w-0">
                <span className="text-[7.5px] font-black text-neutral-400 uppercase tracking-wider mb-1 block">
                  ⚙️ ARCHITECTURAL MATRIX (1.5x Multiplier)
                </span>

                <div className="space-y-1 font-mono">
                  {/* Row 1: PRODUCT > DEV */}
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-0.5">
                    <div className="flex items-center gap-1">
                      <span className="px-1 py-0.5 rounded text-white font-black text-[7px]" style={{ backgroundColor: TYPE_COLOR.product }}>PRODUCT</span>
                      <span className="text-neutral-500 text-[6px]">▶</span>
                      <span className="px-1 py-0.5 rounded text-white font-black text-[7px]" style={{ backgroundColor: TYPE_COLOR.dev }}>DEV</span>
                    </div>
                    <span className="text-neutral-500 text-[7px] italic">Debug &gt; Compiled (Needs override Specs)</span>
                  </div>

                  {/* Row 2: DEV > AGILE */}
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-0.5">
                    <div className="flex items-center gap-1">
                      <span className="px-1 py-0.5 rounded text-white font-black text-[7px]" style={{ backgroundColor: TYPE_COLOR.dev }}>DEV</span>
                      <span className="text-neutral-500 text-[6px]">▶</span>
                      <span className="px-1 py-0.5 rounded text-white font-black text-[7px]" style={{ backgroundColor: TYPE_COLOR.agile }}>AGILE</span>
                    </div>
                    <span className="text-neutral-500 text-[7px] italic">Compiled &gt; Scripted (Working code &gt; Meetings)</span>
                  </div>

                  {/* Row 3: AGILE > PRODUCT */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="px-1 py-0.5 rounded text-white font-black text-[7px]" style={{ backgroundColor: TYPE_COLOR.agile }}>AGILE</span>
                      <span className="text-neutral-500 text-[6px]">▶</span>
                      <span className="px-1 py-0.5 rounded text-white font-black text-[7px]" style={{ backgroundColor: TYPE_COLOR.product }}>PRODUCT</span>
                    </div>
                    <span className="text-neutral-500 text-[7px] italic">Scripted &gt; Debug (Sprints limit Scope Creep)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Trait Details Tooltip Modal */}
        <AnimatePresence>
          {selectedTrait && (
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-neutral-900 border-2 border-neutral-750 rounded-2xl p-5 max-w-[280px] w-full shadow-2xl relative text-center"
              >
                <div className="absolute top-2.5 right-3">
                  <button
                    onClick={() => setSelectedTrait(null)}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors text-sm font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="w-10 h-10 rounded-full bg-neutral-950 flex items-center justify-center mx-auto mb-3 border border-neutral-800 text-base">
                  ⚙️
                </div>
                <h3 className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-1">
                  ACTIVE CREATURE TRAIT
                </h3>
                <h4 className="text-xs font-black text-neutral-100 uppercase tracking-wide mb-2.5">
                  {selectedTrait.name}
                </h4>
                <p className="text-[10px] text-neutral-300 leading-relaxed bg-neutral-950/80 p-3 rounded-xl border border-neutral-850/60 text-center font-sans">
                  {selectedTrait.desc}
                </p>
                <button
                  onClick={() => setSelectedTrait(null)}
                  className="mt-4 w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all cursor-pointer shadow-md border border-amber-500/20 active:scale-[0.98]"
                >
                  DISMISS
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Status Details Tooltip Modal */}
        <AnimatePresence>
          {selectedStatus && (
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="bg-neutral-900 border-2 border-neutral-750 rounded-2xl p-5 max-w-[280px] w-full shadow-2xl relative text-center"
              >
                <div className="absolute top-2.5 right-3">
                  <button
                    onClick={() => setSelectedStatus(null)}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors text-sm font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="w-10 h-10 rounded-full bg-neutral-950 flex items-center justify-center mx-auto mb-3 border border-neutral-800 text-lg">
                  {selectedStatus.icon}
                </div>
                <h3 className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-1">
                  ACTIVE STATUS EFFECT
                </h3>
                <h4 className="text-xs font-black text-neutral-100 uppercase tracking-wide mb-2.5">
                  {selectedStatus.name}
                </h4>
                <p className="text-[10px] text-neutral-300 leading-relaxed bg-neutral-950/80 p-3 rounded-xl border border-neutral-850/60 text-center font-sans">
                  {selectedStatus.desc}
                </p>
                <button
                  onClick={() => setSelectedStatus(null)}
                  className="mt-4 w-full bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all cursor-pointer shadow-md border border-rose-500/20 active:scale-[0.98]"
                >
                  DISMISS
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Level Up Celebration Modal */}
        {leveledUpMon && (
          <LevelUpModal
            mon={leveledUpMon}
            onClose={dismissLevelUp}
          />
        )}

        {/* Battle Summary Overlay */}
        {battleSummary && (
          <BattleSummaryOverlay
            summary={battleSummary}
            onClose={dismissBattleSummary}
          />
        )}
      </div>
    </div>
  );
};

// Beautiful Celebratory Level Up Modal Component
const LevelUpModal: React.FC<{
  mon: { name: string; oldLevel: number; newLevel: number; species: string; hpIncrease: number };
  onClose: () => void;
}> = ({ mon, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sp = SPECIES[mon.species];
  const type = sp ? sp.type : "dev";

  useEffect(() => {
    if (canvasRef.current) {
      drawCreature(canvasRef.current, mon.species);
    }
  }, [mon.species]);

  const flavorText =
    type === "product"
      ? "Product requirements aligned! Core parameters fully optimized."
      : type === "agile"
      ? "Sprint velocity boosted! Team efficiency maximized successfully."
      : "Codebase refactored! Compile warnings eliminated, tests are green.";

  // Pre-generate static particles with standard hooks/math so they don't jump on re-renders
  const particles = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 150;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const colors = ["#FFE15D", "#F49D1A", "#FF8A3D", "#4D96FF", "#6BCB77"];
      return {
        id: i,
        x: tx,
        y: ty,
        color: colors[i % colors.length],
        size: 4 + Math.random() * 6,
        delay: Math.random() * 0.4,
        duration: 1.2 + Math.random() * 0.8,
      };
    });
  }, [mon.species]);

  return (
    <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center z-50 text-center p-5 select-none font-mono overflow-hidden">
      {/* Sparkles Particle Layer */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: [0, 1.2, 0.8, 0], opacity: [1, 1, 0.6, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: Math.random() * 0.5,
          }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}

      {/* Main Celebration Card */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-amber-500/40 rounded-2xl p-6 max-w-[310px] w-full flex flex-col items-center shadow-2xl shadow-amber-500/10 z-10"
      >
        {/* Animated Gold Ring Glow */}
        <div className="absolute inset-0 border-2 border-amber-400 rounded-2xl animate-ping opacity-15 pointer-events-none" style={{ animationDuration: "2.5s" }} />

        {/* Dynamic header */}
        <motion.h2
          animate={{ scale: [0.95, 1.05, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 tracking-widest uppercase filter drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]"
        >
          🌟 LEVEL UP! 🌟
        </motion.h2>

        {/* Creature graphic */}
        <div className="relative mt-4 mb-2 p-3 bg-neutral-900 rounded-full border border-neutral-800 shadow-inner flex items-center justify-center">
          <canvas ref={canvasRef} width={64} height={64} className="w-16 h-16 [image-rendering:pixelated]" />
          <div className="absolute -top-1 -right-1 bg-amber-500 text-neutral-950 font-black text-[9px] px-1.5 py-0.5 rounded-full animate-bounce">
            UP!
          </div>
        </div>

        {/* Name and Level transitions */}
        <div className="text-sm font-black text-neutral-100 uppercase tracking-wider mt-1">{mon.name}</div>
        
        <div className="flex items-center gap-4 my-2 justify-center">
          <span className="text-[11px] text-neutral-400 font-bold">Lv.{mon.oldLevel}</span>
          <span className="text-amber-400 font-black text-xs">➔</span>
          <span className="text-emerald-400 font-black text-xl animate-pulse">Lv.{mon.newLevel}</span>
        </div>

        {/* Stats increases */}
        <div className="w-full flex flex-col gap-1.5 mt-3">
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg py-1.5 px-3 flex justify-between items-center">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              ➕ MAX HP
            </span>
            <span className="text-xs font-black text-emerald-300">+{mon.hpIncrease} HP</span>
          </div>
        </div>

        {/* Tech/Agile/Product flavored quote */}
        <p className="text-[9.5px] text-neutral-400 italic text-center mt-4 border-t border-neutral-800 pt-3 leading-relaxed">
          "{flavorText}"
        </p>

        {/* Compile / OK button */}
        <button
          onClick={onClose}
          className="mt-5 w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border border-amber-400/20 active:scale-95 text-neutral-950 font-black text-[11px] py-2.5 rounded-xl tracking-widest cursor-pointer uppercase transition-all shadow-lg shadow-orange-500/10"
        >
          DEPLOY UPDATES 🚀
        </button>
      </motion.div>
    </div>
  );
};

// Beautiful Celebratory Post-Battle Summary Overlay
const BattleSummaryOverlay: React.FC<{
  summary: BattleSummary;
  onClose: () => void;
}> = ({ summary, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (summary.capturedCreatureSpecies && canvasRef.current) {
      drawCreature(canvasRef.current, summary.capturedCreatureSpecies);
    }
  }, [summary.capturedCreatureSpecies]);

  return (
    <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-50 overflow-y-auto animate-fade-in text-neutral-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-5 shadow-2xl flex flex-col gap-4"
      >
        {/* Header Header */}
        <div className="text-center">
          <motion.h2 
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className={`text-lg font-black uppercase tracking-widest ${
              summary.won ? "text-emerald-400 drop-shadow-[0_2px_8px_rgba(52,211,153,0.3)]" : "text-rose-500 drop-shadow-[0_2px_8px_rgba(244,63,94,0.3)]"
            }`}
          >
            {summary.won ? "🏆 Stage Clear!" : "🚨 Sprint Rollback"}
          </motion.h2>
          <p className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-wider">
            {summary.won ? "Sprint Completed Successfully" : "System Failure - Recalibrating"}
          </p>
        </div>

        {/* Captured Creature Showcase */}
        {summary.capturedCreatureName && summary.capturedCreatureSpecies && (
          <div className="bg-neutral-950/60 border border-emerald-800/40 p-3 rounded-xl flex flex-col items-center gap-1.5">
            <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">🎉 New Team Member Recruited!</span>
            <canvas ref={canvasRef} width={128} height={128} className="w-20 h-20 image-render-pixel" />
            <div className="text-center">
              <h3 className="text-xs font-black text-neutral-100">{summary.capturedCreatureName}</h3>
              <p className="text-[8px] text-neutral-400 uppercase tracking-widest">
                Class: {SPECIES[summary.capturedCreatureSpecies]?.name || summary.capturedCreatureSpecies}
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Answers Card */}
          <div className="bg-neutral-950/40 border border-neutral-800 p-2.5 rounded-xl flex flex-col gap-0.5">
            <span className="text-[7.5px] text-neutral-500 font-bold uppercase tracking-widest">💡 Accuracy</span>
            <div className="flex items-baseline gap-0.5 mt-0.5 flex-wrap">
              <span className="text-base font-black text-blue-400">{summary.correctAnswers}</span>
              <span className="text-[10px] text-neutral-500 font-bold">/</span>
              <span className="text-sm font-black text-neutral-300">{summary.totalQuestions || 0}</span>
              <span className="text-[8px] text-neutral-400 ml-1">correct</span>
            </div>
          </div>

          {/* Bits Gained Card */}
          <div className="bg-neutral-950/40 border border-neutral-800 p-2.5 rounded-xl flex flex-col gap-0.5">
            <span className="text-[7.5px] text-neutral-500 font-bold uppercase tracking-widest">💰 Bits Acquired</span>
            <div className="flex items-baseline gap-0.5 mt-0.5">
              <span className="text-base font-black text-amber-400">+{summary.goldEarned}</span>
              <span className="text-[8.5px] text-neutral-400"> bits</span>
            </div>
          </div>

          {/* XP Gained Card */}
          <div className="bg-neutral-950/40 border border-neutral-800 p-2.5 rounded-xl col-span-2 flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
              <span className="text-[7.5px] text-neutral-500 font-bold uppercase tracking-widest">📈 Total XP Earned</span>
              <span className="text-[9px] text-indigo-400 font-black">+{summary.totalXpGained} XP</span>
            </div>
            {/* ProgressBar decoration */}
            <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden mt-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-indigo-500" 
              />
            </div>
          </div>
        </div>

        {/* Item Drops Card */}
        <div className="bg-neutral-950/40 border border-neutral-800 p-3 rounded-xl flex flex-col gap-1.5">
          <span className="text-[7.5px] text-neutral-500 font-bold uppercase tracking-widest">🎒 Received Item Drops</span>
          {summary.itemDrops.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {summary.itemDrops.map((item, idx) => (
                <div key={idx} className="bg-neutral-900 border border-neutral-700/50 px-2 py-0.5 rounded text-[8px] text-neutral-300 font-bold flex items-center gap-1 animate-pulse">
                  <span>📦</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[8px] text-neutral-500 uppercase tracking-widest">No item drops found in this run.</span>
          )}
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onClose}
          className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg transition-colors border-t border-white/20"
        >
          {summary.won ? "Dismiss & Continue 🚀" : "Return to Town 🔌"}
        </motion.button>
      </motion.div>
    </div>
  );
};
