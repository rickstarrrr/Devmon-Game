/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { useGame, MAX_PARTY_SIZE, MAX_BOX_SIZE } from "../context/GameContext";
import { SPECIES, TYPE_LABEL, TYPE_COLOR, drawCreature, STRONG_AGAINST, SHAPES, SPECIES_SHAPE, shade } from "../constants/creatures";
import { ITEMS } from "../constants/items";
import { expToNext } from "../constants/creatures";
import { StatusBadge } from "./StatusBadge";
import { MAPS } from "../constants/maps";

interface MapZoneDetail {
  id: string;
  name: string;
  codeName: string;
  desc: string;
  gridClass: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
  wildLevels: string;
  bosses: string[];
}

const ZONE_DETAILS: Record<string, MapZoneDetail> = {
  feature1: {
    id: "feature1",
    name: "User Onboarding",
    codeName: "FEATURE_1_ONBOARDING",
    desc: "A sandbox environment containing lightweight code blocks and early-stage classes. Perfect for training fresh Devmon instances.",
    gridClass: "col-start-2 row-start-1",
    bgColor: "bg-emerald-950/45",
    borderColor: "border-emerald-500/40",
    textColor: "text-emerald-400",
    icon: "🚀",
    wildLevels: "Lv. 2-6",
    bosses: ["Business Analyst (Trainer)"]
  },
  feature3: {
    id: "feature3",
    name: "Search & Discovery",
    codeName: "FEATURE_3_SEARCH_INDEX",
    desc: "An optimized lookup network with high index lookup speeds. Devmons here specialize in quick query processing and high-performance algorithms.",
    gridClass: "col-start-3 row-start-1",
    bgColor: "bg-cyan-950/45",
    borderColor: "border-cyan-500/40",
    textColor: "text-cyan-400",
    icon: "🔍",
    wildLevels: "Lv. 10-14",
    bosses: ["Business Analyst (Trainer)"]
  },
  stakeholderfloor: {
    id: "stakeholderfloor",
    name: "Stakeholder Floor",
    codeName: "STAKEHOLDER_REVIEW",
    desc: "The compliance and review center. All four major Stakeholders reside here, auditing code and demanding sign-offs before production releases.",
    gridClass: "col-start-1 row-start-2",
    bgColor: "bg-purple-950/45",
    borderColor: "border-purple-500/40",
    textColor: "text-purple-400",
    icon: "🏢",
    wildLevels: "Safe Segment",
    bosses: ["EM", "Sponsor", "Growth", "Compliance"]
  },
  town: {
    id: "town",
    name: "Version Town",
    codeName: "LOCAL_HOST_WORKSPACE",
    desc: "Your secure local development environment. Contains the General Stack Shop, Prof. Backlog's office, the Sprint Bounty Board, and a healing station.",
    gridClass: "col-start-2 row-start-2",
    bgColor: "bg-blue-950/45",
    borderColor: "border-blue-500/40",
    textColor: "text-blue-400",
    icon: "🏡",
    wildLevels: "Lv. 2-3",
    bosses: ["Prof. Backlog"]
  },
  feature2: {
    id: "feature2",
    name: "Payments Sandbox",
    codeName: "FEATURE_2_PAYMENTS",
    desc: "A secure transactional workspace filled with ledger-type Devmons, checkout APIs, and financial event handlers. Beware of network delays!",
    gridClass: "col-start-3 row-start-2",
    bgColor: "bg-amber-950/45",
    borderColor: "border-amber-500/40",
    textColor: "text-amber-400",
    icon: "💳",
    wildLevels: "Lv. 6-11",
    bosses: ["Business Analyst (Trainer)"]
  },
  customerhq: {
    id: "customerhq",
    name: "Customer HQ",
    codeName: "PRODUCTION_ENVIRONMENT",
    desc: "The ultimate live production environment. Once all 4 Stakeholders sign off, face the supreme authority: The Customer, who demands full functionality.",
    gridClass: "col-start-2 row-start-3",
    bgColor: "bg-rose-950/45",
    borderColor: "border-rose-500/40",
    textColor: "text-rose-400",
    icon: "👑",
    wildLevels: "Production Staging",
    bosses: ["The Customer"]
  },
  feature4: {
    id: "feature4",
    name: "Checkout Flow",
    codeName: "FEATURE_4_CHECKOUT",
    desc: "A critical staging environment hosting payments logic and session handlers. Packed with complex technical debt and legacy wraiths.",
    gridClass: "col-start-3 row-start-3",
    bgColor: "bg-orange-950/45",
    borderColor: "border-orange-500/40",
    textColor: "text-orange-400",
    icon: "🛒",
    wildLevels: "Lv. 14-18",
    bosses: ["Business Analyst (Trainer)"]
  }
};

export const OverlayMenu: React.FC = () => {
  const {
    activeMenu,
    menuOpen,
    closeMenu,
    party,
    box,
    gold,
    bag,
    badges,
    mergedTickets,
    mergeTicket,
    dex,
    selectedPartyIdx,
    detailSource,
    openMenu,
    setActiveMenu,
    triggerToast,
    chooseStarter,
    setDetailView,
    buyItem,
    sellItem,
    healTeamAtShop,
    transferToBox,
    withdrawFromBox,
    releaseCreature,
    useItemOnParty,
    swapPartyMembers,
    flags,
    startGame,
    saveGame,
    muted,
    toggleMuteState,
    acceptedBounties,
    defeatedBounties,
    acceptBounty,
    currentMapId,
  } = useGame();

  const getTickets = () => {
    const baseTickets = [
      {
        id: "JIRA-101",
        title: "Resolve Legacy Spaghetti Code",
        type: "Bug/Hotfix",
        desc: "Deploy files have become tangled. Capture a legacywraith from deep grass to untangle imports.",
        reward: "💰 500G ⋅ Onboarding Doc (x2)",
        status: mergedTickets.includes("JIRA-101")
          ? "merged"
          : (dex.caught.has("legacywraith") || party.some(c => c.species === "legacywraith") || box.some(c => c.species === "legacywraith"))
          ? "ready"
          : flags.talkedProf
          ? "progress"
          : "backlog"
      },
      {
        id: "JIRA-202",
        title: "Merge Sprint Retrospective",
        type: "Ceremony/Sprint",
        desc: "Engineering manager is holding up releases. Defeat them and earn the Engineering Sign-Off badge.",
        reward: "💰 1000G ⋅ Coffee Boost (x2)",
        status: mergedTickets.includes("JIRA-202")
          ? "merged"
          : badges.includes("ENGINEERING SIGN-OFF")
          ? "ready"
          : flags.hasStarter
          ? "progress"
          : "backlog"
      },
      {
        id: "JIRA-303",
        title: "Scale Production Infrastructure",
        type: "Ops/Scale",
        desc: "Our VM container needs more resource allocation. Train at least one Devmon to Level 15 or higher.",
        reward: "💰 800G ⋅ Patch Kit (x2)",
        status: mergedTickets.includes("JIRA-303")
          ? "merged"
          : (party.some(c => c.level >= 15) || box.some(c => c.level >= 15))
          ? "ready"
          : flags.hasStarter
          ? "progress"
          : "backlog"
      },
      {
        id: "JIRA-404",
        title: "Fix Production Memory Leak",
        type: "Critical Bug",
        desc: "Memory consumption is spiking! Capture a wild segfaultitan from the compliance floor or deep grass.",
        reward: "💰 1200G ⋅ Refactor Crystal (x1)",
        status: mergedTickets.includes("JIRA-404")
          ? "merged"
          : (dex.caught.has("segfaultitan") || party.some(c => c.species === "segfaultitan") || box.some(c => c.species === "segfaultitan"))
          ? "ready"
          : badges.includes("ENGINEERING SIGN-OFF")
          ? "progress"
          : "backlog"
      },
      {
        id: "JIRA-505",
        title: "Secure GDPR Compliance Audits",
        type: "Security",
        desc: "An internal compliance check is underway. Defeat the Compliance Officer on the Stakeholder Floor.",
        reward: "💰 1500G ⋅ Refactor Crystal (x2)",
        status: mergedTickets.includes("JIRA-505")
          ? "merged"
          : badges.includes("COMPLIANCE SIGN-OFF")
          ? "ready"
          : badges.includes("ENGINEERING SIGN-OFF")
          ? "progress"
          : "backlog"
      },
      {
        id: "JIRA-606",
        title: "Final Production Customer Release",
        type: "Epic",
        desc: "The customer is ready to test our MVP. Defeat the Customer in their headquarters.",
        reward: "💰 5000G ⋅ Refactor Crystal (x3) ⋅ Onboarding Doc (x5)",
        status: mergedTickets.includes("JIRA-606")
          ? "merged"
          : (badges.includes("CUSTOMER APPROVAL") || flags.beatCustomer)
          ? "ready"
          : badges.includes("ENGINEERING SIGN-OFF")
          ? "progress"
          : "backlog"
      }
    ];

    const bountyTickets: Array<{ id: string; title: string; type: string; desc: string; reward: string; status: string }> = [];
    if (acceptedBounties && acceptedBounties.includes("JIRA-B01")) {
      bountyTickets.push({
        id: "JIRA-B01",
        title: "Feature: Refactor Wild Legacywraith",
        type: "New Feature",
        desc: "A wild Legacywraith (Lv. 25) is causing code debt in the grass. Hunt it down and defeat it!",
        reward: "💰 1500G ⋅ Refactor Crystal (x1) ⋅ Onboarding Doc (x1)",
        status: mergedTickets.includes("JIRA-B01")
          ? "merged"
          : (defeatedBounties && defeatedBounties.includes("JIRA-B01"))
          ? "ready"
          : "progress"
      });
    }
    if (acceptedBounties && acceptedBounties.includes("JIRA-B02")) {
      bountyTickets.push({
        id: "JIRA-B02",
        title: "Feature: Audit Rogue Segfaultitan",
        type: "New Feature",
        desc: "A massive Segfaultitan (Lv. 30) is triggering crash events in the wild. Trace and defeat it!",
        reward: "💰 2500G ⋅ Refactor Crystal (x2) ⋅ Coffee Boost (x1)",
        status: mergedTickets.includes("JIRA-B02")
          ? "merged"
          : (defeatedBounties && defeatedBounties.includes("JIRA-B02"))
          ? "ready"
          : "progress"
      });
    }
    if (acceptedBounties && acceptedBounties.includes("JIRA-B03")) {
      bountyTickets.push({
        id: "JIRA-B03",
        title: "Feature: Debug Infinite Loop Pingu",
        type: "New Feature",
        desc: "A wild Pingu (Lv. 28) is spinning an infinite loop process in the wild. Force terminate it!",
        reward: "💰 2000G ⋅ Onboarding Doc (x3) ⋅ Coffee Boost (x2)",
        status: mergedTickets.includes("JIRA-B03")
          ? "merged"
          : (defeatedBounties && defeatedBounties.includes("JIRA-B03"))
          ? "ready"
          : "progress"
      });
    }

    return [...baseTickets, ...bountyTickets];
  };

  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const [jiraTab, setJiraTab] = React.useState<"board" | "prs">("board");
  const [selectedMapZone, setSelectedMapZone] = React.useState<string | null>(null);

  // Reset selectedMapZone when activeMenu changes
  useEffect(() => {
    if (!menuOpen) return;
    setSelectedMapZone(null);
  }, [activeMenu, menuOpen]);

  // Redraw canvases whenever view changes
  useEffect(() => {
    if (!menuOpen) return;

    if (activeMenu === "starter") {
      ["pingu", "backlogo", "roadmole"].forEach((id) => {
        const canvas = canvasRefs.current[`starter-${id}`];
        if (canvas) drawCreature(canvas, id);
      });
    }

    if (activeMenu === "party") {
      party.forEach((c, idx) => {
        const canvas = canvasRefs.current[`party-${idx}`];
        if (canvas) drawCreature(canvas, c.species);
      });
    }

    if (activeMenu === "box") {
      box.forEach((c, idx) => {
        const canvas = canvasRefs.current[`box-${idx}`];
        if (canvas) drawCreature(canvas, c.species);
      });
    }

    if (activeMenu === "dex") {
      Object.keys(SPECIES).forEach((id) => {
        const canvas = canvasRefs.current[`dex-${id}`];
        const caught = dex.caught.has(id);
        const seen = dex.seen.has(id);
        if (canvas && (caught || seen)) {
          drawCreature(canvas, id, { silhouette: !caught });
        }
      });
    }

    if (activeMenu === "detail" && selectedPartyIdx !== null && detailSource) {
      const sourceArray = detailSource === "box" ? box : party;
      const c = sourceArray[selectedPartyIdx];
      if (c) {
        const canvas = canvasRefs.current["detail-creature"];
        if (canvas) drawCreature(canvas, c.species);

        // draw evolution chain
        const buildEvolutionChain = (speciesId: string) => {
          let baseId = speciesId;
          let guard = 0;
          while (guard++ < 10) {
            const found = Object.entries(SPECIES).find(([_, s]) => s.next === baseId);
            if (!found) break;
            baseId = found[0];
          }
          const chain = [];
          let curId: string | null = baseId;
          while (curId) {
            chain.push(curId);
            curId = SPECIES[curId].next;
          }
          return chain;
        };

        const chain = buildEvolutionChain(c.species);
        chain.forEach((evoId) => {
          const evoCanvas = canvasRefs.current[`evo-${evoId}`];
          if (evoCanvas) drawCreature(evoCanvas, evoId, { silhouette: !dex.caught.has(evoId) });
        });
      }
    }
  }, [menuOpen, activeMenu, party, box, dex, selectedPartyIdx, detailSource]);

  if (!menuOpen || !activeMenu) return null;

  const renderStarterSelection = () => {
    const choices = ["pingu", "backlogo", "roadmole"];
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[10px] text-neutral-400 mb-2 leading-relaxed">
          SELECT YOUR DEPLOYMENT PARTNER. THIS COMPANION UNIT WILL ACCOMPANY ALL COMPILED RUNS!
        </p>
        {choices.map((id) => {
          const sp = SPECIES[id];
          return (
            <button
              key={id}
              onClick={() => {
                chooseStarter(id);
                closeMenu();
              }}
              className="bg-neutral-900 border border-neutral-850 p-3.5 rounded-xl flex items-center gap-4.5 cursor-pointer hover:border-neutral-700 hover:bg-neutral-850 transition-all active:scale-[0.98] shadow-md"
            >
              <canvas
                ref={(el) => {
                  if (el) {
                    canvasRefs.current[`starter_${id}`] = el;
                    setTimeout(() => drawCreature(el, id), 0);
                  }
                }}
                width={64}
                height={64}
                className="w-14 h-14 bg-neutral-950/60 rounded-lg border border-neutral-800"
              />
              <div className="flex-1 text-left">
                <div className="font-black text-blue-400 text-sm flex items-center gap-2 uppercase tracking-wide">
                  {sp.name}{" "}
                  <span className="text-[8px] px-1.5 py-0.5 rounded font-black text-white uppercase" style={{ backgroundColor: TYPE_COLOR[sp.type] }}>
                    {TYPE_LABEL[sp.type]}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 leading-snug">{sp.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderMainMenu = () => {
    const readyCount = getTickets().filter(t => t.status === "ready").length;

    return (
      <div className="flex flex-col gap-3">
        <button
          onClick={() => openMenu("settings")}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-neutral-100 p-3.5 rounded-xl font-black text-xs tracking-widest hover:bg-neutral-850 transition-all cursor-pointer text-left flex justify-between items-center shadow-md animate-fade-in"
        >
          <span>⚙️ SYSTEM SETTINGS</span>
          <span className="text-blue-400 bg-neutral-950 px-2 py-0.5 rounded-sm border border-neutral-800 text-[10px]">CONFIG</span>
        </button>

        <button
          onClick={() => openMenu("jira")}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-neutral-100 p-3.5 rounded-xl font-black text-xs tracking-widest hover:bg-neutral-850 transition-all cursor-pointer text-left flex justify-between items-center shadow-md"
        >
          <span>🎯 JIRA & PULL REQUESTS</span>
          {readyCount > 0 ? (
            <span className="text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 rounded-sm text-[8.5px] animate-pulse font-black uppercase">
              {readyCount} READY TO MERGE 🚀
            </span>
          ) : (
            <span className="text-blue-400 bg-neutral-950 px-2 py-0.5 rounded-sm border border-neutral-800 text-[10px]">BOARD</span>
          )}
        </button>

        <button
          onClick={() => openMenu("party")}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-neutral-100 p-3.5 rounded-xl font-black text-xs tracking-widest hover:bg-neutral-850 transition-all cursor-pointer text-left flex justify-between items-center shadow-md"
        >
          <span>📋 RUNTIME PARTY</span>
          <span className="text-blue-400 bg-neutral-950 px-2 py-0.5 rounded-sm border border-neutral-800 text-[10px]">{party.length} / {MAX_PARTY_SIZE}</span>
        </button>

        <button
          onClick={() => openMenu("dex")}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-neutral-100 p-3.5 rounded-xl font-black text-xs tracking-widest hover:bg-neutral-850 transition-all cursor-pointer text-left flex justify-between items-center shadow-md"
        >
          <span>📘 DEVDEX INDEX</span>
          <span className="text-blue-400 bg-neutral-950 px-2 py-0.5 rounded-sm border border-neutral-800 text-[10px]">{dex.caught.size} / {Object.keys(SPECIES).length}</span>
        </button>

        <button
          onClick={() => openMenu("bag")}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-neutral-100 p-3.5 rounded-xl font-black text-xs tracking-widest hover:bg-neutral-850 transition-all cursor-pointer text-left flex justify-between items-center shadow-md"
        >
          <span>🎒 UTILITY BAG</span>
          <span className="text-blue-400 bg-neutral-950 px-2 py-0.5 rounded-sm border border-neutral-800 text-[10px]">ITEMS</span>
        </button>

        <button
          onClick={() => openMenu("map")}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-neutral-100 p-3.5 rounded-xl font-black text-xs tracking-widest hover:bg-neutral-850 transition-all cursor-pointer text-left flex justify-between items-center shadow-md"
        >
          <span>🗺️ SYSTEM ARCHITECTURE MAP</span>
          <span className="text-blue-400 bg-neutral-950 px-2 py-0.5 rounded-sm border border-neutral-800 text-[10px]">MAP</span>
        </button>

        <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-xl text-neutral-300 text-xs shadow-md mt-1">
          <div className="flex justify-between mb-1.5 font-bold uppercase tracking-wider text-[10px]">
            <span>BITS BALANCE</span>
            <span className="text-yellow-500 font-black">💰 {gold} BITS</span>
          </div>
          <div className="flex justify-between font-bold uppercase tracking-wider text-[10px]">
            <span>STRIKE SIGN-OFFS</span>
            <span className="text-blue-400 font-black">{badges.length} / 4</span>
          </div>
          {badges.length > 0 && (
            <div className="text-[9px] text-neutral-400 mt-2.5 bg-neutral-950 p-2 rounded-lg border border-neutral-800 flex flex-wrap gap-1 font-mono uppercase font-black">
              {badges.map((b) => (
                <span key={b} className="bg-neutral-900 text-blue-400 px-2 py-0.5 rounded border border-neutral-800">
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTicketCard = (t: { id: string; title: string; type: string; desc: string; reward: string; status: string }) => {
    let statusColor = "border-neutral-800 text-neutral-400";
    let badgeClass = "bg-neutral-950 text-neutral-400 border-neutral-800";
    let statusText = "Backlog";

    if (t.status === "ready") {
      statusColor = "border-emerald-500/25 bg-emerald-950/10 shadow-emerald-950/20";
      badgeClass = "bg-emerald-950/80 text-emerald-400 border-emerald-800";
      statusText = "Open PR";
    } else if (t.status === "progress") {
      statusColor = "border-amber-500/20 bg-amber-950/5";
      badgeClass = "bg-amber-950/80 text-amber-400 border-amber-800";
      statusText = "In Dev";
    } else if (t.status === "merged") {
      statusColor = "border-purple-950/40 bg-neutral-950/40 opacity-70";
      badgeClass = "bg-purple-950/60 text-purple-400 border-purple-900";
      statusText = "Merged";
    }

    return (
      <div
        key={t.id}
        className={`bg-neutral-900 border rounded-xl p-3.5 flex flex-col gap-2 transition-all ${statusColor}`}
      >
        <div className="flex justify-between items-start">
          <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black border uppercase tracking-widest ${badgeClass}`}>
            {t.id} ⋅ {t.type}
          </span>
          <span className="text-[8.5px] font-mono text-neutral-400 uppercase tracking-widest">
            {statusText}
          </span>
        </div>

        <div>
          <h4 className="text-xs font-black text-neutral-100 uppercase tracking-wide">
            {t.title}
          </h4>
          <p className="text-[10px] text-neutral-400 mt-1 leading-normal font-sans">
            {t.desc}
          </p>
        </div>

        <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-850/60 text-[9.5px] mt-1 flex justify-between items-center">
          <span className="text-neutral-400 font-bold font-mono">REWARD:</span>
          <span className="text-yellow-500 font-bold font-mono text-[9px]">{t.reward}</span>
        </div>

        {t.status === "ready" && (
          <button
            onClick={() => setJiraTab("prs")}
            className="w-full mt-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 rounded-lg text-[10px] active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider flex justify-center items-center gap-1 shadow animate-pulse"
          >
            <span>🚀 OPEN PULL REQUEST</span>
          </button>
        )}
      </div>
    );
  };

  const renderJiraBoard = () => {
    const tickets = getTickets();
    const readyPRs = tickets.filter(t => t.status === "ready");
    const backlog = tickets.filter(t => t.status === "backlog");
    const progress = tickets.filter(t => t.status === "progress");
    const merged = tickets.filter(t => t.status === "merged");

    return (
      <div className="flex flex-col gap-4 text-left animate-fade-in pb-10">
        {/* Metric Header */}
        <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-xs font-black text-neutral-100 uppercase tracking-wider">PROJECT JIRA SPACE</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wide">Merge your completed pull requests for massive rewards!</p>
            </div>
            <span className="text-blue-400 bg-neutral-950 px-2 py-1 rounded border border-neutral-850 text-[10px] font-black uppercase font-mono">
              BOARD: MVP-1.0
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2.5 border-t border-neutral-850/60 font-mono">
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-900">
              <span className="block text-[8px] text-neutral-400 font-bold uppercase">Backlog</span>
              <span className="text-sm font-black text-neutral-300 mt-0.5 block">{backlog.length}</span>
            </div>
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-900">
              <span className="block text-[8px] text-amber-500/80 font-bold uppercase">In Dev</span>
              <span className="text-sm font-black text-amber-400 mt-0.5 block">{progress.length}</span>
            </div>
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-900 relative">
              {readyPRs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              )}
              <span className="block text-[8px] text-emerald-400 font-bold uppercase">PR Open</span>
              <span className="text-sm font-black text-emerald-300 mt-0.5 block">{readyPRs.length}</span>
            </div>
            <div className="bg-neutral-950/60 p-2 rounded border border-neutral-900">
              <span className="block text-[8px] text-purple-400 font-bold uppercase">Merged</span>
              <span className="text-sm font-black text-purple-300 mt-0.5 block">{merged.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-850">
          <button
            onClick={() => setJiraTab("board")}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-black tracking-wider transition-all cursor-pointer uppercase ${
              jiraTab === "board"
                ? "bg-blue-600 text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            📋 KANBAN BOARD
          </button>
          <button
            onClick={() => setJiraTab("prs")}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-black tracking-wider transition-all cursor-pointer uppercase relative ${
              jiraTab === "prs"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            🔀 MERGE CENTER
            {readyPRs.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-rose-600 text-[8px] text-white rounded-full font-black animate-pulse">
                {readyPRs.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        {jiraTab === "board" ? (
          <div className="flex flex-col gap-4">
            {/* COLUMN: READY FOR MERGE */}
            {readyPRs.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">
                    OPEN PULL REQUESTS ({readyPRs.length})
                  </h4>
                </div>
                {readyPRs.map(t => renderTicketCard(t))}
              </div>
            )}

            {/* COLUMN: IN PROGRESS */}
            {progress.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h4 className="text-[9px] font-black tracking-widest text-amber-400 uppercase">
                    IN DEV / ACTIVE SPRINT ({progress.length})
                  </h4>
                </div>
                {progress.map(t => renderTicketCard(t))}
              </div>
            )}

            {/* COLUMN: BACKLOG */}
            {backlog.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                  <h4 className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
                    BACKLOG / TO DO ({backlog.length})
                  </h4>
                </div>
                {backlog.map(t => renderTicketCard(t))}
              </div>
            )}

            {/* COLUMN: MERGED */}
            {merged.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <h4 className="text-[9px] font-black tracking-widest text-purple-400 uppercase">
                    MERGED / CLOSED SPRINT ({merged.length})
                  </h4>
                </div>
                {merged.map(t => renderTicketCard(t))}
              </div>
            )}
          </div>
        ) : (
          /* MERGE CENTER */
          <div className="flex flex-col gap-3">
            {readyPRs.length === 0 ? (
              <div className="bg-neutral-900 border border-dashed border-neutral-800 p-8 rounded-xl text-center flex flex-col items-center justify-center">
                <span className="text-3xl mb-2">🌿</span>
                <p className="text-xs font-black text-neutral-300 uppercase tracking-wider">No Pull Requests open</p>
                <p className="text-[9px] text-neutral-400 mt-1 uppercase max-w-[240px] leading-relaxed">
                  Go complete some Jira ticket requirements on the map to trigger pull request reviews!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/60 rounded-xl text-[9px] text-emerald-400 uppercase font-bold tracking-wider leading-relaxed text-center">
                  💡 Git branch checks passed! Code is fully tested and ready to merge into main.
                </div>
                {readyPRs.map(t => {
                  return (
                    <div
                      key={t.id}
                      className="bg-neutral-900 border-2 border-emerald-500/30 rounded-xl p-4 shadow-lg flex flex-col gap-3 relative overflow-hidden animate-fade-in"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] px-1.5 py-0.5 rounded font-black text-emerald-400 bg-emerald-950 border border-emerald-800 uppercase tracking-widest">
                            {t.id} ⋅ {t.type}
                          </span>
                          <h4 className="text-xs font-black text-neutral-100 mt-2 uppercase tracking-wide">
                            {t.title}
                          </h4>
                        </div>
                        <span className="text-[8px] text-emerald-300 font-mono font-bold uppercase">
                          main ◀ {t.id.toLowerCase()}-fix
                        </span>
                      </div>

                      <p className="text-[10px] text-neutral-300 leading-relaxed font-sans mt-0.5">
                        {t.desc}
                      </p>

                      <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 text-[10px] flex justify-between items-center font-mono">
                        <span className="text-neutral-400 font-bold">REWARD FOR MERGING:</span>
                        <span className="text-yellow-400 font-black tracking-wide font-mono">{t.reward}</span>
                      </div>

                      <button
                        onClick={() => mergeTicket(t.id)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black py-3 rounded-xl text-xs active:scale-[0.98] transition-all cursor-pointer flex justify-center items-center gap-1.5 shadow-lg shadow-emerald-950/40 uppercase tracking-widest"
                      >
                        <span>🚀 MERGE PULL REQUEST</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Historic Merged list under PR list */}
            {merged.length > 0 && (
              <div className="flex flex-col gap-2.5 mt-4 pt-4 border-t border-neutral-850/60">
                <h4 className="text-[9px] font-black text-purple-400 tracking-widest uppercase">
                  HISTORIC MERGED COMMITS ({merged.length})
                </h4>
                {merged.map(t => {
                  return (
                    <div
                      key={t.id}
                      className="bg-neutral-900/60 border border-purple-950/60 rounded-xl p-3 flex justify-between items-center text-left opacity-80 animate-fade-in"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[8.5px] font-black text-purple-400 uppercase tracking-widest">
                            {t.id}
                          </span>
                          <span className="text-[8.5px] px-1.5 py-0.2 bg-purple-950 text-purple-300 rounded border border-purple-900 uppercase font-bold">
                            Merged
                          </span>
                        </div>
                        <h4 className="text-[10px] text-neutral-300 font-bold truncate uppercase mt-1 tracking-wide">
                          {t.title}
                        </h4>
                      </div>
                      <span className="text-[8px] text-neutral-500 font-mono bg-neutral-950 border border-neutral-850 px-2 py-0.5 rounded font-black">
                        COMMIT SHA: {t.id.replace("JIRA-", "0x8a9")}f
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderParty = () => {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[10px] text-neutral-400 mb-2 leading-relaxed uppercase">
          Reorder your deployment queue. The Devmon at position #1 will be active for the next compilation run!
        </p>
        {party.map((c, idx) => {
          const sp = SPECIES[c.species];
          const hpPct = Math.round((c.hp / c.maxHp) * 100);
          return (
            <div
              key={idx}
              onClick={() => setDetailView(idx, "party")}
              className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 hover:bg-neutral-850 rounded-xl p-3.5 flex gap-3.5 items-center cursor-pointer transition-all shadow-md relative"
            >
              <canvas
                id={`party-cv-${idx}`}
                ref={(el) => {
                  if (el) {
                    setTimeout(() => drawCreature(el, c.species, {}), 0);
                  }
                }}
                width={64}
                height={64}
                className="w-12 h-12 pixelated bg-neutral-950/80 border border-neutral-800 rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0 text-left">
                <div className="font-black text-sm text-blue-400 flex items-center justify-between uppercase tracking-wide">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-neutral-500 font-mono text-xs mr-0.5">#{idx + 1}</span>
                    <span className="truncate">{c.nick}</span>
                    {c.status && <StatusBadge status={c.status} />}
                  </div>
                  <span className="text-[8px] px-2 py-0.5 rounded-sm text-neutral-300 font-mono font-black bg-neutral-950 border border-neutral-800 flex-shrink-0">
                    LV.{c.level}
                  </span>
                </div>
                <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden mt-1.5 border border-neutral-800">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${hpPct}%`,
                      backgroundColor: hpPct < 20 ? "#ef4444" : hpPct < 50 ? "#facc15" : "#22c55e",
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] text-neutral-400 font-mono mt-1.5 uppercase">
                  <span>
                    {c.hp}/{c.maxHp} HP
                  </span>
                  <span
                    className="text-[8px] px-2 py-0.5 rounded-sm text-white font-black"
                    style={{ backgroundColor: TYPE_COLOR[sp.type] }}
                  >
                    {TYPE_LABEL[sp.type]}
                  </span>
                </div>
              </div>

              {/* Reorder Queue controls */}
              <div 
                className="flex flex-col gap-1 flex-shrink-0 self-center" 
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  disabled={idx === 0}
                  onClick={() => swapPartyMembers(idx, idx - 1)}
                  className="bg-neutral-950 hover:bg-neutral-850 disabled:opacity-20 disabled:cursor-not-allowed border border-neutral-800 rounded px-2 py-1 text-[10px] text-blue-400 font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center min-w-[24px]"
                  title="Move Up in compilation queue"
                >
                  ▲
                </button>
                <button
                  disabled={idx === party.length - 1}
                  onClick={() => swapPartyMembers(idx, idx + 1)}
                  className="bg-neutral-950 hover:bg-neutral-850 disabled:opacity-20 disabled:cursor-not-allowed border border-neutral-800 rounded px-2 py-1 text-[10px] text-blue-400 font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center min-w-[24px]"
                  title="Move Down in compilation queue"
                >
                  ▼
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBag = () => {
    const itemsList = Object.entries(bag).filter(([, qty]) => (qty as number) > 0);
    return (
      <div className="flex flex-col gap-3">
        {itemsList.length === 0 ? (
          <div className="menu-row text-center text-neutral-500 py-8 uppercase tracking-widest text-xs font-bold bg-neutral-900/30 border border-neutral-850 rounded-xl">Your bag is empty!</div>
        ) : (
          itemsList.map(([name, qty]) => {
            const item = ITEMS[name];
            return (
              <div
                key={name}
                onClick={() => {
                  if (item.catchRate) {
                    triggerToast("This is only usable in wild combat!");
                    return;
                  }
                  setActiveMenu(`bag-target:${name}`);
                }}
                className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 hover:bg-neutral-850 rounded-xl p-3.5 flex justify-between items-center transition-all cursor-pointer shadow-md"
              >
                <div className="text-left">
                  <div className="font-black text-blue-400 uppercase text-xs tracking-wider">
                    {name} <span className="text-yellow-500 font-mono text-[10px] ml-1 font-black">x{qty}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 leading-snug">{item?.desc}</div>
                </div>
                <div className="text-[10px] font-black text-neutral-300 uppercase tracking-widest bg-neutral-950 border border-neutral-800 px-2 py-1 rounded-sm shadow-inner">USE</div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const renderBagTargetPicker = (itemName: string) => {
    const item = ITEMS[itemName];
    return (
      <div className="flex flex-col gap-3">
        <div className="text-[10px] text-blue-400 font-black tracking-widest mb-2.5 uppercase">USE {itemName} ON:</div>
        {party.map((c, i) => {
          const eligible = item.revive ? c.hp <= 0 : c.hp > 0 && c.hp < c.maxHp;
          return (
            <div
              key={i}
              onClick={() => {
                if (eligible) {
                  useItemOnParty(itemName, i);
                  setActiveMenu("bag");
                }
              }}
              className={`flex items-center justify-between p-3.5 border rounded-xl transition-all shadow-md ${
                eligible ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700 cursor-pointer" : "bg-neutral-950 border-neutral-900 opacity-35 cursor-not-allowed text-neutral-600"
              }`}
            >
              <div className="text-left">
                <div className="font-black text-blue-400 text-sm uppercase tracking-wide">
                  {c.nick} <span className="text-[9px] text-neutral-400 font-mono">LV.{c.level}</span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1 font-mono uppercase">
                  {c.hp}/{c.maxHp} HP {c.hp <= 0 ? " [FAINTED]" : ""}
                </div>
              </div>
              <div className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{eligible ? "USE" : "INVALID"}</div>
            </div>
          );
        })}
        <button
          className="border border-neutral-700 bg-neutral-900 hover:bg-neutral-850 text-neutral-100 text-xs font-black tracking-widest py-3 rounded-xl text-center mt-4 cursor-pointer transition-all"
          onClick={() => setActiveMenu("bag")}
        >
          ◀ CANCEL
        </button>
      </div>
    );
  };

  const renderDex = () => {
    const allSpecies = Object.keys(SPECIES);
    return (
      <div className="grid grid-cols-1 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
        {allIds.map((id) => {
          const sp = SPECIES[id];
          const caught = dex.caught.has(id);
          const seen = dex.seen.has(id);

          return (
            <div
              key={id}
              onClick={() => (seen || caught) && setDetailView(0, "dex")} // Use 0 placeholder
              className="flex items-center gap-3.5 p-2.5 bg-neutral-900 border border-neutral-850 rounded-xl cursor-pointer hover:border-neutral-700 hover:bg-neutral-850 transition-all shadow-md"
            >
              <canvas
                id={`dex-cv-${id}`}
                ref={(el) => {
                  if (el) {
                    setTimeout(() => drawCreature(el, id, { silhouette: !caught }), 0);
                  }
                }}
                width={64}
                height={64}
                className="w-11 h-11 bg-neutral-950/60 rounded-lg border border-neutral-800"
              />
              <div className="flex-1 text-left">
                {caught ? (
                  <>
                    <div className="font-black text-blue-400 text-xs flex justify-between uppercase tracking-wide">
                      <span>{sp.name}</span>
                      <span className="text-[8px] bg-neutral-950 border border-neutral-800 text-blue-400 px-1.5 py-0.5 rounded-sm font-black font-mono">
                        {TYPE_LABEL[sp.type]}
                      </span>
                    </div>
                    <div className="text-[9px] text-[#41E0A3] mt-0.5 font-bold uppercase tracking-wider">✅ COMPATIBLE / CAUGHT</div>
                  </>
                ) : seen ? (
                  <>
                    <div className="font-black text-neutral-500 text-xs flex justify-between uppercase tracking-wide">
                      <span>???</span>
                      <span className="text-[8px] bg-neutral-950 border border-neutral-900 text-neutral-500 px-1.5 py-0.5 rounded-sm font-black font-mono">
                        {TYPE_LABEL[sp.type]}
                      </span>
                    </div>
                    <div className="text-[9px] text-neutral-500 mt-0.5 font-bold uppercase tracking-wider">👁 ENCOUNTERED / SEEN</div>
                  </>
                ) : (
                  <>
                    <div className="font-black text-neutral-700 text-xs uppercase tracking-wide">???</div>
                    <div className="text-[9px] text-neutral-600 mt-0.5 font-bold uppercase tracking-wider">UNDISCOVERED PACKAGE</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderShop = () => {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center bg-neutral-950 border border-neutral-850 p-3.5 rounded-xl mb-2.5">
          <div className="text-neutral-400 text-[10px] font-black uppercase tracking-widest">YOUR BALANCE</div>
          <div className="text-yellow-500 font-black text-sm tracking-widest uppercase">💰 {gold} BITS</div>
        </div>

        <button
          onClick={() => setActiveMenu("buy")}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 rounded-xl p-3.5 text-left hover:bg-neutral-850 transition-all cursor-pointer shadow-md"
        >
          <div className="font-black text-xs text-blue-400 tracking-widest uppercase">🛒 BUY UTILITIES</div>
          <div className="text-[9px] text-neutral-400 mt-1 uppercase">ACQUIRE PATCH DOSSIERS AND PATCH REPAIR KITS</div>
        </button>

        <button
          onClick={() => setActiveMenu("sell")}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 rounded-xl p-3.5 text-left hover:bg-neutral-850 transition-all cursor-pointer shadow-md"
        >
          <div className="font-black text-xs text-blue-400 tracking-widest uppercase">💵 SELL EQUIPMENT</div>
          <div className="text-[9px] text-neutral-400 mt-1 uppercase">TRADE SURPLUS DEPLOYMENT MODULES FOR GOLD</div>
        </button>

        <button
          onClick={healTeamAtShop}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 rounded-xl p-3.5 text-left hover:bg-neutral-850 transition-all cursor-pointer shadow-md"
        >
          <div className="font-black text-xs text-blue-400 tracking-widest uppercase">💚 REFURBISH PARTY // 💰40G</div>
          <div className="text-[9px] text-neutral-400 mt-1 uppercase">FULLY RESTORE HEALTH PARAMETERS OF YOUR TEAM UNITS</div>
        </button>

        <button
          onClick={() => setActiveMenu("box")}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 rounded-xl p-3.5 text-left hover:bg-neutral-850 transition-all cursor-pointer shadow-md"
        >
          <div className="font-black text-xs text-blue-400 tracking-widest uppercase">📦 STORAGE VAULT ({box.length})</div>
          <div className="text-[9px] text-neutral-400 mt-1 uppercase">MANAGE AND MIGRATE CORES TO STORAGE CELLS</div>
        </button>
      </div>
    );
  };

  const renderDetail = () => {
    if (selectedPartyIdx === null || detailSource === null) return null;
    const sourceArray = detailSource === "box" ? box : party;
    const c = sourceArray[selectedPartyIdx];
    if (!c) return null;
    const sp = SPECIES[c.species];

    const hpPct = Math.max(0, Math.round((c.hp / c.maxHp) * 100));
    const nextNeed = expToNext(c.level);
    const expPct = Math.max(0, Math.min(100, Math.round((c.exp / nextNeed) * 100)));

    const buildEvolutionChain = (speciesId: string) => {
      let baseId = speciesId;
      let guard = 0;
      while (guard++ < 10) {
        const found = Object.entries(SPECIES).find(([_, s]) => s.next === baseId);
        if (!found) break;
        baseId = found[0];
      }
      const chain = [];
      let curId: string | null = baseId;
      while (curId) {
        chain.push(curId);
        curId = SPECIES[curId].next;
      }
      return chain;
    };
    const chain = buildEvolutionChain(c.species);

    return (
      <div className="flex flex-col gap-3 animate-fade-in">
        {/* Header summary */}
        <div className="bg-neutral-900 border border-neutral-850 p-3.5 rounded-xl flex items-center gap-4 shadow-md">
          <canvas
            ref={(canvas) => {
              if (canvas) {
                // Keep rendering crisp
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.imageSmoothingEnabled = false;
                  // @ts-ignore
                  ctx.mozImageSmoothingEnabled = false;
                  // @ts-ignore
                  ctx.webkitImageRendering = "pixelated";
                }
                const grid = SHAPES[SPECIES_SHAPE[c.species] || "blob"];
                const baseColor = TYPE_COLOR[sp.type];
                const W = canvas.width;
                const H = canvas.height;
                ctx!.clearRect(0, 0, W, H);
                const cell = Math.floor(Math.min(W, H) / 16);
                const offX = (W - cell * 16) / 2;
                const offY = (H - cell * 16) / 2;
                for (let y = 0; y < 16; y++) {
                  for (let x = 0; x < 16; x++) {
                    const v = grid[y][x];
                    if (v === "0") continue;
                    let color = "";
                    if (v === "1") color = baseColor;
                    else if (v === "2") color = shade(baseColor, -45);
                    else if (v === "3") color = "#1a1a1a";
                    ctx!.fillStyle = color;
                    ctx!.fillRect(offX + x * cell, offY + y * cell, cell, cell);
                  }
                }
              }
            }}
            width={96}
            height={96}
            className="w-16 h-14 bg-neutral-950/60 p-1 border border-neutral-800 rounded-lg"
          />
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-blue-400 uppercase tracking-wide">{c.nick}</span>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-sm text-white font-mono uppercase" style={{ backgroundColor: TYPE_COLOR[sp.type] }}>
                {TYPE_LABEL[sp.type]}
              </span>
              {c.status && <StatusBadge status={c.status} />}
            </div>
            <div className="text-[9px] text-neutral-400 mt-1 font-mono uppercase tracking-widest font-bold">
              UNIT PARAMETER: LV.{c.level}
            </div>
          </div>
        </div>

        {/* HP info */}
        <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-3.5 text-xs shadow-md">
          <div className="flex justify-between items-center">
            <span className="font-black text-blue-400 tracking-wider text-[10px] uppercase">❤ HEALTH PARAMETERS</span>
            <span className="text-[9px] text-neutral-300 font-mono font-black uppercase">
              {c.hp} / {c.maxHp} HP {c.hp <= 0 ? " [FAINTED]" : ""}
            </span>
          </div>
          <div className="bg-neutral-950 rounded-full h-2.5 mt-2 overflow-hidden border border-neutral-800">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${hpPct}%`,
                backgroundColor: hpPct < 20 ? "#ef4444" : hpPct < 50 ? "#facc15" : "#22c55e",
              }}
            />
          </div>
        </div>

        {/* EXP progress */}
        <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-3.5 text-xs shadow-md">
          <div className="flex justify-between items-center">
            <span className="font-black text-blue-400 tracking-wider text-[10px] uppercase">⭐ EXPERIENCE SEED</span>
            <span className="text-[9px] text-neutral-300 font-mono font-black uppercase">
              {c.exp} / {nextNeed} EXP
            </span>
          </div>
          <div className="bg-neutral-950 rounded-full h-2.5 mt-2 overflow-hidden border border-neutral-800">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${expPct}%` }} />
          </div>
        </div>

        {/* LORE desc */}
        <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-3.5 text-xs shadow-md text-left">
          <div className="font-black text-blue-400 tracking-wider text-[10px] uppercase mb-1">📖 CORE DATA LOGS</div>
          <p className="text-[10px] text-neutral-400 leading-relaxed italic uppercase">"{sp.desc}"</p>
        </div>

        {/* PASSIVE SOFTWARE TRAIT */}
        {sp.trait && (
          <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-3.5 text-xs shadow-md text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="font-black text-blue-400 tracking-wider text-[10px] uppercase mb-1.5 flex items-center gap-1.5">
              <span>⚙️ PASSIVE SOFTWARE TRAIT</span>
            </div>
            <div className="text-[11px] font-black text-neutral-100 uppercase tracking-wide">
              {sp.trait.name}
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed mt-1 font-sans">
              {sp.trait.desc}
            </p>
          </div>
        )}

        {/* EVOLUTION PROGRESSION */}
        <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-3.5 text-xs shadow-md text-left">
          <div className="font-black text-blue-400 tracking-wider text-[10px] uppercase mb-3">🧬 EVOLUTION PROGRESSION</div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
            {chain.map((evoId, index) => {
              const evoSp = SPECIES[evoId];
              const isCurrent = evoId === c.species;
              const hasCaught = dex.caught.has(evoId);
              
              return (
                <React.Fragment key={evoId}>
                  {/* Evolution Stage Card */}
                  <div className={`flex flex-col items-center flex-1 p-2 rounded-lg border text-center transition-all ${
                    isCurrent 
                      ? "bg-blue-950/20 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]" 
                      : "bg-neutral-900/40 border-neutral-800"
                  }`}>
                    {/* Sprite Canvas */}
                    <canvas
                      ref={(el) => {
                        canvasRefs.current[`evo-${evoId}`] = el;
                        if (el) {
                          drawCreature(el, evoId, { silhouette: !hasCaught });
                        }
                      }}
                      width={48}
                      height={48}
                      className="w-12 h-12 bg-neutral-950 border border-neutral-800/80 rounded-md p-0.5 shadow-inner"
                    />
                    
                    {/* Name & Badge */}
                    <div className="mt-1.5 flex flex-col items-center gap-0.5">
                      <span className={`font-black text-[10px] uppercase tracking-wide ${
                        isCurrent ? "text-blue-400" : hasCaught ? "text-neutral-300" : "text-neutral-500"
                      }`}>
                        {hasCaught ? evoSp.name : "???"}
                      </span>
                      
                      {isCurrent ? (
                        <span className="text-[7px] font-black bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded border border-blue-500/30 uppercase tracking-widest mt-0.5">
                          CURRENT
                        </span>
                      ) : evoSp.evolvesAt ? (
                        <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
                          LV.{evoSp.evolvesAt}
                        </span>
                      ) : (
                        <span className="text-[7px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                          FINAL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Connecting Arrow (show between stages) */}
                  {index < chain.length - 1 && (
                    <div className="flex sm:flex-col items-center justify-center text-neutral-600 font-black text-xs my-1 sm:my-0">
                      <span className="hidden sm:inline">➔</span>
                      <span className="sm:hidden">▼</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Release command */}
        <div className="mt-4 flex flex-col gap-2.5">
          {detailSource === "party" && (
            <button
              disabled={party.length <= 1}
              onClick={() => {
                if (window.confirm(`Are you absolutely sure you want to release ${c.nick} (Lv.${c.level}) back into the server sandbox?`)) {
                  releaseCreature(selectedPartyIdx, "party");
                }
              }}
              className="bg-neutral-900 border border-red-900 text-red-400 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-950/20 uppercase tracking-wider"
            >
              🗑 RELEASE BACK TO DIRECTORY
            </button>
          )}

          {detailSource === "box" && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to release ${c.nick} from storage box permanently?`)) {
                  releaseCreature(selectedPartyIdx, "box");
                }
              }}
              className="bg-neutral-900 border border-red-900 text-red-400 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:bg-red-950/20 uppercase tracking-wider"
            >
              🗑 RELEASE CREATURE
            </button>
          )}

          <button
            onClick={() => setDetailView(null, null)}
            className="border border-neutral-700 bg-neutral-900 text-neutral-100 py-3 rounded-xl text-xs font-black cursor-pointer hover:bg-neutral-850 active:scale-[0.98] transition-all flex items-center justify-center uppercase tracking-widest"
          >
            ◀ BACK
          </button>
        </div>
      </div>
    );
  };

  const renderBox = () => {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[10px] text-neutral-400 mb-2 leading-tight uppercase font-bold tracking-widest text-left">
          🗳 STORAGE BOX VAULT ({box.length} / {MAX_BOX_SIZE})
        </p>

        <div className="flex gap-3">
          <button
            disabled={party.length <= 1}
            onClick={() => setActiveMenu("box-deposit")}
            className="flex-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 py-3 rounded-xl text-[10px] font-black text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-neutral-200 uppercase tracking-wider shadow-md"
          >
            ⬆️ STORE CORE
          </button>
          <button
            disabled={party.length >= MAX_PARTY_SIZE}
            onClick={() => setActiveMenu("box-withdraw")}
            className="flex-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 py-3 rounded-xl text-[10px] font-black text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-neutral-200 uppercase tracking-wider shadow-md"
          >
            ⬇️ WITHDRAW CORE
          </button>
        </div>

        <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto mt-2">
          {box.length === 0 ? (
            <div className="text-center text-neutral-500 py-8 text-xs border border-neutral-850 bg-neutral-900/30 rounded-xl font-bold uppercase tracking-widest">
              No creatures stored in the box storage!
            </div>
          ) : (
            box.map((c, i) => {
              const sp = SPECIES[c.species];
              return (
                <div
                  key={i}
                  onClick={() => setDetailView(i, "box")}
                  className="bg-neutral-900 border border-neutral-850 rounded-xl p-3 flex items-center gap-3.5 cursor-pointer hover:border-neutral-700 hover:bg-neutral-850 transition-all shadow-md"
                >
                  <canvas
                    ref={(el) => {
                      if (el) {
                        setTimeout(() => drawCreature(el, c.species), 0);
                      }
                    }}
                    width={48}
                    height={48}
                    className="w-10 h-10 bg-neutral-950/60 p-0.5 border border-neutral-800 rounded-lg"
                  />
                  <div className="flex-1 text-left">
                    <div className="text-xs font-black text-blue-400 uppercase tracking-wide">
                      {c.nick} <span className="text-[9px] text-neutral-400 font-mono">LV.{c.level}</span>
                    </div>
                    <div className="text-[9px] text-neutral-400 mt-1 font-mono uppercase">
                      {c.hp}/{c.maxHp} HP ⋅ {TYPE_LABEL[sp.type]}
                    </div>
                  </div>
                  <div className="text-blue-400 text-[9px] font-black tracking-widest bg-neutral-950 border border-neutral-800 px-2 py-1 rounded-sm shadow-inner">INFO ▶</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderBoxDepositPicker = () => {
    return (
      <div className="flex flex-col gap-2.5">
        <p className="text-[10px] text-neutral-400 mb-1.5 uppercase font-bold tracking-wider text-left">SELECT A PARTY UNIT TO COMMIT TO THE STORAGE CELL:</p>
        {party.map((c, i) => {
          const sp = SPECIES[c.species];
          return (
            <div
              key={i}
              onClick={() => {
                transferToBox(i);
                setActiveMenu("box");
              }}
              className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl p-3.5 flex justify-between items-center cursor-pointer transition-all shadow-md"
            >
              <div className="text-left">
                <div className="font-black text-blue-400 text-sm uppercase tracking-wide">
                  {c.nick} <span className="text-[10px] text-neutral-400 font-mono">LV.{c.level}</span>
                </div>
                <div className="text-[9px] text-neutral-400 mt-1 font-mono uppercase">
                  HP: {c.hp}/{c.maxHp} ⋅ TYPE: {TYPE_LABEL[sp.type]}
                </div>
              </div>
              <div className="text-[10px] text-blue-400 font-black tracking-widest bg-neutral-950 border border-neutral-800 px-2 py-1 rounded-sm">STORE</div>
            </div>
          );
        })}
        <button
          className="border border-neutral-700 bg-neutral-900 hover:bg-neutral-850 text-neutral-100 text-xs font-black tracking-widest py-3 rounded-xl text-center mt-4 cursor-pointer transition-all uppercase"
          onClick={() => setActiveMenu("box")}
        >
          ◀ CANCEL
        </button>
      </div>
    );
  };

  const renderBoxWithdrawPicker = () => {
    return (
      <div className="flex flex-col gap-2.5">
        <p className="text-[10px] text-neutral-400 mb-1.5 uppercase font-bold tracking-wider text-left">SELECT A STORAGE UNIT TO LOAD INTO ACTIVE DIRECTORY PARTY:</p>
        {box.map((c, i) => {
          const sp = SPECIES[c.species];
          return (
            <div
              key={i}
              onClick={() => {
                withdrawFromBox(i);
                setActiveMenu("box");
              }}
              className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl p-3.5 flex justify-between items-center cursor-pointer transition-all shadow-md"
            >
              <div className="text-left">
                <div className="font-black text-blue-400 text-sm uppercase tracking-wide">
                  {c.nick} <span className="text-[10px] text-neutral-400 font-mono">LV.{c.level}</span>
                </div>
                <div className="text-[9px] text-neutral-400 mt-1 font-mono uppercase">
                  HP: {c.hp}/{c.maxHp} ⋅ TYPE: {TYPE_LABEL[sp.type]}
                </div>
              </div>
              <div className="text-[10px] text-yellow-500 font-black tracking-widest bg-neutral-950 border border-neutral-800 px-2 py-1 rounded-sm">LOAD</div>
            </div>
          );
        })}
        <button
          className="border border-neutral-700 bg-neutral-900 hover:bg-neutral-850 text-neutral-100 text-xs font-black tracking-widest py-3 rounded-xl text-center mt-4 cursor-pointer transition-all uppercase"
          onClick={() => setActiveMenu("box")}
        >
          ◀ CANCEL
        </button>
      </div>
    );
  };

  const renderBuyScreen = () => {
    return (
      <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto">
        <div className="text-[10px] text-neutral-400 tracking-widest mb-2 flex justify-between uppercase font-bold">
          <span>🛒 DEPLOYMENT CODES & KITS</span>
          <span className="text-yellow-500 font-black tracking-widest">💰 {gold} BITS</span>
        </div>
        {Object.entries(ITEMS).map(([name, item]) => {
          const canAfford = gold >= item.price;
          return (
            <div
              key={name}
              className="bg-neutral-900 border border-neutral-850 rounded-xl p-3.5 flex justify-between items-center gap-4 shadow-md"
            >
              <div className="flex-1 text-left">
                <div className="font-black text-sm text-blue-400 uppercase tracking-wider">{name}</div>
                <div className="text-[10px] text-neutral-400 mt-1 leading-snug uppercase">{item.desc}</div>
              </div>
              <button
                disabled={!canAfford}
                onClick={() => buyItem(name)}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer tracking-wider ${
                  canAfford
                    ? "border-yellow-500 text-yellow-500 hover:bg-yellow-500/15 active:scale-[0.97]"
                    : "border-neutral-800 text-neutral-600 opacity-40 cursor-not-allowed"
                }`}
              >
                {item.price} BITS
              </button>
            </div>
          );
        })}
        <button
          onClick={() => setActiveMenu("shop")}
          className="border border-neutral-700 bg-neutral-900 text-neutral-100 text-xs font-black py-3 rounded-xl text-center mt-3 cursor-pointer hover:bg-neutral-850 uppercase tracking-widest"
        >
          ◀ BACK TO SHOP
        </button>
      </div>
    );
  };

  const renderSellScreen = () => {
    const owned = Object.entries(bag).filter(([, qty]) => (qty as number) > 0);
    return (
      <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto">
        <div className="text-[10px] text-neutral-400 tracking-widest mb-2 flex justify-between uppercase font-bold">
          <span>💵 TRADE SURPLUS STACK FOR BITS</span>
          <span className="text-yellow-500 font-black tracking-widest">💰 {gold} BITS</span>
        </div>
        {owned.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs uppercase font-bold tracking-widest bg-neutral-900/30 border border-neutral-850 rounded-xl">You have no items in your inventory bag to sell!</div>
        ) : (
          owned.map(([name, qty]) => {
            const item = ITEMS[name];
            return (
              <div
                key={name}
                className="bg-neutral-900 border border-neutral-850 rounded-xl p-3.5 flex justify-between items-center gap-4 shadow-md"
              >
                <div className="flex-1 text-left">
                  <div className="font-black text-sm text-blue-400 uppercase tracking-wider">
                    {name} <span className="text-yellow-500 font-mono text-[10px] ml-1 font-black">x{qty}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 leading-snug uppercase">
                    Sell for {item ? item.sell : 5} bits each
                  </div>
                </div>
                <button
                  onClick={() => sellItem(name)}
                  className="px-3 py-2 rounded-xl text-xs font-black border border-blue-400 text-blue-400 hover:bg-blue-400/15 active:scale-[0.97] cursor-pointer tracking-wider"
                >
                  +{item ? item.sell : 5} bits
                </button>
              </div>
            );
          })
        )}
        <button
          onClick={() => setActiveMenu("shop")}
          className="border border-neutral-700 bg-neutral-900 text-neutral-100 text-xs font-black py-3 rounded-xl text-center mt-3 cursor-pointer hover:bg-neutral-850 uppercase tracking-widest"
        >
          ◀ BACK TO SHOP
        </button>
      </div>
    );
  };
  
  const renderSettingsMenu = () => {
    return (
      <div className="flex flex-col gap-3 animate-fade-in">
        <p className="text-[10px] text-neutral-400 mb-2 leading-relaxed uppercase">
          Configure runtime state settings and commit build changes to persistence.
        </p>

        <button
          onClick={() => saveGame()}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 p-3.5 rounded-xl text-left cursor-pointer transition-all shadow-md hover:bg-neutral-850"
        >
          <div className="font-black text-xs text-blue-400 tracking-widest">💾 SAVE PROGRESS</div>
          <div className="text-[9px] text-neutral-400 mt-1 uppercase">Commit configurations to browser localStorage</div>
        </button>

        <button
          onClick={toggleMuteState}
          className="bg-neutral-900 border border-neutral-850 hover:border-neutral-700 p-3.5 rounded-xl text-left cursor-pointer shadow-md hover:bg-neutral-850"
        >
          <div className="font-black text-xs text-blue-400 tracking-widest">{muted ? "🔇 SYSTEM SYNTH: MUTED" : "🔊 SYSTEM SYNTH: LIVE"}</div>
          <div className="text-[9px] text-neutral-400 mt-1 uppercase">Toggle procedurally synthesized SFX stream</div>
        </button>
      </div>
    );
  };

  const renderBountyBoard = () => {
    const BOUNTY_DATA = [
      {
        id: "JIRA-B01",
        title: "WANTED: LEGACYWRAITH",
        species: "legacywraith",
        level: 25,
        location: "Tall Grass / Feature Map Wilderness",
        rewards: "💰 1500G ⋅ Refactor Crystal (x1) ⋅ Onboarding Doc (x1)",
        desc: "A wild legacywraith is running rogue, causing imports to bundle out of order and flooding console logs. Hunt this low-level ghost and clear the tech debt!",
      },
      {
        id: "JIRA-B02",
        title: "WANTED: SEGFAULTITAN",
        species: "segfaultitan",
        level: 30,
        location: "Tall Grass / Compliance Floor Wilderness",
        rewards: "💰 2500G ⋅ Refactor Crystal (x2) ⋅ Coffee Boost (x1)",
        desc: "A massive segfaultitan crash event is threatening cloud deployment integrity with major memory leaks. Locate and terminate the process!",
      },
      {
        id: "JIRA-B03",
        title: "WANTED: PINGU",
        species: "pingu",
        level: 28,
        location: "Tall Grass / Town & Feature Outskirts",
        rewards: "💰 2000G ⋅ Onboarding Doc (x3) ⋅ Coffee Boost (x2)",
        desc: "An infinite recursion loop has mutated into a super-charged, hyper-speed wild Pingu. Track it down in the grass to reclaim thread execution!",
      }
    ];

    return (
      <div className="flex flex-col gap-4 animate-fade-in pb-10">
        <p className="text-[10px] text-neutral-400 mb-2 leading-relaxed uppercase">
          NPCs on the sprint team have posted these critical high-level bounties. Accept a bounty to log a "New Feature" on your Kanban board, hunt it down in wild grass encounters, and merge the completed PR for rewards!
        </p>

        <div className="flex flex-col gap-4 p-4 rounded-2xl bg-amber-950/10 border-4 border-amber-900/40 relative shadow-inner">
          <div className="absolute top-2 right-3 text-[9px] text-amber-600 font-bold uppercase tracking-widest pointer-events-none">
            SPRINT DEPLOYMENT OFFICE
          </div>
          
          {BOUNTY_DATA.map((b) => {
            const isAccepted = acceptedBounties && acceptedBounties.includes(b.id);
            const isDefeated = defeatedBounties && defeatedBounties.includes(b.id);
            const isMerged = mergedTickets && mergedTickets.includes(b.id);

            let statusBadge = (
              <span className="text-[8px] px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-400 font-bold uppercase">
                POSTED
              </span>
            );
            let actionButton = (
              <button
                onClick={() => acceptBounty(b.id)}
                className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-neutral-950 font-black py-2.5 rounded-xl text-[11px] active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider flex justify-center items-center gap-1 border border-amber-500/20 shadow"
              >
                🎯 ACCEPT BOUNTY QUEST
              </button>
            );

            if (isMerged) {
              statusBadge = (
                <span className="text-[8px] px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-bold uppercase">
                  MERGED & CLOSED
                </span>
              );
              actionButton = (
                <button
                  disabled
                  className="w-full bg-neutral-950 text-neutral-600 font-black py-2.5 rounded-xl text-[10px] uppercase tracking-wider flex justify-center items-center gap-1 border border-neutral-900 cursor-not-allowed"
                >
                  ✅ BOUNTY FULLY CLAIMED
                </button>
              );
            } else if (isDefeated) {
              statusBadge = (
                <span className="text-[8px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold uppercase animate-pulse">
                  DEFEATED - PR READY
                </span>
              );
              actionButton = (
                <button
                  onClick={() => openMenu("jira")}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-2.5 rounded-xl text-[11px] active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider flex justify-center items-center gap-1 shadow animate-pulse"
                >
                  🚀 GO TO JIRA BOARD TO MERGE
                </button>
              );
            } else if (isAccepted) {
              statusBadge = (
                <span className="text-[8px] px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-400 font-bold uppercase">
                  ACTIVE DEV
                </span>
              );
              actionButton = (
                <div className="w-full p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-850/60 text-center text-[9px] text-amber-500 font-bold uppercase tracking-wider leading-relaxed">
                  ⏳ HUNTING TARGET: Search tall grass to draw out this Level {b.level} target!
                </div>
              );
            }

            return (
              <div
                key={b.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden text-left"
              >
                {/* Paper background design details */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-black bg-neutral-950 border border-neutral-850 text-amber-500 font-mono tracking-wider">
                      {b.id} ⋅ FEATURE TARGET
                    </span>
                    <h4 className="text-xs font-black text-neutral-100 uppercase tracking-wide mt-1.5">
                      {b.title}
                    </h4>
                  </div>
                  {statusBadge}
                </div>

                <div className="text-[10px] text-neutral-400 leading-relaxed font-sans mt-0.5">
                  {b.desc}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono py-1 border-t border-b border-neutral-850/50 my-1">
                  <div>
                    <span className="text-neutral-500 font-bold uppercase">TARGET LV:</span>{" "}
                    <span className="text-amber-400 font-bold">LV.{b.level}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-bold uppercase">LOCATION:</span>{" "}
                    <span className="text-neutral-300 font-bold">WILD TALL GRASS</span>
                  </div>
                </div>

                <div className="bg-neutral-950/80 p-2 rounded-lg border border-neutral-850 text-[9.5px] flex justify-between items-center font-mono">
                  <span className="text-neutral-400 font-bold font-mono">BONUS REWARD:</span>
                  <span className="text-yellow-500 font-black tracking-wide font-mono">{b.rewards}</span>
                </div>

                <div className="mt-1">{actionButton}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWorldMap = () => {
    const activeZoneId = selectedMapZone || currentMapId || "town";
    const zone = ZONE_DETAILS[activeZoneId] || ZONE_DETAILS.town;
    const mapData = MAPS[activeZoneId];

    return (
      <div className="flex flex-col gap-4 animate-fade-in text-neutral-200">
        <div className="text-[9.5px] text-neutral-400 font-bold bg-neutral-900/80 border border-neutral-850 p-3 rounded-xl flex items-start gap-2.5 leading-relaxed font-sans">
          <span className="text-sm">💡</span>
          <span>Click on any system node in the architectural topology diagram below to view active processes, local sign-offs, and wild code-creature logs.</span>
        </div>

        {/* World Map Topology Grid Frame */}
        <div className="bg-neutral-900/60 border border-neutral-850 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center shadow-inner">
          {/* Symmetrical dotted background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />

          {/* Connected lines wrapper */}
          <div className="relative w-full max-w-[280px] aspect-square my-1.5">
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" xmlns="http://www.w3.org/2000/svg">
              {/* Town (Center: 50%, 50%) connected to all 4 cardinal zones */}
              <line x1="50%" y1="50%" x2="50%" y2="16.6%" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="5 4" />
              <line x1="50%" y1="50%" x2="16.6%" y2="50%" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="5 4" />
              <line x1="50%" y1="50%" x2="83.3%" y2="50%" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="5 4" />
              <line x1="50%" y1="50%" x2="50%" y2="83.3%" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="5 4" />

              {/* Feature 1 (50%, 16.6%) to Feature 3 (83.3%, 16.6%) */}
              <line x1="50%" y1="16.6%" x2="83.3%" y2="16.6%" stroke="#10b981" strokeWidth="2.5" strokeDasharray="5 4" />

              {/* Feature 2 (83.3%, 50%) to Feature 4 (83.3%, 83.3%) */}
              <line x1="83.3%" y1="50%" x2="83.3%" y2="83.3%" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5 4" />
            </svg>

            <div className="grid grid-cols-3 grid-rows-3 gap-y-10 gap-x-3 w-full h-full relative z-10">
              {Object.values(ZONE_DETAILS).map((zoneItem) => {
                const isCurrent = zoneItem.id === currentMapId;
                const isInspected = zoneItem.id === activeZoneId;

                let glowStyle = "border-neutral-800 text-neutral-400 bg-neutral-950/90";
                if (isInspected) {
                  if (zoneItem.id === "feature1" || zoneItem.id === "feature3") {
                    glowStyle = "bg-emerald-950/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]";
                  } else if (zoneItem.id === "stakeholderfloor") {
                    glowStyle = "bg-purple-950/20 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]";
                  } else if (zoneItem.id === "feature2" || zoneItem.id === "feature4") {
                    glowStyle = "bg-amber-950/20 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]";
                  } else if (zoneItem.id === "customerhq") {
                    glowStyle = "bg-rose-950/20 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]";
                  } else {
                    glowStyle = "bg-blue-950/20 border-blue-500 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]";
                  }
                }

                return (
                  <button
                    key={zoneItem.id}
                    onClick={() => setSelectedMapZone(zoneItem.id)}
                    className={`relative p-1.5 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center select-none active:scale-95 group ${zoneItem.gridClass} ${glowStyle} ${
                      isInspected ? "z-20 font-black scale-105" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-1.5 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500 border border-neutral-950 flex items-center justify-center text-[7px] text-white">📍</span>
                      </span>
                    )}

                    <span className="text-base mb-0.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform">
                      {zoneItem.icon}
                    </span>
                    <span className="text-[7.5px] font-mono tracking-tighter truncate max-w-full">
                      {zoneItem.name.replace("Feature ", "F")}
                    </span>

                    {isCurrent && (
                      <span className="text-[5.5px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/40 px-0.5 rounded-sm mt-0.5 uppercase">
                        HOST
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Inspected Zone Specifications */}
        <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-4 shadow-xl font-mono">
          <div className="flex flex-col gap-2 border-b border-neutral-800 pb-3.5 mb-3.5">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{zone.icon}</span>
                <div>
                  <h3 className="text-xs font-black text-neutral-100 uppercase tracking-wide">{zone.name}</h3>
                  <code className="text-[8px] text-neutral-500 font-bold tracking-tight">{zone.codeName}</code>
                </div>
              </div>
              <span className={`text-[7px] font-bold border px-2 py-0.5 rounded uppercase tracking-wide ${
                zone.id === currentMapId
                  ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                  : "bg-neutral-950 text-neutral-500 border-neutral-800"
              }`}>
                {zone.id === currentMapId ? "● ACTIVE HOST" : "REMOTE INSTANCE"}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">{zone.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Processes */}
            <div className="flex flex-col gap-2">
              <h4 className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-800/60 pb-1 flex items-center gap-1.5">
                <span>⚡</span> SYSTEM CONTROLLERS / SIGN-OFFS
              </h4>
              <div className="flex flex-col gap-1.5">
                {zone.id === "stakeholderfloor" ? (
                  <div className="flex flex-col gap-1.5">
                    {[
                      { name: "THE EM", badge: "ENGINEERING SIGN-OFF" },
                      { name: "THE EXEC SPONSOR", badge: "EXECUTIVE SIGN-OFF" },
                      { name: "THE HEAD OF GROWTH", badge: "GROWTH SIGN-OFF" },
                      { name: "THE COMPLIANCE OFFICER", badge: "COMPLIANCE SIGN-OFF" }
                    ].map((boss) => {
                      const hasBadge = badges.includes(boss.badge);
                      return (
                        <div key={boss.name} className="flex justify-between items-center text-[9px] bg-neutral-950/70 border border-neutral-850 p-2 rounded-lg">
                          <span className="text-neutral-300 font-bold tracking-tight">{boss.name}</span>
                          <span className={`font-mono text-[7px] px-1.5 py-0.5 rounded border ${
                            hasBadge
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 font-black"
                              : "bg-neutral-900 text-neutral-500 border-neutral-800"
                          }`}>
                            {hasBadge ? "🏆 SIGNED" : "⏳ REVIEW"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : zone.id === "customerhq" ? (
                  <div className="flex justify-between items-center text-[9px] bg-neutral-950/70 border border-neutral-850 p-2 rounded-lg">
                    <span className="text-neutral-300 font-bold tracking-tight">THE CUSTOMER</span>
                    <span className={`font-mono text-[7px] px-1.5 py-0.5 rounded border ${
                      badges.includes("CUSTOMER APPROVAL")
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 font-black"
                        : badges.length >= 4
                        ? "bg-amber-950/80 text-amber-300 border-amber-500/40 font-black animate-pulse"
                        : "bg-neutral-900 text-neutral-500 border-neutral-800"
                    }`}>
                      {badges.includes("CUSTOMER APPROVAL")
                        ? "🏆 VERIFIED"
                        : badges.length >= 4
                        ? "🔓 READY"
                        : "🔒 BLOCKED"}
                    </span>
                  </div>
                ) : (
                  zone.bosses.map((boss) => (
                    <div key={boss} className="flex items-center gap-2 text-[9px] bg-neutral-950/70 border border-neutral-850 p-2 rounded-lg">
                      <span className="text-neutral-400">👤</span>
                      <span className="text-neutral-300 font-bold">{boss}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Wild entities */}
            <div className="flex flex-col gap-2">
              <h4 className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-800/60 pb-1 flex items-center gap-1.5">
                <span>👾</span> WILDCARDS DETECTED ({zone.wildLevels})
              </h4>
              <div className="flex flex-col gap-1.5">
                {mapData && mapData.encounterTable && mapData.encounterTable.length > 0 ? (
                  mapData.encounterTable.map((item, idx) => {
                    const speciesDetail = SPECIES[item.species];
                    if (!speciesDetail) return null;
                    const typeColor = TYPE_COLOR[speciesDetail.type] || "bg-neutral-700";
                    return (
                      <div key={idx} className="flex justify-between items-center text-[9px] bg-neutral-950/70 border border-neutral-850 p-2 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[7px] text-neutral-500 font-mono">#{idx + 1}</span>
                          <span className="text-neutral-200 font-black uppercase tracking-tight">{speciesDetail.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[6.5px] font-bold text-white uppercase px-1 rounded-xs ${typeColor}`}>
                            {speciesDetail.type}
                          </span>
                          <span className="text-[7.5px] text-neutral-400 font-mono">
                            {item.lvl[0]}-{item.lvl[1]}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[8.5px] text-neutral-500 bg-neutral-950/40 border border-neutral-850/40 p-3 rounded-lg text-center font-mono italic">
                    Safe Segment - No wild entities found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const allIds = Object.keys(SPECIES);

  const getTitle = () => {
    if (activeMenu === "main") return "MAIN MENU";
    if (activeMenu === "jira") return "🎯 JIRA KANBAN BOARD & PRs";
    if (activeMenu === "bounty") return "🎯 SPRINT BOUNTY BOARD";
    if (activeMenu === "settings") return "SYSTEM SETTINGS";
    if (activeMenu === "starter") return "CHOOSE YOUR STARTER";
    if (activeMenu === "shop") return "GENERAL STACK SHOP";
    if (activeMenu === "buy") return "BUY ITEMS";
    if (activeMenu === "sell") return "SELL ITEMS";
    if (activeMenu === "party") return "YOUR ACTIVE PARTY";
    if (activeMenu === "bag") return "INVENTORY BAG";
    if (activeMenu === "box") return "CREATURE BOX STORAGE";
    if (activeMenu === "box-deposit") return "DEPOSIT PARTY MEMBER";
    if (activeMenu === "box-withdraw") return "WITHDRAW CREATURE";
    if (activeMenu === "dex") return "DEVDEX RECORDS";
    if (activeMenu === "map") return "🗺️ WORLD ARCHITECTURE MAP";
    if (activeMenu?.startsWith("bag-target")) return "SELECT TARGET";
    return activeMenu.toUpperCase();
  };

  return (
    <div className="absolute inset-0 bg-neutral-950/98 text-neutral-100 p-5 flex flex-col z-45 font-mono overflow-y-auto animate-fade-in select-none pb-20">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-5 border-b border-neutral-800 pb-3">
        <h2 className="text-[12px] font-black tracking-[3px] text-blue-400 uppercase">{getTitle()}</h2>
        <button
          onClick={closeMenu}
          className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-xs font-black text-neutral-300 active:scale-95 transition-all cursor-pointer hover:bg-neutral-700 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Dynamic menu overlays rendering */}
      <div className="flex-1 pr-0.5">
        {activeMenu === "main" && renderMainMenu()}
        {activeMenu === "jira" && renderJiraBoard()}
        {activeMenu === "bounty" && renderBountyBoard()}
        {activeMenu === "settings" && renderSettingsMenu()}
        {activeMenu === "starter" && renderStarterSelection()}
        {activeMenu === "party" && renderParty()}
        {activeMenu === "bag" && renderBag()}
        {activeMenu?.startsWith("bag-target") && renderBagTargetPicker(activeMenu.split(":")[1])}
        {activeMenu === "dex" && renderDex()}
        {activeMenu === "shop" && renderShop()}
        {activeMenu === "buy" && renderBuyScreen()}
        {activeMenu === "sell" && renderSellScreen()}
        {activeMenu === "box" && renderBox()}
        {activeMenu === "box-deposit" && renderBoxDepositPicker()}
        {activeMenu === "box-withdraw" && renderBoxWithdrawPicker()}
        {activeMenu === "detail" && renderDetail()}
        {activeMenu === "map" && renderWorldMap()}
      </div>

      {/* Universal back action at footer */}
      {activeMenu !== "main" &&
        activeMenu !== "starter" &&
        activeMenu !== "detail" &&
        activeMenu !== "buy" &&
        activeMenu !== "sell" &&
        activeMenu !== "box-deposit" &&
        activeMenu !== "box-withdraw" &&
        !activeMenu?.startsWith("bag-target") && (
          <button
            onClick={() => setActiveMenu("main")}
            className="w-full text-center border border-neutral-700 bg-neutral-900 hover:bg-neutral-850 py-3 rounded-xl text-xs font-black text-neutral-100 mt-5 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-widest shadow-md"
          >
            ◀ BACK TO MENU
          </button>
        )}
    </div>
  );
};

