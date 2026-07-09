import React, { useMemo } from "react";

interface WeatherOverlayProps {
  mapId: string;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ mapId }) => {
  // Generate random styling attributes once for performance
  const rainDrops = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      left: `${(i * 4.5) + (Math.random() * 3)}%`,
      top: `${Math.random() * -100}px`,
      delay: `${Math.random() * 2.5}s`,
      duration: `${1.2 + Math.random() * 0.8}s`,
      height: `${25 + Math.random() * 20}px`,
      opacity: 0.15 + Math.random() * 0.2,
    }));
  }, []);

  const snowFlakes = useMemo(() => {
    const symbols = ["•", "*", "❄", "o", "idx", "q"];
    return Array.from({ length: 18 }).map((_, i) => ({
      left: `${(i * 5.5) + (Math.random() * 4)}%`,
      delay: `${Math.random() * 4}s`,
      duration: `${3.5 + Math.random() * 2}s`,
      fontSize: `${8 + Math.random() * 7}px`,
      opacity: 0.2 + Math.random() * 0.45,
      char: symbols[Math.floor(Math.random() * symbols.length)],
    }));
  }, []);

  const digitalStreams = useMemo(() => {
    const chars = ["1", "0", "$", "¢", "KPI", "STRIPE", "PAY", "++", "=>"];
    return Array.from({ length: 15 }).map((_, i) => ({
      left: `${(i * 6.5) + (Math.random() * 3)}%`,
      delay: `${Math.random() * 3.5}s`,
      duration: `${1.8 + Math.random() * 1.5}s`,
      fontSize: `${8 + Math.random() * 5}px`,
      char: chars[Math.floor(Math.random() * chars.length)],
      opacity: 0.2 + Math.random() * 0.35,
    }));
  }, []);

  const stormyRain = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => ({
      left: `${(i * 2.8) + (Math.random() * 2)}%`,
      top: `${Math.random() * -120}px`,
      delay: `${Math.random() * 1.5}s`,
      duration: `${0.8 + Math.random() * 0.5}s`,
      height: `${35 + Math.random() * 25}px`,
      opacity: 0.2 + Math.random() * 0.3,
    }));
  }, []);

  const sunnyParticles = useMemo(() => {
    const icons = ["✦", "✧", "++", "{}", "()", "git", "pkg"];
    return Array.from({ length: 8 }).map((_, i) => ({
      left: `${10 + i * 11 + Math.random() * 6}%`,
      bottom: `${-10 - Math.random() * 30}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${6 + Math.random() * 4}s`,
      fontSize: `${10 + Math.random() * 8}px`,
      char: icons[Math.floor(Math.random() * icons.length)],
      color: Math.random() > 0.5 ? "text-emerald-400/25" : "text-amber-400/25",
    }));
  }, []);

  const glitchBars = useMemo(() => {
    return Array.from({ length: 3 }).map((_, i) => ({
      delay: `${i * 3.5 + Math.random() * 2}s`,
      duration: `${3.5 + Math.random() * 2}s`,
      height: `${2 + Math.random() * 6}px`,
      color: i === 0 ? "bg-red-500/10" : i === 1 ? "bg-cyan-500/10" : "bg-purple-500/10",
    }));
  }, []);

  switch (mapId) {
    case "town": // Clear / Sunny with drifting digital code petals
      return (
        <div id="weather-town" className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none">
          {/* Sunny rays overlay */}
          <div 
            className="absolute -top-[150px] -right-[150px] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-amber-400/5 via-emerald-400/2 to-transparent blur-3xl pointer-events-none"
            style={{ animation: "weather-sunny-ray 12s ease-in-out infinite" }}
          />
          {/* Floating code blossoms */}
          {sunnyParticles.map((p, i) => (
            <div
              key={i}
              className={`absolute font-mono font-bold ${p.color}`}
              style={{
                left: p.left,
                bottom: p.bottom,
                fontSize: p.fontSize,
                animation: `weather-float-particle ${p.duration} linear infinite`,
                animationDelay: p.delay,
              }}
            >
              {p.char}
            </div>
          ))}
        </div>
      );

    case "feature1": // User Onboarding - Soft data flow rain
      return (
        <div id="weather-onboarding" className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none">
          {rainDrops.map((drop, i) => (
            <div
              key={i}
              className="absolute w-[1.5px] bg-gradient-to-b from-sky-400/10 to-sky-400/50 rounded-full"
              style={{
                left: drop.left,
                top: drop.top,
                height: drop.height,
                opacity: drop.opacity,
                animation: `weather-rain ${drop.duration} linear infinite`,
                animationDelay: drop.delay,
              }}
            />
          ))}
        </div>
      );

    case "feature2": // Payments - Golden code streams
      return (
        <div id="weather-payments" className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none">
          {digitalStreams.map((stream, i) => (
            <div
              key={i}
              className="absolute font-mono font-black text-amber-400/60 shadow-[0_0_6px_rgba(245,158,11,0.2)]"
              style={{
                left: stream.left,
                top: "-30px",
                fontSize: stream.fontSize,
                opacity: stream.opacity,
                animation: `weather-digital ${stream.duration} linear infinite`,
                animationDelay: stream.delay,
              }}
            >
              {stream.char}
            </div>
          ))}
        </div>
      );

    case "feature3": // Search & Discovery - Query snow / indexing nodes
      return (
        <div id="weather-search" className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none">
          {snowFlakes.map((flake, i) => (
            <div
              key={i}
              className="absolute font-mono font-black text-teal-300/55 select-none"
              style={{
                left: flake.left,
                top: "-20px",
                fontSize: flake.fontSize,
                opacity: flake.opacity,
                animation: `weather-snow ${flake.duration} ease-in-out infinite`,
                animationDelay: flake.delay,
              }}
            >
              {flake.char}
            </div>
          ))}
        </div>
      );

    case "feature4": // Checkout Flow - Stormy heavy code crash rain
      return (
        <div id="weather-checkout" className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none">
          {/* Heavy rain drops */}
          {stormyRain.map((drop, i) => (
            <div
              key={i}
              className="absolute w-[2px] bg-gradient-to-b from-purple-400/20 to-purple-500/80 rounded-full"
              style={{
                left: drop.left,
                top: drop.top,
                height: drop.height,
                opacity: drop.opacity,
                animation: `weather-rain ${drop.duration} linear infinite`,
                animationDelay: drop.delay,
              }}
            />
          ))}

          {/* Random compiler lightning strike simulation */}
          <div 
            className="absolute inset-0 bg-white opacity-0 mix-blend-screen pointer-events-none"
            style={{ animation: "weather-lightning 9s ease-in-out infinite" }}
          />
        </div>
      );

    case "stakeholderfloor": // Stakeholder Review - Drifting corporate foggy review clouds
      return (
        <div id="weather-stakeholder" className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none">
          {/* Multi-layered mist */}
          <div 
            className="absolute -inset-x-20 bottom-0 h-44 bg-gradient-to-t from-emerald-900/15 via-emerald-800/10 to-transparent blur-md"
            style={{ animation: "weather-fog 18s ease-in-out infinite" }}
          />
          <div 
            className="absolute -inset-x-20 bottom-[10%] h-36 bg-gradient-to-t from-neutral-900/10 via-emerald-500/5 to-transparent blur-lg"
            style={{ animation: "weather-fog 24s ease-in-out infinite", animationDelay: "-6s" }}
          />
          {/* Subtle slow scanline interference */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_96%,rgba(16,185,129,0.06)_98%)] bg-[size:100%_12px]" />
        </div>
      );

    case "customerhq": // Customer HQ - Production deployment glitch storm
      return (
        <div id="weather-customer" className="absolute inset-0 overflow-hidden pointer-events-none z-10 select-none bg-rose-950/5">
          {/* Infinite rolling vertical code glitch bands */}
          {glitchBars.map((bar, i) => (
            <div
              key={i}
              className={`absolute inset-x-0 ${bar.color} blur-[1px]`}
              style={{
                animation: `weather-glitch-bar ${bar.duration} linear infinite`,
                animationDelay: bar.delay,
                height: bar.height,
              }}
            />
          ))}

          {/* Drifting dark red smoke layers */}
          <div 
            className="absolute -inset-x-20 bottom-0 h-40 bg-gradient-to-t from-rose-950/20 via-rose-900/10 to-transparent blur-md"
            style={{ animation: "weather-fog 16s ease-in-out infinite" }}
          />

          {/* Extreme production warning lightning flickers */}
          <div 
            className="absolute inset-0 bg-rose-500 opacity-0 mix-blend-color-burn pointer-events-none"
            style={{ animation: "weather-lightning 7.5s ease-in-out infinite", animationDelay: "-2s" }}
          />

          {/* CRT glass screen curve vignette accent */}
          <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(239,68,68,0.15)] rounded-2xl pointer-events-none" />
        </div>
      );

    default:
      return null;
  }
};
