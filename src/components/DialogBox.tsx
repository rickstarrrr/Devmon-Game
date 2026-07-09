/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useGame } from "../context/GameContext";
import { sfxCursor } from "../utils/audio";

export const DialogBox: React.FC = () => {
  const { dialogActive, dialogQueue, advanceDialog } = useGame();

  if (!dialogActive || dialogQueue.length === 0) return null;

  const handleClick = () => {
    sfxCursor();
    advanceDialog();
  };

  return (
    <div
      onClick={handleClick}
      className="absolute left-[3%] right-[3%] bottom-[36%] md:bottom-[34%] min-h-[96px] max-h-[135px] bg-neutral-950 border-2 border-neutral-700 rounded-xl p-4 text-[12px] leading-relaxed text-neutral-100 font-mono cursor-pointer z-50 select-none flex flex-col justify-between shadow-2xl"
    >
      <div className="whitespace-pre-wrap break-words pr-2 text-neutral-200 font-medium">
        {dialogQueue[0]}
      </div>
      <div className="self-end text-blue-400 animate-pulse text-[9px] font-black tracking-widest flex items-center gap-1 uppercase">
        TAP TO ADVANCE ❯❯
      </div>
    </div>
  );
};
