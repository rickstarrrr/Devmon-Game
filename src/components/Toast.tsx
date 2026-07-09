/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { AnimatePresence, motion } from "motion/react";

export const Toast: React.FC = () => {
  const { toastConfig } = useGame();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (toastConfig) {
      setMessage(toastConfig.message);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, toastConfig.duration || 1600);
      return () => clearTimeout(timer);
    }
  }, [toastConfig]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: "-40%" }}
          animate={{ opacity: 1, scale: 1, y: "-50%" }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute top-[48%] left-1/2 -translate-x-1/2 bg-neutral-950/95 text-yellow-400 px-5 py-4 rounded-xl text-[11px] font-mono font-black z-50 text-center max-w-[85%] border-2 border-neutral-700 shadow-2xl pointer-events-none select-none tracking-widest uppercase"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
