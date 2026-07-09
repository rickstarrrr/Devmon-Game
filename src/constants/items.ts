import { Item } from "../types";

export const ITEMS: Record<string, Item> = {
  "Patch Kit":        { price: 50,  sell: 20, heal: 20,  desc: "Restores 20 HP to a creature." },
  "Refactor Crystal":  { price: 150, sell: 60, heal: 9999, desc: "Fully restores a creature's HP." },
  "Coffee Boost":      { price: 80,  sell: 30, revive: true, heal: 9999, desc: "Revives a fainted creature to half HP." },
  "Lint Spray":        { price: 30,  sell: 10, heal: 10,  desc: "A quick fix. Restores 10 HP." },
  "Onboarding Doc":    { price: 100, sell: 35, catchRate: 0.35, desc: "Recruits a wild creature onto your team. Works best on weakened foes." },
};
