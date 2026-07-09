import React from "react";

export interface StatusBadgeProps {
  status: "BURN" | "PAR" | "PSN" | "FRZ" | "SLP";
  onClick?: () => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, onClick }) => {
  const styles: Record<string, string> = {
    BURN: "bg-rose-500 text-white border border-rose-400 font-black text-[7px] px-1.5 py-0.5 rounded shadow-sm tracking-wider uppercase animate-pulse",
    PAR: "bg-amber-500 text-neutral-950 border border-amber-400 font-black text-[7px] px-1.5 py-0.5 rounded shadow-sm tracking-wider uppercase",
    PSN: "bg-purple-600 text-white border border-purple-400 font-black text-[7px] px-1.5 py-0.5 rounded shadow-sm tracking-wider uppercase",
    FRZ: "bg-sky-400 text-neutral-950 border border-sky-300 font-black text-[7px] px-1.5 py-0.5 rounded shadow-sm tracking-wider uppercase",
    SLP: "bg-indigo-600 text-white border border-indigo-400 font-black text-[7px] px-1.5 py-0.5 rounded shadow-sm tracking-wider uppercase"
  };

  const labels: Record<string, string> = {
    BURN: "BURN",
    PAR: "PAR",
    PSN: "PSN",
    FRZ: "FRZ",
    SLP: "SLP"
  };

  const tooltips: Record<string, string> = {
    BURN: "Burnout: Takes damage at end of turn",
    PAR: "Merge Conflict: 25% chance of paralysis",
    PSN: "Toxic Codebase: Takes damage at end of turn",
    FRZ: "Sprint Lock: Can't move until defrosted",
    SLP: "Meeting Fatigue: Asleep during retrospective"
  };

  return (
    <span 
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`${styles[status] || "bg-neutral-600 text-white"} select-none cursor-pointer hover:brightness-110 active:scale-95 transition-all shrink-0`} 
      title={tooltips[status]}
    >
      {labels[status]}
    </span>
  );
};
