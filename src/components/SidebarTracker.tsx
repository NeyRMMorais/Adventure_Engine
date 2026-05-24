import React from "react";
import { 
  ShieldCheck, 
  Compass, 
  Heart, 
  Backpack, 
  Scroll, 
  History, 
  MapPin, 
  Activity,
  Award
} from "lucide-react";
import { GameState, AdventureConfig } from "../types";
import { GENRES, TRANSLATIONS } from "../utils";

interface SidebarTrackerProps {
  config: AdventureConfig;
  state: GameState;
  activeGenreKey: string;
}

export const SidebarTracker: React.FC<SidebarTrackerProps> = ({
  config,
  state,
  activeGenreKey
}) => {
  const currentGenre = GENRES[activeGenreKey] || {
    label: "Dynamic Quest",
    textClass: "text-amber-400",
    colorSchema: ["#d4af37", "#1e3d59"]
  };

  const accentColor = currentGenre.colorSchema[0];
  const healthPercent = state.characterStatus.health;

  const lang = config.language || "en";
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Choose health bar color based on HP value
  const getHealthBarClass = (hp: number) => {
    if (hp > 60) return "bg-emerald-500 shadow-emerald-500/30";
    if (hp > 25) return "bg-amber-500 shadow-amber-500/30";
    return "bg-rose-600 animate-pulse shadow-rose-600/40";
  };

  return (
    <aside 
      id="sidebar-tracker"
      className="w-full lg:w-80 flex flex-col gap-6 bg-immersive-panel border border-immersive-border rounded-2xl p-6 shadow-2xl shrink-0 text-slate-200"
    >
      {/* SECTION: Protagonist Card */}
      <div className="flex flex-col gap-4 border-b border-immersive-border pb-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent opacity-90">
              {t.protagonistStatus}
            </h2>
            <h3 className="text-xl font-bold font-sans tracking-tight text-white mt-1">
              {config.characterName || t.unnamedExplorer}
            </h3>
            <span 
              className="inline-block text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded-full mt-1.5 bg-white/5 border border-white/10 text-immersive-accent font-semibold"
            >
              {config.characterClass}
            </span>
          </div>
          <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-immersive-accent" strokeWidth={1.5} />
          </div>
        </div>

        {/* Health Stats Dashboard */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-400">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              {t.vitality}
            </span>
            <span className="font-mono font-bold text-white">{healthPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-black rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getHealthBarClass(healthPercent)}`}
              style={{ width: `${Math.max(0, Math.min(100, healthPercent))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
            <span>{t.condition}</span>
            <span className="text-slate-300 font-sans font-bold uppercase tracking-wide">
              {state.characterStatus.statusMessage || "Healthy"}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION: Quest Log */}
      <div className="flex flex-col gap-3 border-b border-immersive-border pb-5">
        <h2 className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent opacity-90 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          {t.currentQuest}
        </h2>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
          {/* Accent light decoration */}
          <div 
            className="absolute -top-12 -right-12 w-24 h-24 rounded-full filter blur-2xl opacity-10 bg-immersive-accent"
          />
          <h4 className="text-sm font-semibold text-white leading-relaxed">
            {state.currentQuest}
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed italic border-l border-white/15 pl-2.5">
            "{t.questFootnote}"
          </p>
        </div>
      </div>

      {/* SECTION: Immersive 9-Slot Grid Inventory */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent opacity-90 flex items-center gap-1.5">
            <Backpack className="w-3.5 h-3.5" />
            {t.inventory} ({state.inventory.length})
          </h2>
          <span className="text-[9px] text-slate-500 font-mono">
            {t.slots}: {state.inventory.length}/9
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 9 }).map((_, index) => {
            const item = state.inventory[index] || null;
            return (
              <div
                key={`slot-${index}`}
                title={item || "Empty Slot"}
                className={`aspect-square bg-white/[0.02] border rounded-lg flex flex-col items-center justify-center p-1.5 text-center relative group min-h-[64px] transition-all duration-300 ${
                  item 
                    ? "border-immersive-accent shadow-[0_0_10px_rgba(212,163,115,0.15)] bg-white/[0.06]" 
                    : "border-immersive-border hover:border-white/20"
                }`}
              >
                {item ? (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-immersive-accent absolute top-1 right-1" />
                    <span className="text-[10px] font-semibold text-slate-200 line-clamp-2 leading-tight px-0.5 break-words">
                      {item}
                    </span>
                  </>
                ) : (
                  <span className="text-[9px] font-mono text-slate-700 uppercase select-none tracking-wider font-semibold">
                    -
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION: History Chronicle Roll */}
      {state.history.length > 0 && (
        <div className="border-t border-immersive-border pt-5 mt-auto flex flex-col gap-2">
          <h2 className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent opacity-90 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            {t.chroniclePath} ({state.history.length})
          </h2>
          <div className="flex flex-col gap-2.5 max-h-[120px] overflow-y-auto pr-1 text-[11px] font-mono">
            {state.history.map((step, idx) => (
              <div 
                key={`hist-${idx}`} 
                className="border-l border-white/10 pl-3 py-0.5 flex flex-col gap-0.5"
              >
                <span className="text-white font-medium italic">
                  &gt; {step.choiceSelected.length > 30 ? step.choiceSelected.slice(0, 30) + "..." : step.choiceSelected}
                </span>
                <span className="text-slate-500 truncate text-[10px]">
                  {step.sceneDescription}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
