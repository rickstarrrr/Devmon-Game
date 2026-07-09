import { MapData } from "../types";

export const TILE = 32;

function makeMap(w: number, h: number, fill: number): number[][] {
  const rows: number[][] = [];
  for (let y = 0; y < h; y++) {
    rows.push(new Array(w).fill(fill));
  }
  return rows;
}

function rect(map: number[][], x0: number, y0: number, x1: number, y1: number, val: number): void {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (map[y] && map[y][x] !== undefined) {
        map[y][x] = val;
      }
    }
  }
}

// Map definitions
const townGrid = makeMap(17, 22, 1);
rect(townGrid, 2, 2, 14, 16, 0); // open field
rect(townGrid, 7, 0, 9, 2, 2);   // north corridor
rect(townGrid, 7, 16, 9, 21, 2); // south corridor
rect(townGrid, 0, 8, 2, 10, 2);  // west corridor
rect(townGrid, 14, 8, 16, 10, 2); // east corridor
rect(townGrid, 4, 11, 6, 13, 4);  // tall grass patch 1
rect(townGrid, 10, 11, 12, 13, 4); // tall grass patch 2
rect(townGrid, 2, 3, 4, 5, 5);    // shop door trigger
rect(townGrid, 11, 2, 13, 4, 3);   // beautiful scenic pond in town

const feature1Grid = makeMap(17, 20, 1);
rect(feature1Grid, 1, 2, 13, 16, 0);
rect(feature1Grid, 6, 0, 8, 2, 2);    // north corridor
rect(feature1Grid, 6, 16, 9, 19, 2);  // south corridor
rect(feature1Grid, 13, 8, 16, 10, 2); // east corridor
rect(feature1Grid, 2, 3, 5, 7, 4);
rect(feature1Grid, 9, 3, 12, 7, 4);
rect(feature1Grid, 2, 10, 5, 14, 4);
rect(feature1Grid, 9, 10, 12, 14, 4);
rect(feature1Grid, 6, 11, 8, 13, 3);  // central training pond

const feature3Grid = makeMap(17, 14, 1);
rect(feature3Grid, 3, 1, 15, 12, 0);
rect(feature3Grid, 0, 7, 3, 9, 2);   // west corridor
rect(feature3Grid, 8, 0, 10, 1, 2);  // small north path decoration
rect(feature3Grid, 4, 2, 7, 5, 4);
rect(feature3Grid, 11, 2, 14, 5, 4);
rect(feature3Grid, 4, 9, 7, 11, 4);
rect(feature3Grid, 11, 9, 14, 11, 4);
rect(feature3Grid, 8, 4, 10, 5, 3);   // cooling water trench

const feature2Grid = makeMap(19, 18, 1);
rect(feature2Grid, 3, 3, 17, 16, 0);
rect(feature2Grid, 0, 9, 3, 11, 2);   // west corridor
rect(feature2Grid, 15, 0, 17, 3, 2);  // north corridor
rect(feature2Grid, 5, 4, 9, 7, 4);
rect(feature2Grid, 11, 4, 15, 7, 4);
rect(feature2Grid, 4, 12, 8, 15, 4);
rect(feature2Grid, 12, 12, 16, 15, 4);
rect(feature2Grid, 3, 13, 17, 13, 3); // transaction ledger stream
rect(feature2Grid, 10, 13, 10, 13, 2); // path bridge crossing

const feature4Grid = makeMap(13, 17, 1);
rect(feature4Grid, 1, 1, 11, 13, 0);
rect(feature4Grid, 5, 13, 7, 16, 2); // south corridor
rect(feature4Grid, 2, 3, 4, 6, 4);
rect(feature4Grid, 8, 3, 10, 6, 4);
rect(feature4Grid, 2, 8, 4, 10, 4);
rect(feature4Grid, 8, 8, 10, 10, 4);
rect(feature4Grid, 2, 11, 4, 12, 3);  // staging security pond left
rect(feature4Grid, 8, 11, 10, 12, 3); // staging security pond right

const stakeholderfloorGrid = makeMap(15, 17, 1);
rect(stakeholderfloorGrid, 1, 1, 13, 12, 2);
rect(stakeholderfloorGrid, 6, 12, 8, 16, 2); // south corridor

const customerhqGrid = makeMap(11, 15, 1);
rect(customerhqGrid, 1, 1, 9, 10, 2);
rect(customerhqGrid, 4, 10, 6, 14, 2); // south corridor

export const MAPS: Record<string, MapData> = {
  town: {
    grid: townGrid,
    decorations: [
      // General Stack Shop Building
      { x: 2, y: 2, type: "roof_l", solid: true },
      { x: 3, y: 2, type: "roof_c", solid: true },
      { x: 4, y: 2, type: "roof_r", solid: true },
      { x: 2, y: 3, type: "wall_l", solid: true },
      { x: 3, y: 3, type: "wall_door", solid: true },
      { x: 4, y: 3, type: "wall_r", solid: true },

      // Prof. Backlog's Lab Building
      { x: 5, y: 4, type: "roof_l", solid: true },
      { x: 6, y: 4, type: "roof_c", solid: true },
      { x: 7, y: 4, type: "roof_r", solid: true },
      { x: 5, y: 5, type: "wall_l", solid: true },
      { x: 6, y: 5, type: "wall_door", solid: true },
      { x: 7, y: 5, type: "wall_r", solid: true },

      // Central Plaza Fountain
      { x: 8, y: 9, type: "fountain", solid: true },

      // Street Lamps
      { x: 5, y: 8, type: "street_lamp", solid: true },
      { x: 11, y: 8, type: "street_lamp", solid: true },
      { x: 5, y: 14, type: "street_lamp", solid: true },
      { x: 11, y: 14, type: "street_lamp", solid: true },

      // Flower patches
      { x: 2, y: 7, type: "flower_patch" },
      { x: 14, y: 7, type: "flower_patch" },
      { x: 8, y: 4, type: "flower_patch" },
      { x: 14, y: 13, type: "flower_patch" },
      { x: 2, y: 13, type: "flower_patch" },
    ],
    exits: [
      { x: 8, y: 0, w: 2, h: 2, to: "feature1", tx: 7, ty: 14 },
      { x: 15, y: 9, w: 2, h: 2, to: "feature2", tx: 3, ty: 10 },
      { x: 0, y: 9, w: 2, h: 2, to: "stakeholderfloor", tx: 7, ty: 12 },
      {
        x: 8,
        y: 20,
        w: 2,
        h: 2,
        to: "customerhq",
        tx: 5,
        ty: 9,
        requiresBadges: [
          "ENGINEERING SIGN-OFF",
          "EXECUTIVE SIGN-OFF",
          "GROWTH SIGN-OFF",
          "COMPLIANCE SIGN-OFF",
        ],
        gateMessage:
          'A velvet rope blocks the way. "All four Stakeholder sign-offs are required before you can see the Customer."',
      },
    ],
    npcs: [
      {
        x: 8,
        y: 6,
        name: "BOUNTY BOARD",
        sprite: "bounty_board",
        dialog: ["BOUNTY BOARD\nAccept NPC requests to defeat rogue Devmons in the wild!"],
      },
      {
        x: 6,
        y: 6,
        name: "PROF. BACKLOG",
        sprite: "npc_prof",
        dialog: [
          "Hey! You there — come here a moment!",
          "Welcome to DEVMON, the world of living code-creatures!",
          "Every creature here embodies a piece of how we build software — some are PRODUCT-types, some DEV-types, some AGILE-types.",
          "Each type has the upper hand on another: PRODUCT beats DEV, DEV beats AGILE, and AGILE beats PRODUCT.",
          "Take this starter and begin your journey across the Stack!",
        ],
        giveStarterChoice: true,
      },
      {
        x: 11,
        y: 7,
        name: "OLD ENGINEER",
        sprite: "npc_gen",
        dialog: [
          "Back in my day we shipped on floppy disks and PRAYED.",
          "See that tall grass nearby? Real low-level creatures hide in there — perfect for a brand new team.",
        ],
      },
      {
        x: 3,
        y: 15,
        name: "INTERN",
        sprite: "npc_gen",
        dialog: [
          "Head west to the Stakeholder Review Floor — all four Stakeholders wait there. Earn all four sign-offs and you can finally meet... THE CUSTOMER.",
          "Nobody who's gone in has come out the same.",
        ],
      },
      {
        x: 3,
        y: 4,
        name: "VENDOR",
        sprite: "npc_shop",
        dialog: [
          "Welcome to the General Stack Shop!",
          "Buy supplies, sell what you don't need, or pay me to patch up your team.",
        ],
        shop: true,
      },
      {
        x: 4,
        y: 3,
        name: "SIGN",
        sprite: "sign",
        dialog: ["GENERAL STACK SHOP\nBuy ⋅ Sell ⋅ Heal your team"],
      },
      {
        x: 10,
        y: 15,
        name: "SIGN",
        sprite: "sign",
        dialog: [
          "CUSTOMER HQ — SOUTH ENTRANCE\nRequires all 4 Stakeholder sign-offs.",
        ],
      },
      {
        x: 10,
        y: 3,
        name: "SIGN",
        sprite: "sign",
        dialog: ["FEATURE 1: USER ONBOARDING\nNorth exit"],
      },
      {
        x: 13,
        y: 9,
        name: "SIGN",
        sprite: "sign",
        dialog: ["FEATURE 2: PAYMENTS INTEGRATION\nEast exit"],
      },
      {
        x: 3,
        y: 9,
        name: "SIGN",
        sprite: "sign",
        dialog: ["STAKEHOLDER REVIEW FLOOR\nWest exit"],
      },
    ],
    label: "VERSION TOWN",
    encounterTable: [
      { species: "nullpup", weight: 3, lvl: [2, 3] },
      { species: "standuppy", weight: 3, lvl: [2, 3] },
      { species: "scopecreep", weight: 3, lvl: [2, 3] },
    ],
  },
  feature1: {
    grid: feature1Grid,
    decorations: [
      { x: 4, y: 1, type: "street_lamp", solid: true },
      { x: 10, y: 1, type: "street_lamp", solid: true },
      { x: 4, y: 15, type: "street_lamp", solid: true },
      { x: 10, y: 15, type: "street_lamp", solid: true },
      
      // Dividing decorative fence rows
      { x: 1, y: 9, type: "fence_h", solid: true },
      { x: 2, y: 9, type: "fence_h", solid: true },
      { x: 3, y: 9, type: "fence_h", solid: true },
      { x: 4, y: 9, type: "fence_h", solid: true },
      { x: 5, y: 9, type: "fence_h", solid: true },
      
      { x: 9, y: 9, type: "fence_h", solid: true },
      { x: 10, y: 9, type: "fence_h", solid: true },
      { x: 11, y: 9, type: "fence_h", solid: true },
      { x: 12, y: 9, type: "fence_h", solid: true },
      { x: 13, y: 9, type: "fence_h", solid: true },

      // Flowers
      { x: 1, y: 2, type: "flower_patch" },
      { x: 13, y: 2, type: "flower_patch" },
      { x: 1, y: 16, type: "flower_patch" },
      { x: 13, y: 16, type: "flower_patch" },
    ],
    exits: [
      { x: 7, y: 18, w: 2, h: 2, to: "town", tx: 7, ty: 1 },
      { x: 15, y: 9, w: 2, h: 2, to: "feature3", tx: 1, ty: 8 },
    ],
    npcs: [
      {
        x: 3,
        y: 8,
        name: "BUSINESS ANALYST",
        sprite: "npc_gen",
        dialog: [
          "I run practice battles here — purely for training, no sign-off on the line.",
          "Want to battle? My BACKLOGO is ready!",
        ],
        trainer: true,
        team: [{ species: "backlogo", level: 6 }],
      },
      {
        x: 11,
        y: 14,
        name: "BUSINESS ANALYST",
        sprite: "npc_gen",
        dialog: [
          "Just a practice battle — this one won't count toward any Stakeholder sign-off.",
          "Let's battle and find out if it builds!",
        ],
        trainer: true,
        team: [
          { species: "pingu", level: 5 },
          { species: "nullpup", level: 5 },
        ],
      },
      {
        x: 9,
        y: 16,
        name: "SIGN",
        sprite: "sign",
        dialog: ["VERSION TOWN\nSouth exit"],
      },
      {
        x: 12,
        y: 8,
        name: "SIGN",
        sprite: "sign",
        dialog: ["FEATURE 3: SEARCH & DISCOVERY\nEast exit"],
      },
    ],
    label: "FEATURE 1: USER ONBOARDING",
    encounterTable: [
      { species: "pingu", weight: 3, lvl: [3, 6] },
      { species: "backlogo", weight: 3, lvl: [3, 6] },
      { species: "roadmole", weight: 3, lvl: [3, 6] },
      { species: "nullpup", weight: 2, lvl: [2, 5] },
      { species: "standuppy", weight: 2, lvl: [2, 5] },
      { species: "scopecreep", weight: 2, lvl: [2, 5] },
    ],
  },
  feature3: {
    grid: feature3Grid,
    decorations: [
      // Server cluster 1
      { x: 3, y: 2, type: "server_rack", solid: true },
      { x: 3, y: 3, type: "server_rack", solid: true },
      { x: 3, y: 4, type: "server_rack", solid: true },
      
      // Server cluster 2
      { x: 15, y: 2, type: "server_rack", solid: true },
      { x: 15, y: 3, type: "server_rack", solid: true },
      { x: 15, y: 4, type: "server_rack", solid: true },
      
      { x: 5, y: 6, type: "street_lamp", solid: true },
      { x: 11, y: 6, type: "street_lamp", solid: true },
      
      // Flowers in between tech
      { x: 5, y: 2, type: "flower_patch" },
      { x: 11, y: 2, type: "flower_patch" },
      { x: 5, y: 11, type: "flower_patch" },
      { x: 11, y: 11, type: "flower_patch" },
    ],
    exits: [{ x: 0, y: 8, w: 2, h: 2, to: "feature1", tx: 14, ty: 9 }],
    npcs: [
      {
        x: 6,
        y: 8,
        name: "BUSINESS ANALYST",
        sprite: "npc_gen",
        dialog: [
          "I A/B test my own breakfast choices now. It's a problem. This is just a practice battle, by the way.",
          "Let's see what the numbers say about your team!",
        ],
        trainer: true,
        team: [
          { species: "stacktrace", level: 13 },
          { species: "pointoker", level: 12 },
        ],
      },
      {
        x: 12,
        y: 10,
        name: "BUSINESS ANALYST",
        sprite: "npc_gen",
        dialog: [
          "Rank #1 or it didn't happen. Don't worry, no sign-off rides on this one.",
          "Battle me and climb the results page!",
        ],
        trainer: true,
        team: [
          { species: "featurecreeper", level: 13 },
          { species: "sprintail", level: 13 },
        ],
      },
      {
        x: 4,
        y: 10,
        name: "SIGN",
        sprite: "sign",
        dialog: ["FEATURE 1: USER ONBOARDING\nWest exit"],
      },
    ],
    label: "FEATURE 3: SEARCH & DISCOVERY",
    encounterTable: [
      { species: "stacktrace", weight: 2, lvl: [11, 14] },
      { species: "pointoker", weight: 2, lvl: [11, 14] },
      { species: "featurecreeper", weight: 2, lvl: [11, 14] },
      { species: "roadmole", weight: 2, lvl: [10, 13] },
      { species: "backlogo", weight: 2, lvl: [10, 13] },
      { species: "pingu", weight: 2, lvl: [10, 13] },
    ],
  },
  feature2: {
    grid: feature2Grid,
    decorations: [
      // Central ledger servers
      { x: 4, y: 4, type: "server_rack", solid: true },
      { x: 5, y: 4, type: "server_rack", solid: true },
      { x: 13, y: 4, type: "server_rack", solid: true },
      { x: 14, y: 4, type: "server_rack", solid: true },
      
      // Safety wooden fences running alongside the river
      { x: 3, y: 12, type: "fence_h", solid: true },
      { x: 4, y: 12, type: "fence_h", solid: true },
      { x: 5, y: 12, type: "fence_h", solid: true },
      { x: 6, y: 12, type: "fence_h", solid: true },
      
      { x: 13, y: 12, type: "fence_h", solid: true },
      { x: 14, y: 12, type: "fence_h", solid: true },
      { x: 15, y: 12, type: "fence_h", solid: true },
      { x: 16, y: 12, type: "fence_h", solid: true },

      { x: 7, y: 8, type: "street_lamp", solid: true },
      { x: 11, y: 8, type: "street_lamp", solid: true },
      
      { x: 4, y: 15, type: "flower_patch" },
      { x: 14, y: 15, type: "flower_patch" },
    ],
    exits: [
      { x: 0, y: 10, w: 2, h: 2, to: "town", tx: 13, ty: 9 },
      { x: 16, y: 0, w: 2, h: 2, to: "feature4", tx: 7, ty: 13 },
    ],
    npcs: [
      {
        x: 8,
        y: 14,
        name: "BUSINESS ANALYST",
        sprite: "npc_gen",
        dialog: [
          "Everything is fine. Nothing is on fire. Probably. Just a practice battle, no sign-off at stake.",
          "Let's see how your team handles pressure!",
        ],
        trainer: true,
        team: [
          { species: "debtgeist", level: 9 },
          { species: "kerneldon", level: 8 },
        ],
      },
      {
        x: 14,
        y: 6,
        name: "BUSINESS ANALYST",
        sprite: "npc_gen",
        dialog: [
          "I prototype in the void between Figma and reality. Purely practice, nothing official.",
          "Battle me — my HYPEBEAM is feeling optimistic.",
        ],
        trainer: true,
        team: [
          { species: "hypebeam", level: 9 },
          { species: "roadmole", level: 9 },
        ],
      },
      {
        x: 4,
        y: 11,
        name: "SIGN",
        sprite: "sign",
        dialog: ["VERSION TOWN\nWest exit"],
      },
      {
        x: 16,
        y: 4,
        name: "SIGN",
        sprite: "sign",
        dialog: ["FEATURE 4: CHECKOUT FLOW\nNorth exit"],
      },
    ],
    label: "FEATURE 2: PAYMENTS INTEGRATION",
    encounterTable: [
      { species: "pingux", weight: 2, lvl: [7, 11] },
      { species: "sprintail", weight: 2, lvl: [7, 11] },
      { species: "personabit", weight: 2, lvl: [7, 11] },
      { species: "retrobat", weight: 3, lvl: [6, 10] },
      { species: "debtgeist", weight: 2, lvl: [6, 10] },
      { species: "hypebeam", weight: 2, lvl: [6, 10] },
    ],
  },
  feature4: {
    grid: feature4Grid,
    decorations: [
      { x: 2, y: 2, type: "server_rack", solid: true },
      { x: 10, y: 2, type: "server_rack", solid: true },
      
      // Dividing high-tech gate fences
      { x: 3, y: 2, type: "fence_h", solid: true },
      { x: 4, y: 2, type: "fence_h", solid: true },
      { x: 8, y: 2, type: "fence_h", solid: true },
      { x: 9, y: 2, type: "fence_h", solid: true },

      { x: 6, y: 6, type: "fountain", solid: true },
      { x: 3, y: 9, type: "street_lamp", solid: true },
      { x: 9, y: 9, type: "street_lamp", solid: true },

      { x: 2, y: 11, type: "flower_patch" },
      { x: 10, y: 11, type: "flower_patch" },
    ],
    exits: [{ x: 6, y: 15, w: 2, h: 2, to: "feature2", tx: 16, ty: 3 }],
    npcs: [
      {
        x: 3,
        y: 5,
        name: "BUSINESS ANALYST",
        sprite: "npc_gen",
        dialog: [
          "I've seen things. Chargebacks. Disputed refunds. The works. Relax though, this is just practice.",
          "Let's stress-test your team!",
        ],
        trainer: true,
        team: [
          { species: "legacywraith", level: 17 },
          { species: "postmortemoth", level: 17 },
        ],
      },
      {
        x: 9,
        y: 9,
        name: "BUSINESS ANALYST",
        sprite: "npc_gen",
        dialog: [
          "Have you actually read the Terms of Service? No? Thought so. Don't worry, no sign-off rides on this fight.",
          "Let's see if your team can withstand scrutiny.",
        ],
        trainer: true,
        team: [
          { species: "vaporwavelord", level: 17 },
          { species: "featurecreeper", level: 18 },
        ],
      },
      {
        x: 7,
        y: 13,
        name: "SIGN",
        sprite: "sign",
        dialog: ["FEATURE 2: PAYMENTS INTEGRATION\nSouth exit"],
      },
    ],
    label: "FEATURE 4: CHECKOUT FLOW",
    encounterTable: [
      { species: "legacywraith", weight: 2, lvl: [15, 18] },
      { species: "postmortemoth", weight: 2, lvl: [15, 18] },
      { species: "vaporwavelord", weight: 2, lvl: [15, 18] },
      { species: "stacktrace", weight: 2, lvl: [14, 17] },
      { species: "pointoker", weight: 2, lvl: [14, 17] },
      { species: "featurecreeper", weight: 2, lvl: [14, 17] },
    ],
  },
  stakeholderfloor: {
    grid: stakeholderfloorGrid,
    exits: [{ x: 6, y: 15, w: 2, h: 2, to: "town", tx: 7, ty: 9 }],
    decorations: [
      { x: 3, y: 4, type: "desk", solid: true },
      { x: 4, y: 4, type: "cubicle", solid: true },
      { x: 11, y: 4, type: "desk", solid: true },
      { x: 10, y: 4, type: "cubicle", solid: true },
      { x: 3, y: 10, type: "desk", solid: true },
      { x: 4, y: 10, type: "cubicle", solid: true },
      { x: 11, y: 10, type: "desk", solid: true },
      { x: 10, y: 10, type: "cubicle", solid: true },
      
      // Additional executive office details
      { x: 7, y: 1, type: "fountain", solid: true }, // lobby cooler
      { x: 2, y: 7, type: "street_lamp", solid: true },
      { x: 12, y: 7, type: "street_lamp", solid: true },
      { x: 1, y: 12, type: "flower_patch" },
      { x: 13, y: 12, type: "flower_patch" },
    ],
    npcs: [
      {
        x: 3,
        y: 3,
        name: "THE ENGINEERING MANAGER",
        sprite: "npc_leader",
        dialog: [
          "I'm the Engineering Manager — nothing ships without my sign-off.",
          "Prove your team understands the fundamentals across PRODUCT, DEV, and AGILE — then we'll talk sign-off.",
        ],
        trainer: true,
        leader: true,
        badge: "ENGINEERING SIGN-OFF",
        team: [
          { species: "sprintail", level: 10 },
          { species: "personabit", level: 10 },
          { species: "pingux", level: 11 },
        ],
      },
      {
        x: 11,
        y: 3,
        name: "THE EXECUTIVE SPONSOR",
        sprite: "npc_leader",
        dialog: [
          "I'm the one who answers for this budget at the board meeting.",
          "Show me your team can recover from a bad sprint AND a bad deploy.",
        ],
        trainer: true,
        leader: true,
        badge: "EXECUTIVE SIGN-OFF",
        team: [
          { species: "velocirex", level: 16 },
          { species: "northstaur", level: 16 },
          { species: "kerneldon", level: 17 },
        ],
      },
      {
        x: 3,
        y: 9,
        name: "THE HEAD OF GROWTH",
        sprite: "npc_leader",
        dialog: [
          "Every metric on my dashboard needs to go up and to the right.",
          "Show me your team can find, convert, and retain — then we'll talk sign-off.",
        ],
        trainer: true,
        leader: true,
        badge: "GROWTH SIGN-OFF",
        team: [
          { species: "ceremonosaur", level: 19 },
          { species: "goldplater", level: 18 },
          { species: "segfaultitan", level: 19 },
        ],
      },
      {
        x: 11,
        y: 9,
        name: "THE COMPLIANCE OFFICER",
        sprite: "npc_leader",
        dialog: [
          "Before you say anything — is this GDPR compliant?",
          "Show me your team can survive an audit. Then we'll talk sign-off.",
        ],
        trainer: true,
        leader: true,
        badge: "COMPLIANCE SIGN-OFF",
        team: [
          { species: "legacywraith", level: 20 },
          { species: "postmortemoth", level: 20 },
          { species: "vaporwavelord", level: 21 },
        ],
      },
      {
        x: 7,
        y: 6,
        name: "SIGN",
        sprite: "sign",
        dialog: [
          "STAKEHOLDER REVIEW FLOOR\nFour Stakeholders, four sign-offs. Beat them all to unlock the Customer.",
        ],
      },
      {
        x: 9,
        y: 10,
        name: "SIGN",
        sprite: "sign",
        dialog: ["VERSION TOWN\nSouth exit"],
      },
    ],
    label: "STAKEHOLDER REVIEW FLOOR",
    encounterTable: [],
  },
  customerhq: {
    grid: customerhqGrid,
    decorations: [
      { x: 5, y: 1, type: "fountain", solid: true },
      { x: 1, y: 2, type: "server_rack", solid: true },
      { x: 9, y: 2, type: "server_rack", solid: true },
      { x: 2, y: 5, type: "street_lamp", solid: true },
      { x: 8, y: 5, type: "street_lamp", solid: true },
      { x: 2, y: 9, type: "flower_patch" },
      { x: 8, y: 9, type: "flower_patch" },
    ],
    exits: [{ x: 4, y: 13, w: 2, h: 2, to: "town", tx: 7, ty: 9 }],
    npcs: [
      {
        x: 5,
        y: 3,
        name: "THE CUSTOMER",
        sprite: "npc_customer",
        dialog: [
          "Oh, you must be the team I keep hearing about.",
          "I don't care how you built it. I just want it to work, today, for free, exactly the way I imagined it — which I will not describe to you in advance.",
          "Impress me.",
        ],
        trainer: true,
        leader: true,
        badge: "CUSTOMER APPROVAL",
        team: [
          { species: "northstaur", level: 22 },
          { species: "kerneldon", level: 22 },
          { species: "velocirex", level: 23 },
        ],
      },
      {
        x: 7,
        y: 8,
        name: "SIGN",
        sprite: "sign",
        dialog: ["VERSION TOWN\nSouth exit"],
      },
    ],
    label: "CUSTOMER HQ",
    encounterTable: [],
  },
};
