import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  MessageSquare, 
  CornerDownRight, 
  RotateCcw,
  AlertCircle,
  Eye,
  Plus,
  Compass
} from "lucide-react";
import { AdventureScene, Choice, InventoryChange, AdventureConfig } from "../types";
import { GENRES, ART_STYLES, TRANSLATIONS } from "../utils";

interface GameScreenProps {
  scene: AdventureScene;
  config: AdventureConfig;
  onSelectChoice: (choiceText: string) => void;
  isLoadingNext: boolean;
  onRestart: () => void;
  adventureImage: string | null;
  onSaveAdventureImage: (url: string) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  scene,
  config,
  onSelectChoice,
  isLoadingNext,
  onRestart,
  adventureImage,
  onSaveAdventureImage
}) => {
  const [customAction, setCustomAction] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const lang = config.language || "en";
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const activeGenreKey = config.genre === "custom" ? "medieval_fantasy" : config.genre;
  const genreMeta = GENRES[activeGenreKey] || GENRES.medieval_fantasy;
  const artPreset = ART_STYLES[config.artStyle] || ART_STYLES.fantasy_watercolor;

  // Fetch real-time visual *only once* at the start of the adventure, keeping it throughout.
  useEffect(() => {
    // If we already have the adventure image, do not generate another one.
    if (adventureImage) return;
    if (!scene || !scene.imagePrompt) return;

    setIsImageLoading(true);
    setImageError(null);

    const fetchImage = async () => {
      try {
        const response = await fetch("/api/adventure/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imagePrompt: scene.imagePrompt,
            genre: config.genre,
            artStyle: config.artStyle,
            title: scene.title
          })
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        if (data.imageUrl) {
          onSaveAdventureImage(data.imageUrl);
        } else {
          throw new Error("No image buffer returned");
        }
      } catch (err: any) {
        console.error("Visual generation fetch error:", err);
        setImageError(err.message || "Could not retrieve visual render.");
      } finally {
        setIsImageLoading(false);
      }
    };

    fetchImage();
  }, [adventureImage, scene, config.genre, config.artStyle, onSaveAdventureImage]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoadingNext || !customAction.trim()) return;
    onSelectChoice(customAction.trim());
    setCustomAction("");
  };

  // Maps threat level colors based on consequence descriptions
  const getConsequenceClass = (prev: string) => {
    const text = prev.toLowerCase();
    if (text.includes("risk") || text.includes("danger") || text.includes("lethal") || text.includes("audacious") || text.includes("arriscado") || text.includes("perig")) {
      return "bg-rose-950/40 border-rose-500/50 text-rose-300";
    }
    if (text.includes("stealth") || text.includes("cunning") || text.includes("tactical") || text.includes("resourceful") || text.includes("furtivo") || text.includes("tátic")) {
      return "bg-amber-950/40 border-amber-500/50 text-amber-300";
    }
    if (text.includes("safe") || text.includes("cautious") || text.includes("defensive") || text.includes("segur") || text.includes("cautel") || text.includes("defens")) {
      return "bg-emerald-950/40 border-emerald-500/50 text-emerald-300";
    }
    return "bg-indigo-950/40 border-indigo-500/50 text-indigo-300";
  };

  return (
    <div 
      id="game-screen"
      className="flex-1 flex flex-col gap-6"
    >
      {/* Unified Compact Screen Dashboard Card */}
      <div className="bg-immersive-panel border border-immersive-border rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Dynamic Visual Engine Plate - Sleek height-restrained banner format */}
        <div className="relative h-[130px] sm:h-[160px] md:h-[180px] w-full bg-[#030304] border-b border-white/5 overflow-hidden flex items-center justify-center">
          {isImageLoading ? (
            <div className="flex flex-col items-center gap-2 animate-pulse text-slate-400">
              <div className="w-8 h-8 border-3 border-slate-800 border-t-immersive-accent rounded-full animate-spin" />
              <div className="text-center px-4">
                <p className="text-[9px] font-mono tracking-widest uppercase text-immersive-accent font-extrabold">Painting Vision Render...</p>
              </div>
            </div>
          ) : adventureImage ? (
            <img 
              src={adventureImage}
              alt={scene.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-100"
            />
          ) : imageError ? (
            <div className="p-4 text-center max-w-md flex flex-col items-center gap-1">
              <AlertCircle className="w-6 h-6 text-rose-500 opacity-80" />
              <p className="text-[11px] font-sans text-slate-400 font-semibold">{imageError}</p>
            </div>
          ) : (
            <div className="text-slate-600 text-xs">Awaiting vision canvas...</div>
          )}

          {/* Aesthetic Overlay Style Banner */}
          <div className="absolute top-3 left-3 bg-immersive-bg/90 border border-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-mono tracking-widest text-immersive-accent flex items-center gap-1 uppercase font-bold">
            <span className="w-1 h-1 rounded-full bg-immersive-accent animate-pulse" />
            {t.visualStyle}: {artPreset.label}
          </div>
        </div>

        {/* Compact Grid Dashboard Splitting Prose and Story Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-1 xl:grid-cols-12 md:divide-x lg:divide-x-0 xl:divide-x lg:divide-y xl:divide-y-0 divide-white/5">
          
          {/* LEFT PANEL: Prose / Location Info */}
          <div className="col-span-1 md:col-span-7 lg:col-span-1 xl:col-span-7 p-5 md:p-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-immersive-accent" />
                <h2 className="text-[9px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent opacity-90">
                  {t.currentLocation}
                </h2>
              </div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                {t.settingSuffix} {config.genre.replace("_", " ")}
              </span>
            </div>

            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white leading-tight">
              {scene.title}
            </h1>

            {/* Immersive prose in small/compact size to fit elegantly above fold */}
            <article className="font-serif text-slate-350 italic text-[13px] md:text-sm leading-relaxed tracking-wide antialiased select-text py-1">
              {scene.description}
            </article>

            {/* Dynamic log inventory changes */}
            {scene.inventoryChanges && scene.inventoryChanges.length > 0 && (
              <div className="mt-1 flex flex-col gap-1.5">
                {scene.inventoryChanges.map((change: InventoryChange, idx: number) => {
                  const isAdd = change.action === 'add';
                  return (
                    <div 
                      key={`change-${idx}`} 
                      className={`flex items-start gap-2 px-3 py-1.5 rounded-lg border text-[11px] leading-relaxed ${
                        isAdd 
                          ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-300" 
                          : "bg-rose-950/10 border-rose-500/20 text-rose-300"
                      }`}
                    >
                      <span className="text-[11px] mt-0.5">{isAdd ? "⚜️" : "💔"}</span>
                      <div>
                        <span className="font-bold underline tracking-wide">
                          {isAdd ? `${t.itemDiscovered}: ` : `${t.spentLost}: `}{change.item}
                        </span>
                        <span className="opacity-95 ml-1 font-sans text-slate-400">
                          ({change.reasoning})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Choices & Input interactions */}
          <div className="col-span-1 md:col-span-5 lg:col-span-1 xl:col-span-5 p-5 md:p-6 flex flex-col justify-between gap-5 bg-white/[0.005]">
            <div className="flex flex-col gap-3">
              <h2 className="text-[9px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent opacity-90 flex items-center gap-1.5 border-b border-white/5 pb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-immersive-accent" />
                {t.choosePath}
              </h2>

              {/* Ultra-sleek choices list */}
              <div className="flex flex-col gap-2.5">
                {scene.choices && scene.choices.map((choice: Choice, idx: number) => {
                  const isDisabled = isLoadingNext;
                  return (
                    <button
                      type="button"
                      key={choice.id || `choice-${idx}`}
                      disabled={isDisabled}
                      onClick={() => onSelectChoice(choice.text)}
                      className="w-full text-left bg-white/[0.01] hover:bg-white/[0.05] border border-white/5 hover:border-immersive-accent/40 disabled:opacity-50 transition-all duration-300 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer text-xs group disabled:cursor-not-allowed hover:shadow-[0_4px_12px_rgba(212,163,115,0.02)]"
                    >
                      <div className="flex items-start gap-3 flex-1 w-full min-w-0">
                        <div className="w-5 h-5 border border-immersive-accent rounded-full flex items-center justify-center text-[9px] font-bold font-mono text-immersive-accent shrink-0 group-hover:bg-immersive-accent/10 transition-colors mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="text-slate-350 group-hover:text-white leading-relaxed font-semibold transition-colors break-words flex-1 min-w-0">
                          {choice.text}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <span 
                          className={`text-[8px] uppercase font-mono px-2 py-0.5 rounded border tracking-wider font-bold ${getConsequenceClass(choice.consequencePreview)}`}
                        >
                          {choice.consequencePreview}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom reaction console */}
            <div className="border-t border-white/5 pt-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-immersive-accent" />
                  {t.customReaction}
                </span>
                
                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    disabled={isLoadingNext}
                    maxLength={90}
                    placeholder={t.placeholderReaction}
                    className="flex-1 bg-white/[0.01] border border-white/10 focus:border-immersive-accent focus:ring-1 focus:ring-immersive-accent/10 rounded-lg px-3 py-2 focus:outline-none text-slate-200 placeholder-slate-600 text-[11px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoadingNext || !customAction.trim()}
                    className="bg-immersive-accent hover:bg-immersive-accent/90 disabled:opacity-40 disabled:cursor-not-allowed px-3.5 rounded-lg text-immersive-bg font-extrabold transition-all hover:shadow-[0_0_12px_rgba(212,163,115,0.15)] flex items-center justify-center shrink-0 cursor-pointer text-[10px] gap-1 group font-mono uppercase select-none"
                  >
                    <span>{t.reactionButton}</span>
                    <CornerDownRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Reset / Quit control directly accessible in compact list */}
            <div className="border-t border-white/5 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t.confirmRestart)) {
                    onRestart();
                  }
                }}
                className="text-[9px] font-mono tracking-wider uppercase text-slate-500 hover:text-rose-450 transition-all flex items-center gap-1 cursor-pointer underline"
              >
                <RotateCcw className="w-3 h-3" />
                {t.restartGame}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
