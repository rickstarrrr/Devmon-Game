/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Creature, GameFlags, Npc, Exit, Decoration, DomainType, Question, MapData } from "../types";
import { SPECIES, expToNext, makeCreature, maybeEvolve } from "../constants/creatures";
import { MAPS, TILE } from "../constants/maps";
import { ITEMS } from "../constants/items";
import {
  sfxCursor,
  sfxFootstep,
  sfxEncounter,
  sfxGold,
  sfxBadge,
  sfxVictory,
  sfxBattleStart,
  sfxLevelUp,
  sfxEvolve,
  sfxMenuOpen,
  sfxMenuClose,
  initAudioPreference,
  isMuted,
  toggleMute as sfxToggleMute,
  sfxCorrect,
  sfxWrong,
  sfxAttackHit,
  sfxCrit,
  sfxSuperEffective,
  sfxFaint,
  sfxCatchThrow,
  sfxCatchShake,
  sfxCatchSuccess,
  sfxCatchFail,
  updateBGM,
} from "../utils/audio";

const SAVE_KEY = "devmon_save_v1";
export const MAX_PARTY_SIZE = 6;
export const MAX_BOX_SIZE = 30;
export const CATCH_HP_THRESHOLD = 0.20;

export type WeatherType = "clear" | "rain" | "digital" | "snow" | "stormy" | "foggy" | "glitch";

export interface WeatherInfo {
  name: string;
  type: WeatherType;
  desc: string;
}

export const MAP_WEATHER: Record<string, WeatherInfo> = {
  town: { name: "Sunny / Clear", type: "clear", desc: "No special battle modifiers." },
  feature1: { name: "Soft Rain", type: "rain", desc: "Boosts Scripted (DEV) damage by 40%!" },
  feature2: { name: "Digital Stream", type: "digital", desc: "Special Attacks (Hard QA) gain +30% power and 100% accuracy!" },
  feature3: { name: "Query Snow", type: "snow", desc: "Freezing status chance doubled!" },
  feature4: { name: "Stormy Crash", type: "stormy", desc: "Critical hit rate is tripled (18.75% chance)!" },
  stakeholderfloor: { name: "Corporate Fog", type: "foggy", desc: "Hard attacks have a 20% miss chance; agile moves do 25% more damage." },
  customerhq: { name: "Glitch Storm", type: "glitch", desc: "Extreme chaos: All damage +25%!" },
};

export const GOSSIP_LINES = [
  "Did you hear? The lead architect was spotted manually editing production database tables at 3 AM!",
  "Rumor has it, a legendary 'NullPointerException' Devmon wanders the deep wilderness...",
  "I heard the product team wants to deprecate our favorite features in the next sprint.",
  "Some say if you delete node_modules three times in front of a mirror, a senior dev appears to review your code.",
  "The QA engineer found 42 critical issues yesterday, but they got marked as 'Working as Intended'.",
  "People are talking about a secret code repo containing the mystical 'Perfect Algorithm'.",
  "I overheard that the database server runs on a single potato in a basement somewhere.",
  "They say the marketing team is selling features that aren't even on our backlog yet!",
  "They say Coffee Boost can make a Devmon code 300% faster, but the crash afterward is brutal.",
  "Rumor says the customer requested a 'simple change' that will require rebuilding our entire architecture.",
  "I heard someone pushed direct to main and bypassed all CI/CD pipelines. Absolute madness!",
  "Whispers say a junior dev implemented their own custom cryptography. Nobody knows the password now...",
  "There's a myth that our git history contains a commit from a real AI that wrote perfect documentation."
];

export interface BattleState {
  enemyTeam: Creature[];
  enemyIdx: number;
  playerIdx: number;
  askedSet: Set<string>;
  isTrainer: boolean;
  trainerName: string | null;
  activeQuestion?: Question;
  onWin?: () => void;
  onLose?: () => void;
  turnCount?: number;
}

export interface BattleSummary {
  correctAnswers: number;
  totalXpGained: number;
  goldEarned: number;
  itemDrops: string[];
  won: boolean;
  capturedCreatureName?: string;
  capturedCreatureSpecies?: string;
  wipedOut: boolean;
}

export interface ToastConfig {
  message: string;
  duration: number;
}

interface GameContextProps {
  playerName: string;
  px: number;
  py: number;
  facing: "up" | "down" | "left" | "right";
  moving: boolean;
  currentMapId: string;
  badges: string[];
  mergedTickets: string[];
  acceptedBounties: string[];
  defeatedBounties: string[];
  party: Creature[];
  box: Creature[];
  gold: number;
  bag: Record<string, number>;
  flags: GameFlags;
  dex: { seen: Set<string>; caught: Set<string> };
  askedHistory: Record<DomainType, Set<string>>;
  inBattle: boolean;
  battle: BattleState | null;
  leveledUpMon: { name: string; oldLevel: number; newLevel: number; species: string; hpIncrease: number } | null;
  dismissLevelUp: () => void;
  battleSummary: BattleSummary | null;
  dismissBattleSummary: () => void;
  menuOpen: boolean;
  activeMenu: string | null; // "main", "party", "bag", "dex", "shop", "box", "detail"
  selectedPartyIdx: number | null;
  detailSource: "party" | "box" | "dex" | null;
  dialogActive: boolean;
  dialogQueue: string[];
  dialogOnComplete: (() => void) | null;
  toastConfig: ToastConfig | null;
  fadeActive: boolean;
  muted: boolean;

  // Actions
  chooseStarter: (id: string) => void;
  startGame: (load: boolean) => void;
  saveGame: () => boolean;
  deleteGame: () => void;
  mergeTicket: (ticketId: string) => void;
  acceptBounty: (bountyId: string) => void;
  toggleMuteState: () => void;
  tryMove: (dx: number, dy: number) => void;
  setFacingDirection: (dir: "up" | "down" | "left" | "right") => void;
  setMovingState: (moving: boolean) => void;
  interact: () => void;
  showDialog: (lines: string[] | string, onComplete?: () => void) => void;
  advanceDialog: () => void;
  triggerToast: (msg: string, ms?: number) => void;
  openMenu: (menuType: string) => void;
  closeMenu: () => void;
  setActiveMenu: (menuType: string | null) => void;
  setDetailView: (idx: number | null, source: "party" | "box" | "dex" | null) => void;
  
  // Shop & Inventory
  buyItem: (itemName: string) => void;
  sellItem: (itemName: string) => void;
  healTeamAtShop: () => void;
  transferToBox: (partyIdx: number) => void;
  withdrawFromBox: (boxIdx: number) => void;
  releaseCreature: (idx: number, source: "party" | "box") => void;
  useItemOnParty: (itemName: string, partyIdx: number) => void;
  swapPartyMembers: (idxA: number, idxB: number) => void;

  // Battle commands
  startBattle: (enemyTeamConfig: Array<{ species: string; level: number }>, opts?: { isTrainer?: boolean; trainerName?: string; onWin?: () => void; onLose?: () => void }) => void;
  answerQuestion: (isCorrect: boolean, optIndex: number, question: Question) => void;
  useItemInBattle: (itemName: string) => void;
  switchPartyInBattle: (idx: number) => void;
  attemptCatchInBattle: (itemName: string) => boolean;
  runFromBattle: () => void;
  setBattleMsg: (msg: string) => void;
  battleMsg: string;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playerName] = useState("RICKY");
  const [px, setPx] = useState(7);
  const [py, setPy] = useState(6);
  const [facing, setFacing] = useState<"up" | "down" | "left" | "right">("down");
  const [moving, setMoving] = useState(false);
  const [currentMapId, setCurrentMapId] = useState("town");
  const [badges, setBadges] = useState<string[]>([]);
  const [mergedTickets, setMergedTickets] = useState<string[]>([]);
  const [party, setParty] = useState<Creature[]>([]);
  const [box, setBox] = useState<Creature[]>([]);
  const [gold, setGold] = useState(300);
  const [bag, setBag] = useState<Record<string, number>>({ "Patch Kit": 3, "Refactor Crystal": 1, "Onboarding Doc": 3 });
  const [flags, setFlags] = useState<GameFlags>({ hasStarter: false, talkedProf: false, beatCustomer: false });
  const [dex, setDex] = useState({ seen: new Set<string>(), caught: new Set<string>() });
  const [askedHistory] = useState({
    product: new Set<string>(),
    dev: new Set<string>(),
    agile: new Set<string>()
  });

  const [inBattle, setInBattle] = useState(false);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [battleMsg, setBattleMsg] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedPartyIdx, setSelectedPartyIdx] = useState<number | null>(null);
  const [detailSource, setDetailSource] = useState<"party" | "box" | "dex" | null>(null);

  const [dialogActive, setDialogActive] = useState(false);
  const [dialogQueue, setDialogQueue] = useState<string[]>([]);
  const [dialogOnComplete, setDialogOnComplete] = useState<(() => void) | null>(null);

  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
  const [fadeActive, setFadeActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [leveledUpMon, setLeveledUpMon] = useState<{ name: string; oldLevel: number; newLevel: number; species: string; hpIncrease: number } | null>(null);
  
  // Battle summary tracking states
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [xpGainedCount, setXpGainedCount] = useState(0);
  const [goldEarnedCount, setGoldEarnedCount] = useState(0);
  const [itemDropsList, setItemDropsList] = useState<string[]>([]);
  const [battleSummary, setBattleSummary] = useState<BattleSummary | null>(null);

  // Refs for precise synchronous battle summary tracking
  const correctAnswersCountRef = useRef(0);
  const totalQuestionsCountRef = useRef(0);
  const xpGainedCountRef = useRef(0);
  const goldEarnedCountRef = useRef(0);
  const itemDropsListRef = useRef<string[]>([]);

  // Dynamic defeated status state tracker for trainers across maps (by x,y position)
  const [defeatedTrainers, setDefeatedTrainers] = useState<Record<string, boolean>>({});

  // Track the number of times the player has talked to each NPC to trigger dynamic/randomized gossip lines
  const [talkCounts, setTalkCounts] = useState<Record<string, number>>({});

  const [acceptedBounties, setAcceptedBounties] = useState<string[]>([]);
  const [defeatedBounties, setDefeatedBounties] = useState<string[]>([]);

  const acceptBounty = (bountyId: string) => {
    if (acceptedBounties.includes(bountyId)) return;
    setAcceptedBounties((prev) => {
      const next = [...prev, bountyId];
      // Auto-save game with accepted bounty
      setTimeout(() => {
        saveGame();
      }, 50);
      return next;
    });
    triggerToast(`Bounty accepted! Added to Kanban board.`);
  };

  // Movement cooldown ref to throttle movement speed
  const moveCooldown = useRef<number>(0);
  const battleSummaryCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    initAudioPreference();
    setMuted(isMuted());
  }, []);

  // Background Music system updater
  useEffect(() => {
    let hpPercent: number | undefined = undefined;
    if (inBattle && battle) {
      const p = party[battle.playerIdx];
      if (p) {
        hpPercent = p.hp / p.maxHp;
      }
    }
    updateBGM(currentMapId, inBattle, hpPercent);
  }, [currentMapId, inBattle, battle, party]);

  const triggerToast = (msg: string, ms = 1600) => {
    setToastConfig({ message: msg, duration: ms });
  };

  const toggleMuteState = () => {
    const nextMuted = sfxToggleMute();
    setMuted(nextMuted);
    if (!nextMuted) sfxCursor();
  };

  const showDialog = (lines: string[] | string, onComplete?: () => void) => {
    const queue = Array.isArray(lines) ? [...lines] : [lines];
    setDialogQueue(queue);
    setDialogOnComplete(() => onComplete || null);
    setDialogActive(true);
    if (queue.length > 0) {
      // Just showing first queue line
    }
  };

  const advanceDialog = () => {
    if (dialogQueue.length <= 1) {
      setDialogActive(false);
      setDialogQueue([]);
      if (dialogOnComplete) {
        dialogOnComplete();
        setDialogOnComplete(null);
      }
    } else {
      const nextQueue = dialogQueue.slice(1);
      setDialogQueue(nextQueue);
    }
  };

  const openMenu = (menuType: string) => {
    setActiveMenu(menuType);
    setMenuOpen(true);
    sfxMenuOpen();
  };

  const closeMenu = () => {
    setActiveMenu(null);
    setMenuOpen(false);
    setSelectedPartyIdx(null);
    setDetailSource(null);
    sfxMenuClose();
  };

  const setDetailView = (idx: number | null, source: "party" | "box" | "dex" | null) => {
    setSelectedPartyIdx(idx);
    setDetailSource(source);
    if (idx !== null && source !== null) {
      setActiveMenu("detail");
    } else if (source === "box") {
      setActiveMenu("box");
    } else if (source === "dex") {
      setActiveMenu("dex");
    } else {
      setActiveMenu("party");
    }
  };

  const saveGame = () => {
    try {
      const trainersList = Object.entries(defeatedTrainers).map(([key, val]) => {
        const [mapId, sx, sy] = key.split(",");
        return { mapId, x: parseInt(sx, 10), y: parseInt(sy, 10) };
      });

      const payload = {
        version: 1,
        savedAt: Date.now(),
        currentMapId,
        player: {
          playerName,
          px,
          py,
          facing,
          badges,
          mergedTickets,
          acceptedBounties,
          defeatedBounties,
          party,
          box,
          gold,
          bag,
          flags,
          dex: {
            seen: Array.from(dex.seen),
            caught: Array.from(dex.caught),
          },
          askedHistory: {
            product: Array.from(askedHistory.product),
            dev: Array.from(askedHistory.dev),
            agile: Array.from(askedHistory.agile),
          },
          talkCounts,
        },
        defeatedTrainers: trainersList,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error("Save failed:", e);
      return false;
    }
  };

  const loadGame = (): boolean => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const payload = JSON.parse(raw);
      const p = payload.player;

      setCurrentMapId(payload.currentMapId || "town");
      setPx(p.px);
      setPy(p.py);
      setFacing(p.facing || "down");
      setBadges(p.badges || []);
      setMergedTickets(p.mergedTickets || []);
      setAcceptedBounties(p.acceptedBounties || []);
      setDefeatedBounties(p.defeatedBounties || []);
      setParty(p.party || []);
      setBox(p.box || []);
      setGold(typeof p.gold === "number" ? p.gold : 300);
      setBag(p.bag || {});
      setFlags(Object.assign({ hasStarter: false, talkedProf: false, beatCustomer: false }, p.flags || {}));

      const nextDex = {
        seen: new Set<string>(p.dex ? p.dex.seen : []),
        caught: new Set<string>(p.dex ? p.dex.caught : []),
      };
      setDex(nextDex);

      if (p.askedHistory) {
        askedHistory.product = new Set<string>(p.askedHistory.product);
        askedHistory.dev = new Set<string>(p.askedHistory.dev);
        askedHistory.agile = new Set<string>(p.askedHistory.agile);
      }

      const trainersRecord: Record<string, boolean> = {};
      (payload.defeatedTrainers || []).forEach((t: { mapId: string; x: number; y: number }) => {
        trainersRecord[`${t.mapId},${t.x},${t.y}`] = true;
      });
      setDefeatedTrainers(trainersRecord);
      setTalkCounts(p.talkCounts || {});

      // Map sanity bounds check
      const restoredMap = MAPS[payload.currentMapId || "town"];
      const row = restoredMap && restoredMap.grid[p.py];
      const tile = row && row[p.px];
      const positionValid = tile !== undefined && tile !== 1 && tile !== 3;
      if (!positionValid) {
        setCurrentMapId("town");
        setPx(7);
        setPy(9);
      }

      return true;
    } catch (e) {
      console.error("Load failed:", e);
      return false;
    }
  };

  const deleteGame = () => {
    try {
      localStorage.removeItem(SAVE_KEY);
      setMergedTickets([]);
    } catch (e) {}
  };

  const mergeTicket = (ticketId: string) => {
    if (mergedTickets.includes(ticketId)) return;

    let goldReward = 0;
    const itemRewards: Record<string, number> = {};

    if (ticketId === "JIRA-101") {
      goldReward = 500;
      itemRewards["Onboarding Doc"] = 2;
    } else if (ticketId === "JIRA-202") {
      goldReward = 1000;
      itemRewards["Coffee Boost"] = 2;
    } else if (ticketId === "JIRA-303") {
      goldReward = 800;
      itemRewards["Patch Kit"] = 2;
    } else if (ticketId === "JIRA-404") {
      goldReward = 1200;
      itemRewards["Refactor Crystal"] = 1;
    } else if (ticketId === "JIRA-505") {
      goldReward = 1500;
      itemRewards["Refactor Crystal"] = 2;
    } else if (ticketId === "JIRA-606") {
      goldReward = 5000;
      itemRewards["Refactor Crystal"] = 3;
      itemRewards["Onboarding Doc"] = 5;
    } else if (ticketId === "JIRA-B01") {
      goldReward = 1500;
      itemRewards["Refactor Crystal"] = 1;
      itemRewards["Onboarding Doc"] = 1;
    } else if (ticketId === "JIRA-B02") {
      goldReward = 2500;
      itemRewards["Refactor Crystal"] = 2;
      itemRewards["Coffee Boost"] = 1;
    } else if (ticketId === "JIRA-B03") {
      goldReward = 2000;
      itemRewards["Onboarding Doc"] = 3;
      itemRewards["Coffee Boost"] = 2;
    }

    // Apply rewards
    if (goldReward > 0) {
      setGold((prev) => prev + goldReward);
    }
    if (Object.keys(itemRewards).length > 0) {
      setBag((prev) => {
        const next = { ...prev };
        Object.entries(itemRewards).forEach(([item, qty]) => {
          next[item] = (next[item] || 0) + qty;
        });
        return next;
      });
    }

    setMergedTickets((prev) => {
      const next = [...prev, ticketId];
      // Save game with the new list
      setTimeout(() => {
        // Find saveGame within our scope
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          version: 1,
          savedAt: Date.now(),
          currentMapId,
          player: {
            playerName,
            px,
            py,
            facing,
            badges,
            mergedTickets: next,
            acceptedBounties,
            defeatedBounties,
            party,
            box,
            gold: gold + goldReward,
            bag: (() => {
              const nextBag = { ...bag };
              Object.entries(itemRewards).forEach(([item, qty]) => {
                nextBag[item] = (nextBag[item] || 0) + qty;
              });
              return nextBag;
            })(),
            flags,
            dex: {
              seen: Array.from(dex.seen),
              caught: Array.from(dex.caught),
            },
            askedHistory: {
              product: Array.from(askedHistory.product),
              dev: Array.from(askedHistory.dev),
              agile: Array.from(askedHistory.agile),
            },
            talkCounts,
          },
          defeatedTrainers: Object.entries(defeatedTrainers)
            .filter(([_, isDefeated]) => isDefeated)
            .map(([key]) => {
              const [mId, xStr, yStr] = key.split(",");
              return { mapId: mId, x: parseInt(xStr), y: parseInt(yStr) };
            }),
        }));
      }, 50);
      return next;
    });

    sfxBadge();
    sfxGold();
    triggerToast(`Merged ${ticketId}! Rewards claimed!`);
  };

  const startGame = (load: boolean) => {
    let loadSuccessful = false;
    if (load) {
      loadSuccessful = loadGame();
      if (!loadSuccessful) {
        triggerToast("Couldn't load save — starting fresh!");
      }
    }

    if (!load || !loadSuccessful) {
      // Setup default starter selection sequence
      setTimeout(() => {
        if (!flags.hasStarter && currentMapId === "town") {
          const prof = MAPS.town.npcs.find((n) => n.giveStarterChoice);
          if (prof) {
            showDialog(prof.dialog, () => {
              openMenu("starter"); // trigger starter choice inside the overlay via context
            });
          }
        }
      }, 600);
    }
  };

  const tryMove = (dx: number, dy: number) => {
    if (inBattle || menuOpen || dialogActive) return;

    const nextFacing =
      dx === 1 ? "right" : dx === -1 ? "left" : dy === 1 ? "down" : dy === -1 ? "up" : facing;
    setFacing(nextFacing);

    if (moveCooldown.current > Date.now()) return;

    const nx = px + dx;
    const ny = py + dy;

    // Boundary & collision checks
    const currentMap = MAPS[currentMapId];
    const row = currentMap.grid[ny];
    if (!row) return;

    const tile = row[nx];
    if (tile === undefined || tile === 1 || tile === 3) return; // blocks

    // NPC collision
    const npcBlocked = currentMap.npcs.some((n) => n.x === nx && n.y === ny);
    if (npcBlocked) return;

    // Decoration collision
    const decorBlocked = (currentMap.decorations || []).some((d) => d.x === nx && d.y === ny && d.solid);
    if (decorBlocked) return;

    // Commit movement
    setPx(nx);
    setPy(ny);
    setMoving(true);
    sfxFootstep();
    moveCooldown.current = Date.now() + 200; // Throttle to 5 moves per sec max

    // Exit check
    const matchedExit = currentMap.exits.find((e) => {
      const w = e.w || 1;
      const h = e.h || 1;
      return nx >= e.x && nx < e.x + w && ny >= e.y && ny < e.y + h;
    });

    if (matchedExit) {
      if (matchedExit.requiresBadges) {
        const missing = matchedExit.requiresBadges.some((b) => !badges.includes(b));
        if (missing) {
          triggerToast(matchedExit.gateMessage || "You need more sign-offs before you can enter.");
          return;
        }
      }

      // Transition fade
      setFadeActive(true);
      setTimeout(() => {
        setCurrentMapId(matchedExit.to);
        setPx(matchedExit.tx);
        setPy(matchedExit.ty);
        setFadeActive(false);
      }, 350);
      return;
    }

    // Tall grass encounter check
    if (tile === 4 && currentMap.encounterTable && currentMap.encounterTable.length > 0) {
      if (Math.random() < 0.28) {
        // Trigger wild encounter
        const table = currentMap.encounterTable;
        const totalW = table.reduce((sum, item) => sum + item.weight, 0);
        let rand = Math.random() * totalW;
        let chosen = table[0];
        for (const item of table) {
          if (rand < item.weight) {
            chosen = item;
            break;
          }
          rand -= item.weight;
        }
        let lvl = chosen.lvl[0] + Math.floor(Math.random() * (chosen.lvl[1] - chosen.lvl[0] + 1));
        let speciesKey = chosen.species;

        // Check active bounties for high-level encounter replacement (45% chance)
        const activeBountiesToFind: Array<{ id: string; species: string; level: number }> = [];
        if (acceptedBounties.includes("JIRA-B01") && !defeatedBounties.includes("JIRA-B01") && !mergedTickets.includes("JIRA-B01")) {
          activeBountiesToFind.push({ id: "JIRA-B01", species: "legacywraith", level: 25 });
        }
        if (acceptedBounties.includes("JIRA-B02") && !defeatedBounties.includes("JIRA-B02") && !mergedTickets.includes("JIRA-B02")) {
          activeBountiesToFind.push({ id: "JIRA-B02", species: "segfaultitan", level: 30 });
        }
        if (acceptedBounties.includes("JIRA-B03") && !defeatedBounties.includes("JIRA-B03") && !mergedTickets.includes("JIRA-B03")) {
          activeBountiesToFind.push({ id: "JIRA-B03", species: "pingu", level: 28 });
        }

        if (activeBountiesToFind.length > 0 && Math.random() < 0.45) {
          const chosenBounty = activeBountiesToFind[Math.floor(Math.random() * activeBountiesToFind.length)];
          speciesKey = chosenBounty.species;
          lvl = chosenBounty.level;
          triggerToast(`⚠️ BOUNTY DETECTED: Draw your weapons for wild Level ${lvl} ${speciesKey.toUpperCase()}!`);
        }
        
        // Trigger battle state
        startBattle([{ species: speciesKey, level: lvl }]);
      }
    }
  };

  const interact = () => {
    if (inBattle || menuOpen || dialogActive) {
      if (dialogActive) advanceDialog();
      return;
    }

    let dx = 0;
    let dy = 0;
    if (facing === "up") dy = -1;
    else if (facing === "down") dy = 1;
    else if (facing === "left") dx = -1;
    else if (facing === "right") dx = 1;

    const tx = px + dx;
    const ty = py + dy;

    const npc = MAPS[currentMapId].npcs.find((n) => n.x === tx && n.y === ty);
    if (!npc) return;

    if (npc.sprite === "bounty_board") {
      openMenu("bounty");
      return;
    }

    const npcKey = `${currentMapId},${npc.x},${npc.y}`;
    const trainerDefeated = defeatedTrainers[npcKey];

    // Increment NPC dialogue interaction count
    setTalkCounts((prev) => ({
      ...prev,
      [npcKey]: (prev[npcKey] || 0) + 1,
    }));
    const currentTalkCount = (talkCounts[npcKey] || 0) + 1;

    if (npc.giveStarterChoice && !flags.hasStarter) {
      showDialog(npc.dialog, () => {
        openMenu("starter"); // Trigger starter choices panel
      });
      return;
    }

    if (npc.shop) {
      let lines = [...npc.dialog];
      if (currentTalkCount > 1) {
        const randomGossip = GOSSIP_LINES[Math.floor(Math.random() * GOSSIP_LINES.length)];
        lines.push(`${npc.name}: "By the way, did you hear? ${randomGossip}"`);
      }
      showDialog(lines, () => {
        openMenu("shop");
      });
      return;
    }

    if (npc.trainer) {
      if (trainerDefeated) {
        let lines = [`${npc.name}: "Good game out there. Let's build together again sometime!"`];
        if (currentTalkCount > 1) {
          const randomGossip = GOSSIP_LINES[Math.floor(Math.random() * GOSSIP_LINES.length)];
          lines.push(`${npc.name}: "By the way, did you hear? ${randomGossip}"`);
        }
        showDialog(lines);
        return;
      }

      let lines = [...npc.dialog];
      if (currentTalkCount > 1) {
        const randomGossip = GOSSIP_LINES[Math.floor(Math.random() * GOSSIP_LINES.length)];
        lines.push(`${npc.name}: "Also, did you hear? ${randomGossip}"`);
      }

      showDialog(lines, () => {
        startBattle(npc.team || [], {
          isTrainer: true,
          trainerName: npc.name,
          onWin: () => {
            // Track defeat state
            setDefeatedTrainers((prev) => ({ ...prev, [npcKey]: true }));

            if (npc.badge === "CUSTOMER APPROVAL") {
              if (!flags.beatCustomer) {
                setFlags((prev) => ({ ...prev, beatCustomer: true }));
                setTimeout(() => {
                  sfxVictory();
                  // Trigger final dialogue sequences
                  showDialog([
                    "THE CUSTOMER blinks slowly.",
                    '"...Huh. It actually works."',
                    '"I guess that\'ll do. Ship it."',
                    "You did it — CUSTOMER APPROVAL granted!",
                    "Word spreads across the Stack: your team shipped something that actually satisfied everyone.",
                    "Thanks for playing DEVMON! Feel free to keep exploring, catching creatures for your DevDex, and testing your skills.",
                  ], () => {
                    triggerToast("🏆 CUSTOMER APPROVED — You win DEVMON!", 3200);
                  });
                }, 400);
              }
              return;
            }

            if (npc.leader && npc.badge && !badges.includes(npc.badge)) {
              const nextBadges = [...badges, npc.badge];
              setBadges(nextBadges);
              setTimeout(() => {
                sfxBadge();
                triggerToast(`Earned the ${npc.badge}!`, 2200);
              }, 300);
            }
          },
        });
      });
      return;
    }

    let lines = [...npc.dialog];
    if (currentTalkCount > 1) {
      const randomGossip = GOSSIP_LINES[Math.floor(Math.random() * GOSSIP_LINES.length)];
      lines.push(`${npc.name}: "By the way, did you hear? ${randomGossip}"`);
    }
    showDialog(lines);
  };

  const chooseStarter = (id: string) => {
    const starter = makeCreature(id, 5);
    setParty([starter]);
    setFlags((prev) => ({ ...prev, hasStarter: true }));
    setDex((prev) => {
      const nextSeen = new Set(prev.seen);
      const nextCaught = new Set(prev.caught);
      nextSeen.add(id);
      nextCaught.add(id);
      return { seen: nextSeen, caught: nextCaught };
    });
    triggerToast(`Chose ${SPECIES[id].name}!`);
    setTimeout(() => {
      saveGame();
    }, 100);
  };

  // Inventory logic
  const buyItem = (itemName: string) => {
    const item = ITEMS[itemName];
    if (!item) return;
    if (gold < item.price) {
      triggerToast("Not enough bits!");
      return;
    }
    setGold((prev) => prev - item.price);
    setBag((prev) => ({ ...prev, [itemName]: (prev[itemName] || 0) + 1 }));
    sfxGold();
    triggerToast(`Bought ${itemName}!`);
  };

  const sellItem = (itemName: string) => {
    const item = ITEMS[itemName];
    if (!item || !bag[itemName] || bag[itemName] <= 0) return;
    setGold((prev) => prev + item.sell);
    setBag((prev) => {
      const updated = { ...prev };
      updated[itemName]--;
      if (updated[itemName] <= 0) {
        delete updated[itemName];
      }
      return updated;
    });
    sfxGold();
    triggerToast(`Sold ${itemName}.`);
  };

  const healTeamAtShop = () => {
    const cost = 40;
    if (party.length === 0) {
      triggerToast("No creatures to heal!");
      return;
    }
    const needsHeal = party.some((c) => c.hp < c.maxHp || c.status);
    if (!needsHeal) {
      triggerToast("Team already at full health and status clear!");
      return;
    }
    if (gold < cost) {
      triggerToast("Not enough bits!");
      return;
    }
    setGold((prev) => prev - cost);
    setParty((prev) =>
      prev.map((c) => ({
        ...c,
        hp: c.maxHp,
        status: undefined,
      }))
    );
    triggerToast("Your team is fully healed!");
  };

  const transferToBox = (partyIdx: number) => {
    if (party.length <= 1) {
      triggerToast("Can't deposit your last creature!");
      return;
    }
    if (box.length >= MAX_BOX_SIZE) {
      triggerToast("Storage box is full!");
      return;
    }
    const target = party[partyIdx];
    setParty((prev) => prev.filter((_, idx) => idx !== partyIdx));
    setBox((prev) => [...prev, target]);
    triggerToast(`${target.nick} was deposited.`);
  };

  const withdrawFromBox = (boxIdx: number) => {
    if (party.length >= MAX_PARTY_SIZE) {
      triggerToast("Party is full!");
      return;
    }
    const target = box[boxIdx];
    setBox((prev) => prev.filter((_, idx) => idx !== boxIdx));
    setParty((prev) => [...prev, target]);
    triggerToast(`${target.nick} joined your party.`);
  };

  const releaseCreature = (idx: number, source: "party" | "box") => {
    if (source === "party") {
      if (party.length <= 1) {
        triggerToast("Can't release your last creature!");
        return;
      }
      const target = party[idx];
      setParty((prev) => prev.filter((_, i) => i !== idx));
      triggerToast(`${target.nick} was released into the server.`);
    } else {
      const target = box[idx];
      setBox((prev) => prev.filter((_, i) => i !== idx));
      triggerToast(`${target.nick} was released.`);
    }
    closeMenu();
  };

  const useItemOnParty = (itemName: string, partyIdx: number) => {
    const item = ITEMS[itemName];
    if (!item || !bag[itemName] || bag[itemName] <= 0) return;

    const target = party[partyIdx];
    if (!target) return;

    if (item.revive && target.hp > 0) {
      triggerToast("This creature is active!");
      return;
    }
    if (!item.revive && target.hp <= 0) {
      triggerToast("Fainted! Use Coffee Boost first.");
      return;
    }
    if (!item.revive && target.hp >= target.maxHp) {
      triggerToast("Already at full health!");
      return;
    }

    setParty((prev) => {
      const nextParty = [...prev];
      const nextC = { ...nextParty[partyIdx] };
      if (item.revive) {
        nextC.hp = Math.round(nextC.maxHp * 0.5);
      } else if (item.heal) {
        nextC.hp = Math.min(nextC.maxHp, nextC.hp + item.heal);
      }
      nextParty[partyIdx] = nextC;
      return nextParty;
    });

    setBag((prev) => {
      const nextBag = { ...prev };
      nextBag[itemName]--;
      if (nextBag[itemName] <= 0) {
        delete nextBag[itemName];
      }
      return nextBag;
    });

    triggerToast(`Used ${itemName} on ${target.nick}!`);
  };
  
  const swapPartyMembers = (idxA: number, idxB: number) => {
    if (idxA < 0 || idxA >= party.length || idxB < 0 || idxB >= party.length) return;
    setParty((prev) => {
      const next = [...prev];
      const temp = next[idxA];
      next[idxA] = next[idxB];
      next[idxB] = temp;
      return next;
    });
    sfxCorrect();
    triggerToast("Party order updated!");
  };

  // BATTLE ENGINE
  const startBattle = (
    enemyTeamConfig: Array<{ species: string; level: number }>,
    opts?: { isTrainer?: boolean; trainerName?: string; onWin?: () => void; onLose?: () => void }
  ) => {
    const firstAliveIdx = party.findIndex((c) => c.hp > 0);
    if (firstAliveIdx === -1) {
      triggerToast("You have no healthy creatures!");
      return;
    }

    const enemies = enemyTeamConfig.map((item) => makeCreature(item.species, item.level));
    
    // Update seen list
    setDex((prev) => {
      const nextSeen = new Set(prev.seen);
      enemies.forEach((e) => nextSeen.add(e.species));
      return { ...prev, seen: nextSeen };
    });

    sfxEncounter();
    setFadeActive(true);
    setLeveledUpMon(null);
    setCorrectAnswersCount(0);
    setXpGainedCount(0);
    setGoldEarnedCount(0);
    setItemDropsList([]);
    setBattleSummary(null);

    // Reset synchronous tracking refs
    correctAnswersCountRef.current = 0;
    totalQuestionsCountRef.current = 0;
    xpGainedCountRef.current = 0;
    goldEarnedCountRef.current = 0;
    itemDropsListRef.current = [];

    setTimeout(() => {
      setFadeActive(false);
      setInBattle(true);
      setBattle({
        enemyTeam: enemies,
        enemyIdx: 0,
        playerIdx: firstAliveIdx,
        askedSet: new Set<string>(),
        isTrainer: !!opts?.isTrainer,
        trainerName: opts?.trainerName || null,
        onWin: opts?.onWin,
        onLose: opts?.onLose,
        turnCount: 1,
      });
      setBattleMsg(
        opts?.isTrainer
          ? `${opts.trainerName} wants to battle!`
          : `A wild ${SPECIES[enemies[0].species].name} appeared!`
      );
      sfxBattleStart();
    }, 500);
  };

  const endBattle = (won: boolean, wipedOut = false, callback?: () => void) => {
    if (won && battle && !battle.isTrainer && battle.enemyTeam && battle.enemyTeam[0]) {
      const defeatedMon = battle.enemyTeam[0];
      const speciesKey = defeatedMon.species;
      const level = defeatedMon.level;

      if (speciesKey === "legacywraith" && level >= 25 && acceptedBounties.includes("JIRA-B01") && !defeatedBounties.includes("JIRA-B01")) {
        setDefeatedBounties(prev => [...prev, "JIRA-B01"]);
        setTimeout(() => triggerToast("🎯 Bounty Defeated: JIRA-B01 is ready to Merge!", 4000), 1000);
      }
      if (speciesKey === "segfaultitan" && level >= 30 && acceptedBounties.includes("JIRA-B02") && !defeatedBounties.includes("JIRA-B02")) {
        setDefeatedBounties(prev => [...prev, "JIRA-B02"]);
        setTimeout(() => triggerToast("🎯 Bounty Defeated: JIRA-B02 is ready to Merge!", 4000), 1000);
      }
      if (speciesKey === "pingu" && level >= 28 && acceptedBounties.includes("JIRA-B03") && !defeatedBounties.includes("JIRA-B03")) {
        setDefeatedBounties(prev => [...prev, "JIRA-B03"]);
        setTimeout(() => triggerToast("🎯 Bounty Defeated: JIRA-B03 is ready to Merge!", 4000), 1000);
      }
    }

    setInBattle(false);
    if (won && battle?.onWin) battle.onWin();
    if (!won && battle?.onLose) battle.onLose();

    if (wipedOut) {
      setParty((prev) =>
        prev.map((c) => ({
          ...c,
          hp: Math.max(1, Math.round(c.maxHp * 0.3)),
          status: undefined,
        }))
      );
      setCurrentMapId("town");
      setPx(7);
      setPy(6);
      setTimeout(
        () =>
          triggerToast("All creatures fainted! Carried back to Version Town to recover.", 3200),
        200
      );
    }

    setBattle(null);
    if (callback) callback();
    saveGame(); // Auto-save on battle ends
  };

  const triggerBattleSummary = (won: boolean, wipedOut = false, callback?: () => void, capturedCreatureName?: string, capturedCreatureSpecies?: string) => {
    if (won) {
      sfxVictory();
    } else {
      sfxFaint();
    }
    battleSummaryCallbackRef.current = callback || null;
    setBattleSummary({
      correctAnswers: correctAnswersCountRef.current,
      totalQuestions: totalQuestionsCountRef.current,
      totalXpGained: xpGainedCountRef.current,
      goldEarned: goldEarnedCountRef.current,
      itemDrops: itemDropsListRef.current,
      won,
      wipedOut,
      capturedCreatureName,
      capturedCreatureSpecies,
    });
  };

  const dismissBattleSummary = () => {
    if (battleSummary) {
      const { won, wipedOut } = battleSummary;
      const cb = battleSummaryCallbackRef.current || undefined;
      setBattleSummary(null);
      battleSummaryCallbackRef.current = null;
      endBattle(won, wipedOut, cb);
    }
  };

  const dismissLevelUp = () => {
    setLeveledUpMon(null);
    if (battle) {
      const nextEnemyIdx = battle.enemyIdx + 1;
      if (nextEnemyIdx >= battle.enemyTeam.length) {
        triggerBattleSummary(true);
      } else {
        setBattle((prev) => {
          if (!prev) return null;
          return { ...prev, enemyIdx: nextEnemyIdx, activeQuestion: undefined };
        });
        const nextEnemy = battle.enemyTeam[nextEnemyIdx];
        setBattleMsg(`${battle.trainerName || "The trainer"} sends out ${nextEnemy.nick}!`);
      }
    }
  };

  const enemyAttackOnly = (afterWrongAnswer: boolean) => {
    if (!battle) return;
    const p = party[battle.playerIdx];
    const e = battle.enemyTeam[battle.enemyIdx];
    const pSp = SPECIES[p.species];
    const eSp = SPECIES[e.species];

    let canAttack = true;
    let wokeUpOrThawedMsg = "";
    let nextStatus: "BURN" | "PAR" | "PSN" | "FRZ" | "SLP" | undefined = e.status;

    if (e.status === "PAR") {
      if (Math.random() < 0.25) {
        canAttack = false;
      }
    } else if (e.status === "FRZ") {
      if (Math.random() < 0.20) {
        nextStatus = undefined;
        wokeUpOrThawedMsg = `${e.nick} resolved the sprint lock and thawed out! `;
      } else {
        canAttack = false;
      }
    } else if (e.status === "SLP") {
      if (Math.random() < 0.33) {
        nextStatus = undefined;
        wokeUpOrThawedMsg = `${e.nick} woke up from meeting fatigue! `;
      } else {
        canAttack = false;
      }
    }

    // Apply thawed/wake up to enemy battle state
    if (nextStatus === undefined && e.status) {
      setBattle((prev) => {
        if (!prev) return null;
        const nextTeam = [...prev.enemyTeam];
        nextTeam[prev.enemyIdx] = { ...nextTeam[prev.enemyIdx], status: undefined };
        return { ...prev, enemyTeam: nextTeam };
      });
    }

    if (!canAttack) {
      let msg = "";
      if (e.status === "PAR") msg = `${e.nick} is paralyzed by a merge conflict! Can't attack.`;
      if (e.status === "FRZ") msg = `${e.nick} is frozen in a sprint lock! Can't attack.`;
      if (e.status === "SLP") msg = `${e.nick} is asleep from meeting fatigue! Can't attack.`;
      setBattleMsg(msg);
      setTimeout(() => {
        setBattle((prev) => {
          if (!prev) return null;
          return { ...prev, activeQuestion: undefined };
        });
      }, 1200);
      return;
    }

    // Rock-paper-scissors dynamic multipliers
    let mult = 1.0;
    if (eSp.type === "product" && pSp.type === "dev") mult = 1.5;
    else if (eSp.type === "dev" && pSp.type === "agile") mult = 1.5;
    else if (eSp.type === "agile" && pSp.type === "product") mult = 1.5;
    else if (pSp.type === "product" && eSp.type === "dev") mult = 0.6;
    else if (pSp.type === "dev" && eSp.type === "agile") mult = 0.6;
    else if (pSp.type === "agile" && eSp.type === "product") mult = 0.6;

    // Weather check
    const weatherInfo = MAP_WEATHER[currentMapId] || MAP_WEATHER.town;
    const isSpecialAttack = Math.random() < 0.30; // 30% chance for enemy to use special attack
    let isHit = true;
    let weatherLog = "";

    if (weatherInfo.type === "foggy" && isSpecialAttack) {
      if (Math.random() < 0.20) {
        isHit = false;
        weatherLog = " The corporate fog caused the attack to miss!";
      }
    }

    if (!isHit) {
      let msg = wokeUpOrThawedMsg + `${e.nick} tried to launch a special attack! ${weatherLog}`;
      setBattleMsg(msg);
      setTimeout(() => {
        setBattle((prev) => {
          if (!prev) return null;
          return { ...prev, activeQuestion: undefined };
        });
      }, 1200);
      return;
    }

    // Marketing Vaporware evade check
    let isEvaded = false;
    if (pSp.trait?.name === "Marketing Vaporware" && Math.random() < 0.15) {
      isEvaded = true;
    }
    if (isEvaded) {
      let msg = wokeUpOrThawedMsg + `${e.nick} tried to hit ${p.nick}, but ${p.nick} is just Vaporware and completely evaded the hit!`;
      setBattleMsg(msg);
      setTimeout(() => {
        setBattle((prev) => {
          if (!prev) return null;
          return { ...prev, activeQuestion: undefined };
        });
      }, 1500);
      return;
    }

    let weatherDamageMult = 1.0;
    if (weatherInfo.type === "rain" && eSp.type === "dev") {
      weatherDamageMult = 1.4;
      weatherLog = " (Rain boosted DEV move!)";
    } else if (weatherInfo.type === "digital" && isSpecialAttack) {
      weatherDamageMult = 1.3;
      weatherLog = " (Digital Stream boosted Special!)";
    } else if (weatherInfo.type === "glitch") {
      weatherDamageMult = 1.25;
      weatherLog = " (Glitch Storm boost!)";
    } else if (weatherInfo.type === "foggy" && eSp.type === "agile") {
      weatherDamageMult = 1.25;
      weatherLog = " (Agile fog boost!)";
    }

    let traitDamageMult = 1.0;
    // Sprint Velocity
    if (eSp.trait?.name === "Sprint Velocity" && eSp.type === "agile" && afterWrongAnswer && (battle.activeQuestion?.difficulty === 1)) {
      traitDamageMult *= 1.25;
      weatherLog += " (Sprint Velocity Boost!)";
    }
    // Daily Sync (defensive)
    const isStandardWeather = weatherInfo.type !== "rain" && weatherInfo.type !== "stormy" && weatherInfo.type !== "snow" && weatherInfo.type !== "foggy" && weatherInfo.type !== "digital" && weatherInfo.type !== "glitch";
    if (pSp.trait?.name === "Daily Sync" && isStandardWeather) {
      traitDamageMult *= 0.85; // reduce incoming damage by 15%
      weatherLog += " (Daily Sync Shield reduces damage!)";
    }
    // Kernel Shield (defensive)
    if (weatherInfo.type === "stormy" && pSp.trait?.name === "Kernel Shield") {
      traitDamageMult *= 0.85; // reduce incoming damage by 15%
      weatherLog += " (Kernel Shield stormy mitigation!)";
    }
    // Scope Creep
    if (eSp.trait?.name === "Scope Creep") {
      const creepBoost = Math.min(1.40, 1 + ((battle.turnCount || 1) - 1) * 0.08);
      traitDamageMult *= creepBoost;
      weatherLog += ` (Scope Creep Boost: +${Math.round((creepBoost - 1) * 100)}%)`;
    }

    let isCrit = Math.random() < 0.0625;
    if (weatherInfo.type === "stormy") {
      isCrit = Math.random() < 0.1875; // Tripled
    }
    const critMult = isCrit ? 1.6 : 1.0;

    const damage = Math.round((5 + e.level * 1.6) * mult * critMult * weatherDamageMult * traitDamageMult * (0.85 + Math.random() * 0.3));

    // Play attack hit sound effect
    if (isCrit) {
      sfxCrit();
    } else if (mult > 1) {
      sfxSuperEffective();
    } else {
      sfxAttackHit();
    }

    // Roll for status infliction on player Devmon (25% chance, 50% in snow)
    let statusChance = 0.25;
    if (weatherInfo.type === "snow") {
      statusChance = 0.50;
    }
    if (pSp.trait?.name === "Kernel Shield") {
      statusChance *= 0.50; // Kernel Shield reduces status infliction rate by 50%
    }
    if (pSp.trait?.name === "Technical Debt") {
      statusChance = 0; // Technical Debt is immune to status effects
    }

    let inflictedStatus: "BURN" | "PAR" | "PSN" | "FRZ" | "SLP" | undefined = undefined;
    if (!p.status && Math.random() < statusChance) {
      if (eSp.type === "dev") {
        if (weatherInfo.type === "snow") {
          inflictedStatus = "FRZ";
        } else {
          inflictedStatus = Math.random() < 0.5 ? "PAR" : "FRZ";
        }
      }
      else if (eSp.type === "product") inflictedStatus = "BURN";
      else if (eSp.type === "agile") inflictedStatus = Math.random() < 0.5 ? "PSN" : "SLP";
    }

    // Roll for Fatal Error Crash counter-status on enemy
    let fatalErrorLog = "";
    if (pSp.trait?.name === "Fatal Error Crash" && !e.status && Math.random() < 0.20) {
      const counterStatus = Math.random() < 0.5 ? "PAR" : "FRZ";
      const statusLabel = counterStatus === "PAR" ? "Paralyzed (Merge Conflict)" : "Frozen (Sprint Lock)";
      fatalErrorLog = ` [Fatal Error Crash: ${e.nick} was ${statusLabel} by ${p.nick}'s crash!]`;
      
      setBattle((prev) => {
        if (!prev) return null;
        const nextTeam = [...prev.enemyTeam];
        nextTeam[prev.enemyIdx] = { ...nextTeam[prev.enemyIdx], status: counterStatus };
        return { ...prev, enemyTeam: nextTeam };
      });
    }

    // North Star Alignment heal on enemy
    let enemyAlignmentLog = "";
    if (eSp.trait?.name === "North Star Alignment" && afterWrongAnswer) {
      const enemyAlignmentHeal = Math.round(e.maxHp * 0.08);
      enemyAlignmentLog = ` [North Star Alignment healed ${e.nick} for ${enemyAlignmentHeal} HP!]`;
      setBattle((prev) => {
        if (!prev) return null;
        const nextTeam = [...prev.enemyTeam];
        nextTeam[prev.enemyIdx] = {
          ...nextTeam[prev.enemyIdx],
          hp: Math.min(nextTeam[prev.enemyIdx].maxHp, nextTeam[prev.enemyIdx].hp + enemyAlignmentHeal)
        };
        return { ...prev, enemyTeam: nextTeam };
      });
    }

    // Update HP and status
    setParty((prev) => {
      const nextParty = [...prev];
      const nextC = { ...nextParty[battle.playerIdx] };
      nextC.hp = Math.max(0, nextC.hp - damage);
      if (inflictedStatus) {
        nextC.status = inflictedStatus;
      }
      nextParty[battle.playerIdx] = nextC;
      return nextParty;
    });

    let msg = wokeUpOrThawedMsg + `${e.nick} strikes back for ${damage} damage!${weatherLog}`;
    if (isCrit) msg += " A critical hit!";
    if (mult > 1) msg += " It's super effective!";
    if (inflictedStatus) {
      if (inflictedStatus === "PAR") msg += ` ${p.nick} was paralyzed by a Merge Conflict!`;
      if (inflictedStatus === "FRZ") msg += ` ${p.nick} got frozen in a Sprint Lock!`;
      if (inflictedStatus === "BURN") msg += ` ${p.nick} suffered Burnout from high load!`;
      if (inflictedStatus === "PSN") msg += ` ${p.nick} was infected with a Toxic Codebase!`;
      if (inflictedStatus === "SLP") msg += ` ${p.nick} fell asleep from Meeting Fatigue!`;
    }
    if (enemyAlignmentLog) msg += enemyAlignmentLog;
    if (fatalErrorLog) msg += fatalErrorLog;
    setBattleMsg(msg);

    setTimeout(() => {
      // Check player health
      const finalHp = Math.max(0, p.hp - damage);
      if (finalHp <= 0) {
        handlePlayerFainted();
      } else {
        // Check for player's Burn/Poison end of turn damage!
        const playerStatus = inflictedStatus || p.status;
        if (playerStatus === "BURN" || playerStatus === "PSN") {
          const dot = Math.max(1, Math.round(p.maxHp * (playerStatus === "BURN" ? 0.08 : 0.10)));
          const finalHpAfterDot = Math.max(0, finalHp - dot);

          setParty((prev) => {
            const nextParty = [...prev];
            nextParty[battle.playerIdx] = { ...nextParty[battle.playerIdx], hp: finalHpAfterDot };
            return nextParty;
          });

          const dotName = playerStatus === "BURN" ? "Burnout" : "Toxic Codebase";
          setBattleMsg(`${p.nick} takes ${dot} ${dotName} status damage!`);

          setTimeout(() => {
            if (finalHpAfterDot <= 0) {
              handlePlayerFainted();
            } else {
              setBattle((prev) => {
                if (!prev) return null;
                return { ...prev, activeQuestion: undefined };
              });
            }
          }, 1100);
        } else {
          setBattle((prev) => {
            if (!prev) return null;
            return { ...prev, activeQuestion: undefined };
          });
        }
      }
    }, 1100);
  };

  const handlePlayerFainted = () => {
    if (!battle) return;
    sfxFaint(); // Play faint sound effect
    const faintedName = party[battle.playerIdx].nick;
    setBattleMsg(`${faintedName} fainted!`);

    setTimeout(() => {
      const nextAliveIdx = party.findIndex((c, i) => c.hp > 0 && i !== battle.playerIdx);
      if (nextAliveIdx === -1) {
        setBattleMsg("You have no creatures left! Hurrying back to town...");
        setTimeout(() => triggerBattleSummary(false, true), 1400);
      } else {
        setBattle((prev) => {
          if (!prev) return null;
          return { ...prev, playerIdx: nextAliveIdx, activeQuestion: undefined };
        });
        setBattleMsg(`Go, ${party[nextAliveIdx].nick}!`);
      }
    }, 1000);
  };

  const handleEnemyFainted = () => {
    if (!battle) return;
    sfxFaint(); // Play faint sound effect
    const e = battle.enemyTeam[battle.enemyIdx];
    const p = party[battle.playerIdx];
    setBattleMsg(`${e.nick} fainted!`);

    const expGain = 8 + e.level * 4;
    const goldGain = (battle.isTrainer ? 6 : 3) * e.level;

    setXpGainedCount((prev) => prev + expGain);
    setGoldEarnedCount((prev) => prev + goldGain);
    xpGainedCountRef.current += expGain;
    goldEarnedCountRef.current += goldGain;

    // Roll for item drop (50% chance)
    let droppedItem: string | null = null;
    if (Math.random() < 0.50) {
      const rand = Math.random();
      if (rand < 0.40) {
        droppedItem = "Lint Spray";
      } else if (rand < 0.70) {
        droppedItem = "Patch Kit";
      } else if (rand < 0.85) {
        droppedItem = "Onboarding Doc";
      } else if (rand < 0.95) {
        droppedItem = "Coffee Boost";
      } else {
        droppedItem = "Refactor Crystal";
      }
    }

    if (droppedItem) {
      const drop = droppedItem;
      setItemDropsList((prev) => [...prev, drop]);
      itemDropsListRef.current.push(drop);
      setBag((prev) => ({
        ...prev,
        [drop]: (prev[drop] || 0) + 1,
      }));
    }

    setTimeout(() => {
      setGold((prev) => prev + goldGain);
      
      let hasLeveledUp = false;
      let finalLevel = p.level;
      let tempExp = p.exp + expGain;
      let tempLevel = p.level;
      while (tempExp >= expToNext(tempLevel)) {
        tempExp -= expToNext(tempLevel);
        tempLevel++;
        hasLeveledUp = true;
        finalLevel = tempLevel;
      }

      if (hasLeveledUp) {
        const baseHp = SPECIES[p.species].hp;
        const newMaxHp = Math.round(baseHp * (1 + (finalLevel - 1) * 0.12));
        const hpIncrease = newMaxHp - p.maxHp;
        setLeveledUpMon({
          name: p.nick,
          oldLevel: p.level,
          newLevel: finalLevel,
          species: p.species,
          hpIncrease: hpIncrease,
        });
      }

      // Calculate level up in actual state
      setParty((prev) => {
        const nextParty = [...prev];
        const nextC = { ...nextParty[battle.playerIdx] };
        nextC.exp += expGain;
        
        let leveled = false;
        let fL = nextC.level;
        while (nextC.exp >= expToNext(nextC.level)) {
          nextC.exp -= expToNext(nextC.level);
          nextC.level++;
          leveled = true;
          fL = nextC.level;
        }

        if (leveled) {
          const baseHp = SPECIES[nextC.species].hp;
          nextC.maxHp = Math.round(baseHp * (1 + (fL - 1) * 0.12));
          nextC.hp = nextC.maxHp;
          sfxLevelUp();
        }

        // Trigger evolution logic
        const oldSpecies = nextC.species;
        maybeEvolve(nextC);
        if (nextC.species !== oldSpecies) {
          sfxEvolve();
        }

        nextParty[battle.playerIdx] = nextC;
        return nextParty;
      });

      setBattleMsg(`${p.nick} gained ${expGain} EXP and you found ${goldGain} bits!`);

      setTimeout(() => {
        const nextEnemyIdx = battle.enemyIdx + 1;
        if (hasLeveledUp) {
          if (nextEnemyIdx >= battle.enemyTeam.length) {
            setBattleMsg(battle.isTrainer ? `You defeated ${battle.trainerName || "the trainer"}!` : "You won the battle!");
          }
        } else {
          if (nextEnemyIdx >= battle.enemyTeam.length) {
            setBattleMsg(battle.isTrainer ? `You defeated ${battle.trainerName || "the trainer"}!` : "You won the battle!");
            setTimeout(() => triggerBattleSummary(true), 1200);
          } else {
            setBattle((prev) => {
              if (!prev) return null;
              return { ...prev, enemyIdx: nextEnemyIdx, activeQuestion: undefined };
            });
            setBattleMsg(`${battle.trainerName || "The trainer"} sends out ${battle.enemyTeam[nextEnemyIdx].nick}!`);
          }
        }
      }, 1200);
    }, 1000);
  };

  const answerQuestion = (isCorrect: boolean, optIndex: number, question: Question) => {
    if (!battle) return;

    const p = party[battle.playerIdx];
    const e = battle.enemyTeam[battle.enemyIdx];
    const pSp = SPECIES[p.species];
    const eSp = SPECIES[e.species];

    totalQuestionsCountRef.current += 1;

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      correctAnswersCountRef.current += 1;
      sfxCorrect(); // Play correct sound effect immediately

      // Player attack
      let canAttack = true;
      let wokeUpOrThawedMsg = "";
      let nextStatus: "BURN" | "PAR" | "PSN" | "FRZ" | "SLP" | undefined = p.status;

      if (p.status === "PAR") {
        if (Math.random() < 0.25) {
          canAttack = false;
        }
      } else if (p.status === "FRZ") {
        if (Math.random() < 0.20) {
          nextStatus = undefined;
          wokeUpOrThawedMsg = `${p.nick} resolved the sprint lock and thawed out! `;
        } else {
          canAttack = false;
        }
      } else if (p.status === "SLP") {
        if (Math.random() < 0.33) {
          nextStatus = undefined;
          wokeUpOrThawedMsg = `${p.nick} woke up from meeting fatigue! `;
        } else {
          canAttack = false;
        }
      }

      // Apply thawed/wake up to player status state
      if (nextStatus === undefined && p.status) {
        setParty((prev) => {
          const nextParty = [...prev];
          nextParty[battle.playerIdx] = { ...nextParty[battle.playerIdx], status: undefined };
          return nextParty;
        });
      }

      if (!canAttack) {
        let msg = "";
        if (p.status === "PAR") msg = `${p.nick} is paralyzed by a merge conflict! Can't attack.`;
        if (p.status === "FRZ") msg = `${p.nick} is frozen in a sprint lock! Can't attack.`;
        if (p.status === "SLP") msg = `${p.nick} is asleep from meeting fatigue! Can't attack.`;
        setBattleMsg(msg);
        setTimeout(() => {
          enemyAttackOnly(false);
        }, 1200);
        return;
      }

      let mult = 1.0;
      if (pSp.type === "product" && eSp.type === "dev") mult = 1.5;
      else if (pSp.type === "dev" && eSp.type === "agile") mult = 1.5;
      else if (pSp.type === "agile" && eSp.type === "product") mult = 1.5;
      else if (eSp.type === "product" && pSp.type === "dev") mult = 0.6;
      else if (eSp.type === "dev" && pSp.type === "agile") mult = 0.6;
      else if (eSp.type === "agile" && pSp.type === "product") mult = 0.6;

      const diffMultiplier: Record<number, number> = { 1: 1.0, 2: 1.35, 3: 1.75 };
      const diffMult = diffMultiplier[question.difficulty] || 1.0;

      // Weather logic for player attack
      const weatherInfo = MAP_WEATHER[currentMapId] || MAP_WEATHER.town;
      const isSpecialAttack = question.difficulty === 3;
      let isHit = true;
      let weatherLog = "";

      if (weatherInfo.type === "foggy") {
        if (isSpecialAttack && Math.random() < 0.20) {
          isHit = false;
          weatherLog = "the thick corporate fog caused the complex attack to miss!";
        }
      } else if (weatherInfo.type === "digital") {
        if (isSpecialAttack) {
          weatherLog = " (Digital stream optimizes bytecode! Special attack hits with 100% accuracy!)";
        }
      } else {
        if (isSpecialAttack && Math.random() < 0.10) {
          isHit = false;
          weatherLog = "the complex special attack failed to compile and missed!";
        }
      }

      if (!isHit) {
        setBattleMsg(wokeUpOrThawedMsg + `${p.nick} answered correctly, but ${weatherLog}`);
        setTimeout(() => {
          enemyAttackOnly(false);
        }, 1500);
        return;
      }

      // Marketing Vaporware evade check
      let isEvaded = false;
      if (eSp.trait?.name === "Marketing Vaporware" && Math.random() < 0.15) {
        isEvaded = true;
      }
      if (isEvaded) {
        setBattleMsg(wokeUpOrThawedMsg + `${p.nick} answers correctly and strikes, but ${e.nick} is just Vaporware and completely evaded the hit!`);
        setTimeout(() => {
          enemyAttackOnly(false);
        }, 1500);
        return;
      }

      let weatherDamageMult = 1.0;
      if (weatherInfo.type === "rain" && pSp.type === "dev") {
        weatherDamageMult = 1.4;
        weatherLog = " [Rain boosted DEV move!]";
      } else if (weatherInfo.type === "digital" && isSpecialAttack) {
        weatherDamageMult = 1.3;
        weatherLog = " [Digital stream boosted Special Attack!]";
      } else if (weatherInfo.type === "glitch") {
        weatherDamageMult = 1.25;
        weatherLog = " [Glitch Storm chaos boost!]";
      } else if (weatherInfo.type === "foggy" && pSp.type === "agile") {
        weatherDamageMult = 1.25;
        weatherLog = " [Agile fog boost!]";
      }

      let traitDamageMult = 1.0;
      // Sprint Velocity
      if (pSp.trait?.name === "Sprint Velocity" && pSp.type === "agile" && question.difficulty === 1) {
        traitDamageMult *= 1.25;
        weatherLog += " [Sprint Velocity Boost!]";
      }
      // Daily Sync (defensive)
      const isStandardWeather = weatherInfo.type !== "rain" && weatherInfo.type !== "stormy" && weatherInfo.type !== "snow" && weatherInfo.type !== "foggy" && weatherInfo.type !== "digital" && weatherInfo.type !== "glitch";
      if (eSp.trait?.name === "Daily Sync" && isStandardWeather) {
        traitDamageMult *= 0.85; // reduce incoming damage by 15%
        weatherLog += " [Daily Sync Shield reduces damage!]";
      }
      // Kernel Shield (defensive)
      if (weatherInfo.type === "stormy" && eSp.trait?.name === "Kernel Shield") {
        traitDamageMult *= 0.85; // reduce incoming damage by 15%
        weatherLog += " [Kernel Shield stormy mitigation!]";
      }
      // Scope Creep
      if (pSp.trait?.name === "Scope Creep") {
        const creepBoost = Math.min(1.40, 1 + ((battle.turnCount || 1) - 1) * 0.08);
        traitDamageMult *= creepBoost;
        weatherLog += ` [Scope Creep Boost: +${Math.round((creepBoost - 1) * 100)}%]`;
      }

      let isCrit = Math.random() < 0.0625;
      if (weatherInfo.type === "stormy") {
        isCrit = Math.random() < 0.1875; // Tripled
      }
      const critMult = isCrit ? 1.6 : 1.0;

      const damage = Math.round(
        (6 + p.level * 1.8) * mult * diffMult * critMult * weatherDamageMult * traitDamageMult * (0.85 + Math.random() * 0.3)
      );

      // Play hit sound after a short delay so the correct sound finish is clean
      setTimeout(() => {
        if (isCrit) {
          sfxCrit();
        } else if (mult > 1) {
          sfxSuperEffective();
        } else {
          sfxAttackHit();
        }
      }, 300);

      // Roll for status infliction on enemy Devmon (30% chance normally, 60% in snow)
      let statusChance = 0.30;
      if (weatherInfo.type === "snow") {
        statusChance = 0.60;
      }
      if (eSp.trait?.name === "Kernel Shield") {
        statusChance *= 0.50; // Kernel Shield reduces status infliction rate by 50%
      }
      if (eSp.trait?.name === "Technical Debt") {
        statusChance = 0; // Technical Debt is immune to status effects
      }

      let inflictedStatus: "BURN" | "PAR" | "PSN" | "FRZ" | "SLP" | undefined = undefined;
      if (!e.status && Math.random() < statusChance) {
        if (pSp.type === "dev") {
          if (weatherInfo.type === "snow") {
            inflictedStatus = "FRZ";
          } else {
            inflictedStatus = Math.random() < 0.5 ? "PAR" : "FRZ";
          }
        }
        else if (pSp.type === "product") inflictedStatus = "BURN";
        else if (pSp.type === "agile") inflictedStatus = Math.random() < 0.5 ? "PSN" : "SLP";
      }

      // Roll for Fatal Error Crash counter-status on player
      let fatalErrorLog = "";
      if (eSp.trait?.name === "Fatal Error Crash" && !p.status && Math.random() < 0.20) {
        const counterStatus = Math.random() < 0.5 ? "PAR" : "FRZ";
        const statusLabel = counterStatus === "PAR" ? "Paralyzed (Merge Conflict)" : "Frozen (Sprint Lock)";
        fatalErrorLog = ` [Fatal Error Crash: ${p.nick} was ${statusLabel} by ${e.nick}'s crash!]`;
        
        setParty((prev) => {
          const nextParty = [...prev];
          nextParty[battle.playerIdx] = { ...nextParty[battle.playerIdx], status: counterStatus };
          return nextParty;
        });
      }

      // North Star Alignment heal on player
      let alignmentHeal = 0;
      let alignmentLog = "";
      if (pSp.trait?.name === "North Star Alignment") {
        alignmentHeal = Math.round(p.maxHp * 0.08);
        alignmentLog = ` [North Star Alignment healed ${alignmentHeal} HP!]`;
        setParty((prev) => {
          const nextParty = [...prev];
          nextParty[battle.playerIdx] = { 
            ...nextParty[battle.playerIdx], 
            hp: Math.min(nextParty[battle.playerIdx].maxHp, nextParty[battle.playerIdx].hp + alignmentHeal) 
          };
          return nextParty;
        });
      }

      // Apply damage and status
      const nextEnemyHp = Math.max(0, e.hp - damage);
      setBattle((prev) => {
        if (!prev) return null;
        const nextTeam = [...prev.enemyTeam];
        nextTeam[prev.enemyIdx] = { 
          ...nextTeam[prev.enemyIdx], 
          hp: nextEnemyHp,
          status: inflictedStatus || nextTeam[prev.enemyIdx].status
        };
        return { ...prev, enemyTeam: nextTeam, turnCount: (prev.turnCount || 1) + 1 };
      });

      let msg = wokeUpOrThawedMsg + `${p.nick} answers correctly and strikes ${e.nick} for ${damage} damage!${weatherLog}`;
      if (isCrit) msg += " A critical hit!";
      if (question.difficulty >= 3) msg += " Tough question bonus damage!";
      if (mult > 1) msg += " It's super effective!";
      if (mult < 1) msg += " It's not very effective...";
      if (inflictedStatus) {
        if (inflictedStatus === "PAR") msg += ` ${e.nick} was paralyzed by a Merge Conflict!`;
        if (inflictedStatus === "FRZ") msg += ` ${e.nick} got frozen in a Sprint Lock!`;
        if (inflictedStatus === "BURN") msg += ` ${e.nick} suffered Burnout from high load!`;
        if (inflictedStatus === "PSN") msg += ` ${e.nick} was infected with a Toxic Codebase!`;
        if (inflictedStatus === "SLP") msg += ` ${e.nick} fell asleep from Meeting Fatigue!`;
      }
      if (alignmentLog) msg += alignmentLog;
      if (fatalErrorLog) msg += fatalErrorLog;
      setBattleMsg(msg);

      setTimeout(() => {
        if (nextEnemyHp <= 0) {
          handleEnemyFainted();
        } else {
          // Apply end-of-turn Burn/Poison status damage to enemy!
          const enemyStatus = inflictedStatus || e.status;
          if (enemyStatus === "BURN" || enemyStatus === "PSN") {
            const dot = Math.max(1, Math.round(e.maxHp * (enemyStatus === "BURN" ? 0.08 : 0.10)));
            const finalEnemyHp = Math.max(0, nextEnemyHp - dot);

            setBattle((prev) => {
              if (!prev) return null;
              const nextTeam = [...prev.enemyTeam];
              nextTeam[prev.enemyIdx] = { ...nextTeam[prev.enemyIdx], hp: finalEnemyHp };
              return { ...prev, enemyTeam: nextTeam };
            });

            const dotName = enemyStatus === "BURN" ? "Burnout" : "Toxic Codebase";
            setBattleMsg(`${e.nick} takes ${dot} ${dotName} status damage!`);

            setTimeout(() => {
              if (finalEnemyHp <= 0) {
                handleEnemyFainted();
              } else {
                enemyAttackOnly(false);
              }
            }, 1100);
          } else {
            enemyAttackOnly(false);
          }
        }
      }, 1100);
    } else {
      sfxWrong(); // Play wrong answer sound effect

      let retroLog = "";
      // Player Blameless Retro
      if (pSp.trait?.name === "Blameless Retro") {
        const healAmt = Math.round(p.maxHp * 0.12);
        retroLog += ` [Blameless Retro: ${p.nick} learned and healed for ${healAmt} HP!]`;
        setParty((prev) => {
          const nextParty = [...prev];
          nextParty[battle.playerIdx] = {
            ...nextParty[battle.playerIdx],
            hp: Math.min(nextParty[battle.playerIdx].maxHp, nextParty[battle.playerIdx].hp + healAmt)
          };
          return nextParty;
        });
      }
      // Enemy Blameless Retro
      if (eSp.trait?.name === "Blameless Retro") {
        const healAmt = Math.round(e.maxHp * 0.12);
        retroLog += ` [Blameless Retro: ${e.nick} capitalized on your error and healed for ${healAmt} HP!]`;
        setBattle((prev) => {
          if (!prev) return null;
          const nextTeam = [...prev.enemyTeam];
          nextTeam[prev.enemyIdx] = {
            ...nextTeam[prev.enemyIdx],
            hp: Math.min(nextTeam[prev.enemyIdx].maxHp, nextTeam[prev.enemyIdx].hp + healAmt)
          };
          return { ...prev, enemyTeam: nextTeam };
        });
      }

      setBattle((prev) => {
        if (!prev) return null;
        return { ...prev, turnCount: (prev.turnCount || 1) + 1 };
      });

      setBattleMsg(`Incorrect! Your creature hesitates and takes a hit...${retroLog}`);
      setTimeout(() => enemyAttackOnly(true), 1100);
    }
  };

  const useItemInBattle = (itemName: string) => {
    const item = ITEMS[itemName];
    if (!item || !bag[itemName] || bag[itemName] <= 0 || !battle) return;

    const p = party[battle.playerIdx];
    if (item.revive && p.hp > 0) return;
    if (!item.revive && p.hp <= 0) return;

    setParty((prev) => {
      const nextParty = [...prev];
      const nextC = { ...nextParty[battle!.playerIdx] };
      if (item.revive) {
        nextC.hp = Math.round(nextC.maxHp * 0.5);
      } else if (item.heal) {
        nextC.hp = Math.min(nextC.maxHp, nextC.hp + item.heal);
      }
      nextParty[battle!.playerIdx] = nextC;
      return nextParty;
    });

    setBag((prev) => {
      const nextBag = { ...prev };
      nextBag[itemName]--;
      if (nextBag[itemName] <= 0) {
        delete nextBag[itemName];
      }
      return nextBag;
    });

    setBattleMsg(`Used ${itemName} on ${p.nick}!`);
    setTimeout(() => enemyAttackOnly(false), 1100);
  };

  const switchPartyInBattle = (idx: number) => {
    if (!battle) return;
    setBattle((prev) => {
      if (!prev) return null;
      return { ...prev, playerIdx: idx, activeQuestion: undefined };
    });
    setBattleMsg(`Go, ${party[idx].nick}!`);
    setTimeout(() => enemyAttackOnly(false), 1100);
  };

  const attemptCatchInBattle = (itemName: string): boolean => {
    if (!battle) return false;
    const item = ITEMS[itemName];
    if (!item || !bag[itemName] || bag[itemName] <= 0) return false;

    if (party.length >= MAX_PARTY_SIZE) {
      setBattleMsg(`Party is full! Max ${MAX_PARTY_SIZE} creatures allowed.`);
      return false;
    }

    // Spend doc
    setBag((prev) => {
      const nextBag = { ...prev };
      nextBag[itemName]--;
      if (nextBag[itemName] <= 0) {
        delete nextBag[itemName];
      }
      return nextBag;
    });

    const e = battle.enemyTeam[battle.enemyIdx];
    const hpFraction = e.hp / e.maxHp;

    let success = false;
    if (hpFraction < CATCH_HP_THRESHOLD) {
      const lowHpProgress = 1 - hpFraction / CATCH_HP_THRESHOLD;
      const chance = Math.min(0.95, (item.catchRate || 0.35) * (1 + lowHpProgress * 2));
      success = Math.random() < chance;
    }

    setBattleMsg(`You tossed an ${itemName}...`);
    
    // Animation triggered in BattleScreen via context flags/trigger states
    // After shake duration, report result
    setTimeout(() => {
      if (success) {
        const caughtCreature = makeCreature(e.species, e.level);
        caughtCreature.hp = e.hp;

        setParty((prev) => [...prev, caughtCreature]);
        setDex((prev) => {
          const nextDex = { seen: new Set(prev.seen), caught: new Set(prev.caught) };
          nextDex.caught.add(e.species);
          nextDex.seen.add(e.species);
          return nextDex;
        });

        setBattleMsg(`Gotcha! ${e.nick} was recruited successfully!`);
        setTimeout(() => {
          triggerBattleSummary(true, false, () => {
            showDialog([
              `${e.nick} was added to your team!`,
              `Lv.${e.level} · ${e.hp}/${e.maxHp} HP. Save checkpoint created!`,
            ]);
          }, e.nick, e.species);
        }, 1200);
      } else {
        setBattleMsg(`${e.nick} broke free! Weaken it further first.`);
        setTimeout(() => {
          enemyAttackOnly(false);
        }, 1200);
      }
    }, 1800);

    return success;
  };

  const runFromBattle = () => {
    if (!battle) return;
    if (battle.isTrainer) {
      setBattleMsg("Can't run from a stakeholder or trainer battle!");
      return;
    }

    // Low chance (20%) to fail escape from a wild encounter
    if (Math.random() < 0.20) {
      setBattleMsg("Can't escape! The opposing Devmon blocked the exit path!");
      setTimeout(() => {
        enemyAttackOnly(false);
      }, 1200);
      return;
    }

    endBattle(false);
    triggerToast("Got away safely!");
  };

  // Keyboard binding for moves
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inBattle || menuOpen || dialogActive) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") tryMove(0, -1);
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") tryMove(0, 1);
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") tryMove(-1, 0);
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") tryMove(1, 0);
      else if (e.key === "Enter" || e.key === "Spacebar" || e.key === " " || e.key === "z" || e.key === "Z") {
        interact();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [px, py, facing, currentMapId, inBattle, menuOpen, dialogActive, badges, flags]);

  return (
    <GameContext.Provider
      value={{
        playerName,
        px,
        py,
        facing,
        moving,
        currentMapId,
        badges,
        mergedTickets,
        acceptedBounties,
        defeatedBounties,
        party,
        box,
        gold,
        bag,
        flags,
        dex,
        askedHistory,
        inBattle,
        battle,
        battleMsg,
        leveledUpMon,
        dismissLevelUp,
        battleSummary,
        dismissBattleSummary,
        menuOpen,
        activeMenu,
        selectedPartyIdx,
        detailSource,
        dialogActive,
        dialogQueue,
        dialogOnComplete,
        toastConfig,
        fadeActive,
        muted,

        // Actions
        chooseStarter,
        startGame,
        saveGame,
        deleteGame,
        mergeTicket,
        acceptBounty,
        toggleMuteState,
        tryMove,
        setFacingDirection: setFacing,
        setMovingState: setMoving,
        interact,
        showDialog,
        advanceDialog,
        triggerToast,
        openMenu,
        closeMenu,
        setActiveMenu,
        setDetailView,

        // Shop / Inventory
        buyItem,
        sellItem,
        healTeamAtShop,
        transferToBox,
        withdrawFromBox,
        releaseCreature,
        useItemOnParty,
        swapPartyMembers,

        // Battle operations
        startBattle,
        answerQuestion,
        useItemInBattle,
        switchPartyInBattle,
        attemptCatchInBattle,
        runFromBattle,
        setBattleMsg,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
