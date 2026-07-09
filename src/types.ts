/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DomainType = "product" | "dev" | "agile";

export interface SpeciesTrait {
  name: string;
  desc: string;
}

export interface Species {
  name: string;
  type: DomainType;
  hp: number;
  evolvesAt: number | null;
  next: string | null;
  desc: string;
  trait?: SpeciesTrait;
}

export interface Creature {
  species: string;
  nick: string;
  level: number;
  hp: number;
  maxHp: number;
  exp: number;
  status?: "BURN" | "PAR" | "PSN" | "FRZ" | "SLP";
}

export interface Npc {
  x: number;
  y: number;
  name: string;
  sprite: string;
  dialog: string[];
  giveStarterChoice?: boolean;
  shop?: boolean;
  trainer?: boolean;
  leader?: boolean;
  badge?: string;
  team?: Array<{ species: string; level: number }>;
  defeated?: boolean;
}

export interface Exit {
  x: number;
  y: number;
  w?: number;
  h?: number;
  to: string;
  tx: number;
  ty: number;
  requiresBadges?: string[];
  gateMessage?: string;
}

export interface Decoration {
  x: number;
  y: number;
  type:
    | "desk"
    | "cubicle"
    | "roof_l"
    | "roof_c"
    | "roof_r"
    | "wall_l"
    | "wall_door"
    | "wall_r"
    | "fountain"
    | "server_rack"
    | "street_lamp"
    | "fence_h"
    | "fence_v"
    | "flower_patch";
  solid?: boolean;
}

export interface EncounterConfig {
  species: string;
  weight: number;
  lvl: [number, number];
}

export interface MapData {
  grid: number[][];
  exits: Exit[];
  npcs: Npc[];
  decorations?: Decoration[];
  label: string;
  encounterTable: EncounterConfig[];
}

export interface Question {
  q: string;
  opts: string[];
  a: number;
  difficulty: number;
}

export interface Item {
  price: number;
  sell: number;
  heal?: number;
  revive?: boolean;
  catchRate?: number;
  desc: string;
}

export interface GameFlags {
  hasStarter: boolean;
  talkedProf: boolean;
  beatCustomer: boolean;
}

export interface SavePayload {
  version: number;
  savedAt: number;
  currentMapId: string;
  player: {
    playerName: string;
    px: number;
    py: number;
    facing: "up" | "down" | "left" | "right";
    badges: string[];
    mergedTickets?: string[];
    acceptedBounties?: string[];
    defeatedBounties?: string[];
    party: Creature[];
    box: Creature[];
    gold: number;
    bag: Record<string, number>;
    flags: GameFlags;
    dex: {
      seen: string[];
      caught: string[];
    };
    askedHistory: {
      product: string[];
      dev: string[];
      agile: string[];
    };
  };
  defeatedTrainers: Array<{ mapId: string; x: number; y: number }>;
}
