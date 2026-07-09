import { Species, Creature } from "../types";

export const TYPES = ["product", "dev", "agile"] as const;

export const TYPE_COLOR: Record<"product" | "dev" | "agile", string> = {
  product: "#FF8A3D",
  dev: "#4D96FF",
  agile: "#41E0A3"
};

export const TYPE_LABEL: Record<"product" | "dev" | "agile", string> = {
  product: "PRODUCT",
  dev: "DEV",
  agile: "AGILE"
};

export const STRONG_AGAINST: Record<"product" | "dev" | "agile", "product" | "dev" | "agile"> = {
  product: "dev",
  dev: "agile",
  agile: "product"
};

export const SPECIES: Record<string, Species> = {
  pingu:    { name:"PINGU",       type:"dev",     hp:32, evolvesAt:14, next:"pingux",   desc:"A tiny CLI sprite born from a fresh `git init`.", trait: { name: "Kernel Shield", desc: "Reduces status infliction rate by 50% and mitigates 15% damage under stormy weather." } },
  pingux:   { name:"PINGUX",      type:"dev",     hp:54, evolvesAt:28, next:"kerneldon", desc:"Compiles its own feelings. Smells faintly of coffee.", trait: { name: "Kernel Shield", desc: "Reduces status infliction rate by 50% and mitigates 15% damage under stormy weather." } },
  kerneldon:{ name:"KERNELDON",   type:"dev",     hp:80, evolvesAt:null, next:null,      desc:"The fully matured OS-core beast. Rarely panics.", trait: { name: "Kernel Shield", desc: "Reduces status infliction rate by 50% and mitigates 15% damage under stormy weather." } },

  backlogo: { name:"BACKLOGO",    type:"agile",   hp:30, evolvesAt:13, next:"sprintail", desc:"Carries an ever-growing list nobody fully reads.", trait: { name: "Sprint Velocity", desc: "Provides a 25% damage boost to Agile moves on easy questions." } },
  sprintail:{ name:"SPRINTAIL",   type:"agile",   hp:52, evolvesAt:26, next:"velocirex",  desc:"Moves in fast two-week bursts, then rests to reflect.", trait: { name: "Sprint Velocity", desc: "Provides a 25% damage boost to Agile moves on easy questions." } },
  velocirex:{ name:"VELOCIREX",   type:"agile",   hp:78, evolvesAt:null, next:null,       desc:"A ceremonial predator. Demos with terrifying confidence.", trait: { name: "Sprint Velocity", desc: "Provides a 25% damage boost to Agile moves on easy questions." } },

  roadmole: { name:"ROADMOLE",    type:"product", hp:31, evolvesAt:13, next:"personabit", desc:"Digs tunnels toward a vague but exciting future.", trait: { name: "North Star Alignment", desc: "Heals 8% of max HP on correct answers, ensuring constant product alignment." } },
  personabit:{name:"PERSONABIT",  type:"product", hp:53, evolvesAt:27, next:"northstaur",  desc:"Knows exactly who it's for. Mostly.", trait: { name: "North Star Alignment", desc: "Heals 8% of max HP on correct answers, ensuring constant product alignment." } },
  northstaur:{ name:"NORTHSTAUR", type:"product", hp:79, evolvesAt:null, next:null,        desc:"A guiding-metric titan. Everyone aligns around it eventually.", trait: { name: "North Star Alignment", desc: "Heals 8% of max HP on correct answers, ensuring constant product alignment." } },

  nullpup:      { name:"NULLPUP",      type:"dev", hp:24, evolvesAt:13, next:"stacktrace",   desc:"Throws itself at edge cases it didn't expect.", trait: { name: "Fatal Error Crash", desc: "Has a 20% chance to inflict Paralyze or Sprint Lock (Freeze) on the attacker when hit." } },
  stacktrace:   { name:"STACKTRACE",   type:"dev", hp:48, evolvesAt:27, next:"segfaultitan", desc:"Leaves a long trail of where things went wrong.", trait: { name: "Fatal Error Crash", desc: "Has a 20% chance to inflict Paralyze or Sprint Lock (Freeze) on the attacker when hit." } },
  segfaultitan: { name:"SEGFAULTITAN", type:"dev", hp:76, evolvesAt:null, next:null,          desc:"A towering crash so total nobody can read the logs.", trait: { name: "Fatal Error Crash", desc: "Has a 20% chance to inflict Paralyze or Sprint Lock (Freeze) on the attacker when hit." } },

  standuppy:    { name:"STANDUPPY",    type:"agile", hp:22, evolvesAt:12, next:"pointoker",     desc:"Talks for exactly 90 seconds, then sits back down.", trait: { name: "Daily Sync", desc: "Boosts defenses to reduce all incoming damage by 15% during standard weather." } },
  pointoker:    { name:"POINTOKER",    type:"agile", hp:46, evolvesAt:25, next:"ceremonosaur",  desc:"Shouts numbers at the team until consensus appears.", trait: { name: "Daily Sync", desc: "Boosts defenses to reduce all incoming damage by 15% during standard weather." } },
  ceremonosaur: { name:"CEREMONOSAUR", type:"agile", hp:74, evolvesAt:null, next:null,           desc:"An ancient beast built entirely from recurring meetings.", trait: { name: "Daily Sync", desc: "Boosts defenses to reduce all incoming damage by 15% during standard weather." } },

  scopecreep:     { name:"SCOPECREEP",     type:"product", hp:26, evolvesAt:13, next:"featurecreeper", desc:"Slowly grows bigger the longer a meeting runs.", trait: { name: "Scope Creep", desc: "Grows in size and scope each turn, boosting attack damage by 8% per combat round (max 40%)." } },
  featurecreeper: { name:"FEATURECREEPER", type:"product", hp:50, evolvesAt:26, next:"goldplater",      desc:"Adds 'just one more thing' to every release.", trait: { name: "Scope Creep", desc: "Grows in size and scope each turn, boosting attack damage by 8% per combat round (max 40%)." } },
  goldplater:     { name:"GOLDPLATER",     type:"product", hp:77, evolvesAt:null, next:null,            desc:"Polishes features nobody asked for to a brilliant shine.", trait: { name: "Scope Creep", desc: "Grows in size and scope each turn, boosting attack damage by 8% per combat round (max 40%)." } },

  retrobat:      { name:"RETROBAT",      type:"agile", hp:36, evolvesAt:20, next:"postmortemoth", desc:"Flies backward to see what went wrong last sprint.", trait: { name: "Blameless Retro", desc: "Heals 12% of max HP whenever the developer gets a question incorrect (converting mistakes into valuable learning!)." } },
  postmortemoth: { name:"POSTMORTEMOTH", type:"agile", hp:62, evolvesAt:null, next:null,           desc:"Drawn to the warm glow of a blameless retro.", trait: { name: "Blameless Retro", desc: "Heals 12% of max HP whenever the developer gets a question incorrect (converting mistakes into valuable learning!)." } },

  debtgeist:     { name:"DEBTGEIST",     type:"dev", hp:40, evolvesAt:21, next:"legacywraith", desc:"A haunting reminder of code nobody wants to touch.", trait: { name: "Technical Debt", desc: "Messy legacy structure provides complete immunity to all status ailments." } },
  legacywraith:  { name:"LEGACYWRAITH",  type:"dev", hp:64, evolvesAt:null, next:null,          desc:"Drifts through old systems nobody remembers how to deploy.", trait: { name: "Technical Debt", desc: "Messy legacy structure provides complete immunity to all status ailments." } },

  hypebeam:      { name:"HYPEBEAM",      type:"product", hp:38, evolvesAt:20, next:"vaporwavelord", desc:"Projects excitement onto features that aren't built yet.", trait: { name: "Marketing Vaporware", desc: "15% chance to completely evade any incoming attack since the feature doesn't actually exist yet." } },
  vaporwavelord: { name:"VAPORWAVELORD", type:"product", hp:63, evolvesAt:null, next:null,           desc:"Pure marketing energy, barely tethered to a real roadmap.", trait: { name: "Marketing Vaporware", desc: "15% chance to completely evade any incoming attack since the feature doesn't actually exist yet." } },
};

export const SHAPES: Record<string, string[]> = {
  blob: [
    "0000111111000000",
    "0011111111110000",
    "0111111111111000",
    "1111133113111100",
    "1111133113111100",
    "1111111111111100",
    "1111122222111100",
    "1112222222221100",
    "0112222222211000",
    "0011222222110000",
    "0001122221000000",
    "0001100011000000",
    "0011100001100000",
    "0011000000110000",
    "0000000000000000",
    "0000000000000000",
  ],
  quad: [
    "0001111111100000",
    "0111111111110000",
    "1111133113111100",
    "1111133113111100",
    "1111111111111100",
    "1112222222221100",
    "1112222222221100",
    "0112222222211000",
    "0112222222211000",
    "0011000000110000",
    "0011000000110000",
    "0110000000011000",
    "0110000000011000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
  ],
  bird: [
    "0000011111000000",
    "0001111111100000",
    "0011333113110000",
    "0111133113111100",
    "0111111111111100",
    "1111111111111110",
    "1112222222221100",
    "1112222222221100",
    "0112222222211000",
    "0011222222110000",
    "0001122221100000",
    "0000011001100000",
    "0000011001100000",
    "0000010000100000",
    "0000000000000000",
    "0000000000000000",
  ],
  tall: [
    "0000111111000000",
    "0001111111100000",
    "0011133311110000",
    "0011133311110000",
    "0011111111110000",
    "0001222222100000",
    "0001222222100000",
    "0001222222100000",
    "0001122221000000",
    "0001122221000000",
    "0011122221100000",
    "0011022220110000",
    "0110022200011000",
    "0110000000011000",
    "0000000000000000",
    "0000000000000000",
  ],
  serpent: [
    "0000000011110000",
    "0000001111111000",
    "0000111133113100",
    "0001111111111100",
    "0011111222221100",
    "0111122222222110",
    "1111222222222211",
    "1112222222222110",
    "0111222222221100",
    "0011222222211000",
    "0001122222110000",
    "0000112221100000",
    "0000011110000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
  ],
  spiky: [
    "0010001111000100",
    "0011111111111000",
    "0111133113111100",
    "1111133113111110",
    "1111111111111110",
    "0111122222211100",
    "0011222222221000",
    "1011222222220110",
    "0011222222211000",
    "0001122222110000",
    "0001100001100000",
    "0011000000110000",
    "0110000000011000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
  ],
  pup: [
    "0000000000000000",
    "0011000000110000",
    "0111100001111000",
    "0111111111111100",
    "1113311111133110",
    "1111111111111100",
    "1111122222211100",
    "1112222222221100",
    "1112222222221100",
    "0112222222211000",
    "0011220022110000",
    "0011000000110000",
    "0110000000011000",
    "0110000000011000",
    "0000000000000000",
    "0000000000000000",
  ],
  direwolf: [
    "0001100000011000",
    "0011110000111100",
    "0111111111111110",
    "1111133113111111",
    "1111111111111111",
    "1111111111111111",
    "0111222222221110",
    "0112222222222100",
    "1112222222222110",
    "1112222222222110",
    "0112222222221100",
    "0011002222001100",
    "0011000000011000",
    "0110000000001100",
    "0000000000000000",
    "0000000000000000",
  ],
  titanwolf: [
    "0100000000000010",
    "0110000000000110",
    "0011110000111100",
    "0111111111111110",
    "1111133113111111",
    "1111111111111111",
    "1111111111111111",
    "1112222222222110",
    "1122222222222210",
    "1122222222222210",
    "0112222222222100",
    "0011222222221100",
    "0011002222001100",
    "0110000000001100",
    "1100000000000011",
    "0000000000000000",
  ],
  mound: [
    "0000000000000000",
    "0000011111100000",
    "0001111111111000",
    "0011111111111100",
    "0111133113111110",
    "0111111111111110",
    "1111111111111111",
    "1112222222222110",
    "1122222222222210",
    "1122222222222210",
    "0112222222222100",
    "0011222222221000",
    "0001111111110000",
    "0000011001100000",
    "0000000000000000",
    "0000000000000000",
  ],
  diamond: [
    "0000001100000000",
    "0000011110000000",
    "0000111111000000",
    "0001111111100000",
    "0011133311110000",
    "0111111111111000",
    "1111111111111100",
    "1111222222211110",
    "0111222222221100",
    "0011222222211000",
    "0001122222110000",
    "0000112211000000",
    "0000011001100000",
    "0000010000100000",
    "0000000000000000",
    "0000000000000000",
  ],
  colossus: [
    "0000010001000000",
    "0000011011000000",
    "0001111111100000",
    "0011111111110000",
    "0111133311111000",
    "1111111111111100",
    "1111111111111110",
    "1112222222222110",
    "1112222222222110",
    "0112222222222100",
    "0112222222221100",
    "0011220022211000",
    "0011000000011000",
    "0110000000001100",
    "0110000000001100",
    "0000000000000000",
  ],
  chick: [
    "0000000000000000",
    "0000011111000000",
    "0001111111100000",
    "0011111111110000",
    "0111133311111000",
    "0111111111111000",
    "0111111111111000",
    "0011222222211000",
    "0011222222211000",
    "0001122222110000",
    "0000112222100000",
    "0000011001100000",
    "0000011001100000",
    "0000010000100000",
    "0000000000000000",
    "0000000000000000",
  ],
  megaphone: [
    "0000011111100000",
    "0000111111110000",
    "0001111111111000",
    "0001133113111000",
    "0011111111111100",
    "0011111111111100",
    "0111122222211110",
    "0111222222221110",
    "1111222222222111",
    "1112222222222110",
    "1112222222222110",
    "0112222222221100",
    "0011222222110000",
    "0001111111100000",
    "0000000000000000",
    "0000000000000000",
  ],
  towercrowd: [
    "0000111111000000",
    "0001111111100000",
    "0001133311100000",
    "0001111111100000",
    "0000122221000000",
    "0011122221100000",
    "0111122222111000",
    "0111222222211100",
    "0011222222211000",
    "0011222222211000",
    "0111222222221100",
    "0111222222221100",
    "0011222222211000",
    "0011002222001100",
    "0110000000011000",
    "0000000000000000",
  ],
  creep: [
    "0000001111000000",
    "0000011111100000",
    "0001111111111000",
    "0011113311311100",
    "0011111111111100",
    "0001111111111000",
    "0011122222211000",
    "0111222222221100",
    "0111222222221100",
    "0011222222211000",
    "0001022222010000",
    "0001000000010000",
    "0010000000001000",
    "0100000000000100",
    "0000000000000000",
    "0000000000000000",
  ],
  featuremass: [
    "0001100111000000",
    "0011110111100000",
    "0111111111110000",
    "0111133113111100",
    "1111111111111100",
    "1111111111111110",
    "1112222222211110",
    "1112222222222110",
    "0112222222222100",
    "0112222222221100",
    "0011222222211000",
    "0011220222011000",
    "0001100110001000",
    "0011000000110000",
    "0000000000000000",
    "0000000000000000",
  ],
  bloatking: [
    "0010010010010000",
    "0011110110111000",
    "0111111111111100",
    "0111133113111110",
    "1111111111111110",
    "1111111111111111",
    "1112222222222110",
    "1122222222222210",
    "1122222222222210",
    "1122222222222210",
    "0112222222222100",
    "0112222222221100",
    "0011222222211000",
    "0011002222001100",
    "0001100000011000",
    "0000000000000000",
  ],
  bat: [
    "1100000000000011",
    "1111000000001111",
    "0111110000111110",
    "0011111111111100",
    "0001111111111000",
    "0001133113311000",
    "0011111111111100",
    "0111122222211100",
    "0111222222221100",
    "0011222222211000",
    "0001122222110000",
    "0000112222100000",
    "0000011001100000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
  ],
  moth: [
    "0100000000000010",
    "0110100000010110",
    "0011111111111100",
    "0011133333311100",
    "0111133113311110",
    "1111111111111111",
    "1111122222211111",
    "0112222222222100",
    "0011222222221000",
    "0011022222201000",
    "0001022222010000",
    "0001002200010000",
    "0010000000001000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
  ],
  wraith: [
    "0000111111000000",
    "0001111111100000",
    "0011111111110000",
    "0111133113111000",
    "0111111111111100",
    "0111111111111100",
    "0111122222211100",
    "0111222222221100",
    "0111222222221100",
    "0111222222221100",
    "0111222222221100",
    "0101220022012100",
    "0100220022001000",
    "1000220022000100",
    "0100000000001000",
    "0000000000000000",
  ],
  beam: [
    "0000011111100000",
    "0000111111110000",
    "0001111111111000",
    "0001133113311000",
    "0011111111111100",
    "0011122222211100",
    "0111222222221110",
    "0111222222222110",
    "0011222222221100",
    "0011222222211000",
    "0001022222010000",
    "0001020002010000",
    "0010020002001000",
    "0000020002000000",
    "0000000000000000",
    "0000000000000000",
  ],
  vapor: [
    "0000111100001100",
    "0001111110011110",
    "0111111111111110",
    "0111133113111100",
    "1111111111111110",
    "1111111111111100",
    "0111222222221000",
    "0111222222221100",
    "0011222222211000",
    "0011222222211100",
    "0001122222110000",
    "0001022220100000",
    "0000022002000000",
    "0000020002000000",
    "0000000000000000",
    "0000000000000000",
  ],
  raptor: [
    "0000000001110000",
    "0000000011100000",
    "0000111111100000",
    "0001111111110000",
    "0011133113111000",
    "0111111111111100",
    "1111111111111110",
    "1112222222211110",
    "0112222222221100",
    "0011222222211000",
    "0001122222110000",
    "0001100001100000",
    "0011000000110000",
    "0110000000011000",
    "1100000000001100",
    "0000000000000000",
  ],
};

export const SPECIES_SHAPE: Record<string, string> = {
  pingu: "blob", pingux: "quad", kerneldon: "spiky",
  backlogo: "tall", sprintail: "bird", velocirex: "raptor",
  roadmole: "mound", personabit: "diamond", northstaur: "colossus",

  nullpup: "pup", stacktrace: "direwolf", segfaultitan: "titanwolf",
  standuppy: "chick", pointoker: "megaphone", ceremonosaur: "towercrowd",
  scopecreep: "creep", featurecreeper: "featuremass", goldplater: "bloatking",

  retrobat: "bat", postmortemoth: "moth",
  debtgeist: "serpent", legacywraith: "wraith",
  hypebeam: "beam", vaporwavelord: "vapor",
};

export function shade(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  const nr = Math.max(0, Math.min(255, r + amt));
  const ng = Math.max(0, Math.min(255, g + amt));
  const nb = Math.max(0, Math.min(255, b + amt));

  return `rgb(${nr},${ng},${nb})`;
}

export function drawCreature(
  canvas: HTMLCanvasElement | null,
  speciesId: string,
  opts: { bob?: number; silhouette?: boolean } = {}
): void {
  if (!canvas) return;
  const sp = SPECIES[speciesId];
  if (!sp) return;

  const grid = SHAPES[SPECIES_SHAPE[speciesId] || "blob"];
  const baseColor = TYPE_COLOR[sp.type];
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cell = Math.floor(Math.min(W, H) / 16);
  const offX = (W - cell * 16) / 2;
  const offY = (H - cell * 16) / 2 + (opts.bob || 0);

  // 1. Draw Holographic Deployment Pad underneath the creature (if NOT in silhouette mode)
  if (!opts.silhouette) {
    ctx.save();
    // Position at the static base of the creature sprite grid
    const platformY = (H - cell * 16) / 2 + cell * 14.8;
    ctx.translate(W / 2, platformY);
    ctx.scale(1, 0.28);
    
    // Outer glow ring
    ctx.beginPath();
    ctx.arc(0, 0, cell * 7.5, 0, Math.PI * 2);
    ctx.strokeStyle = baseColor + "22";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner ring
    ctx.beginPath();
    ctx.arc(0, 0, cell * 5.5, 0, Math.PI * 2);
    ctx.strokeStyle = baseColor + "44";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center fill disk with radial glow
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, cell * 5.5);
    grad.addColorStop(0, baseColor + "26");
    grad.addColorStop(0.7, baseColor + "0A");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, cell * 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 2. Draw the Devmon pixel grid
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const v = grid[y][x];
      if (v === "0") continue;

      let color = "";
      if (opts.silhouette) {
        color = "rgba(10, 14, 20, 0.85)";
      } else {
        if (v === "1") color = baseColor;
        else if (v === "2") color = shade(baseColor, -45);
        else if (v === "3") {
          // Cyber laser glow eyes!
          if (sp.type === "dev") color = "#00F0FF"; // Electric Cyan
          else if (sp.type === "product") color = "#FF2E93"; // Neon Hot Pink
          else if (sp.type === "agile") color = "#39FF14"; // Matrix Green
          else color = "#FFFFFF";
        }
      }

      const cx = offX + x * cell;
      const cy = offY + y * cell;

      if (!opts.silhouette) {
        if (v === "3") {
          // Cyber Laser Eyes: Neon shadow-glow effect + shiny white reflection core
          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = cell * 0.9;
          ctx.fillStyle = color;
          ctx.fillRect(cx, cy, cell, cell);

          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(cx + cell * 0.25, cy + cell * 0.25, cell * 0.5, cell * 0.5);
          ctx.restore();
        } else {
          // Body/Shadow Pixels: Sleek LED Matrix Bevel styling
          ctx.fillStyle = color;
          const gap = Math.max(0.5, cell * 0.08);
          ctx.fillRect(cx + gap, cy + gap, cell - gap * 2, cell - gap * 2);

          // Subtle glossy top-left shine highlights
          ctx.fillStyle = v === "1" ? shade(baseColor, 40) : shade(color, 25);
          ctx.fillRect(cx + gap, cy + gap, cell - gap * 2, gap);
          ctx.fillRect(cx + gap, cy + gap, gap, cell - gap * 2);
        }
      } else {
        // Simple silhouette pixels (for caught/uncaught/unknown state)
        ctx.fillStyle = color;
        ctx.fillRect(cx, cy, cell, cell);
      }
    }
  }
}

export function expToNext(level: number): number {
  return Math.floor(6 * level * level + 8 * level);
}

export function makeCreature(speciesId: string, level: number): Creature {
  const sp = SPECIES[speciesId];
  const maxHp = Math.floor((sp?.hp || 20) * (1 + level * 0.12) + 10);
  return {
    species: speciesId,
    nick: sp?.name || "DEVMON",
    level,
    maxHp,
    hp: maxHp,
    exp: 0,
  };
}

export function maybeEvolve(creature: Creature): Creature | null {
  const sp = SPECIES[creature.species];
  if (!sp || sp.evolvesAt === null || !sp.next) return null;

  if (creature.level >= sp.evolvesAt) {
    const oldName = sp.name;
    const nextSp = SPECIES[sp.next];
    const newSpeciesId = sp.next;

    const evolved = { ...creature };
    evolved.species = newSpeciesId;
    if (evolved.nick === oldName) {
      evolved.nick = nextSp.name;
    }
    evolved.maxHp = Math.floor(nextSp.hp * (1 + evolved.level * 0.12) + 10);
    evolved.hp = evolved.maxHp;
    return evolved;
  }

  return null;
}

