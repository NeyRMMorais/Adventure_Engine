import React, { useState, useEffect } from "react";
import { 
  Compass, 
  User, 
  Sparkles, 
  Hammer, 
  Flame, 
  Skull, 
  Cpu, 
  BookOpen, 
  HelpCircle,
  Play,
  Languages
} from "lucide-react";
import { AdventureConfig } from "../types";
import { ART_STYLES, GENRES, TRANSLATIONS } from "../utils";

interface SetupPanelProps {
  onStart: (config: AdventureConfig) => void;
  isLoading: boolean;
}

const CLASS_PRESETS_EN = [
  { value: "Warrior/Fighter", label: "Martial Champion", icon: Flame, desc: "A master of blades, armor, and direct physical grit." },
  { value: "Rogue/Hacker", label: "Shadow Operative", icon: Skull, desc: "Sly, quick-witted, excels in stealth, security bypasses, and systems." },
  { value: "Scholar/Mage", label: "High Elementalist", icon: Sparkles, desc: "Channels ancient codes or celestial arts to bend reality." },
  { value: "Scavenger/Survivalist", label: "Wasteland Scavenger", icon: Hammer, desc: "Resourceful utility expert skilled in repairs and field tinkering." },
  { value: "Wandering Mystic", label: "Cosmic Wanderer", icon: HelpCircle, desc: "Guided by instincts, fortune-telling, and forgotten mysteries." }
];

const CLASS_PRESETS_PT = [
  { value: "Warrior/Fighter", label: "Campeão Marcial", icon: Flame, desc: "Mestre das lâminas, armadura robusta e pura determinação física." },
  { value: "Rogue/Hacker", label: "Operador de Sombras", icon: Skull, desc: "Astuto, sagaz, mestre em infiltração, furtividade e invasão de sistemas." },
  { value: "Scholar/Mage", label: "Alto Elementalista", icon: Sparkles, desc: "Canaliza magias ancestrais ou artes matemáticas para alterar a realidade." },
  { value: "Scavenger/Survivalist", label: "Sucateiro do Deserto", icon: Hammer, desc: "Especialista engenhoso em sobrevivência, reparos e ferramentas improvisadas." },
  { value: "Wandering Mystic", label: "Místico Errante", icon: HelpCircle, desc: "Guiado por premonições, leitura de runas e mistérios esquecidos no tempo." }
];

const QUEST_PRESETS_EN: Record<string, string[]> = {
  medieval_fantasy: [
    "Cleanse the mysterious necrotic blight devouring the Whisperwood.",
    "Reclaim the Shattered Crown of Eldoria from the dragon's lair.",
    "Resolve the ancient faction feud before the blood moon rises."
  ],
  cyberpunk_noir: [
    "Extract the highly classified mind-upload chip from a megacorp vault.",
    "Investigate the neon alley murder of a synthetic cybernetic engineer.",
    "Disable the central rogue AI controlling the city's power grid."
  ],
  cosmic_horror: [
    "Investigate the forbidden codex hidden in the sunken lighthouse catalog.",
    "Infiltrate the whispering cult that meets at midnight in the salt dunes.",
    "Escape the warping geometry of an ancient labyrinth beneath the cliffs."
  ],
  post_apocalyptic: [
    "Locate the legendary Water Purifier Chip in Vault-88's depths.",
    "Negotiate a tense trade treaty with the radioactive Dust Raiders.",
    "Ascend the rust spire to restart the atmosphere booster spire."
  ],
  ancient_mythology: [
    "Retrieve the Golden Fleece from the serpent's grove.",
    "Seek the legendary oracle of prophecy hidden deep in the obsidian caves.",
    "Bargain with the Lord of the Underworld to rescue a fallen comrade."
  ]
};

const QUEST_PRESETS_PT: Record<string, string[]> = {
  medieval_fantasy: [
    "Purificar a misteriosa praga necrótica que devora a Floresta Sussurrante.",
    "Recuperar a Coroa Despedaçada de Eldoria do covil do dragão ancião.",
    "Mediar a rivalidade de facções ancestrais antes da lua de sangue nascer."
  ],
  cyberpunk_noir: [
    "Extrair o chip ultrassecreto de IA consciente de um cofre de megacorporação.",
    "Investigar o assassinato de um engenheiro cibernético em um beco de neon.",
    "Desativar a IA corrompida central que controla a rede de energia da cidade."
  ],
  cosmic_horror: [
    "Decifrar o manuscrito proibido do farol submerso atormentado por pesadelos.",
    "Infiltrar-se no culto silencioso que se reúne nas dunas de sal na meia-noite.",
    "Escapar da geometria distorcida de um labirinto esquecido sob os penhascos."
  ],
  post_apocalyptic: [
    "Localizar o lendário Módulo Purificador de Água nas profundezas do Abrigo-88.",
    "Negociar um tratado de suprimentos instável com a gangue de Saqueadores de Areia.",
    "Escalar a grande torre de sucata enferrujada para reativar o gerador atmosférico."
  ],
  ancient_mythology: [
    "Recuperar o Velocino de Ouro sob a guarda da temível serpente sagrada.",
    "Consultar o oráculo de fogo oculto no coração das cavernas de obsidiana.",
    "Negociar com o Senhor do Submundo o resgate da alma de seu aliado caído."
  ]
};

export const SetupPanel: React.FC<SetupPanelProps> = ({ onStart, isLoading }) => {
  const [language, setLanguage] = useState<"en" | "pt-br">("en");
  const [characterName, setCharacterName] = useState("");
  const [characterClass, setCharacterClass] = useState("Warrior/Fighter");
  const [genre, setGenre] = useState("medieval_fantasy");
  const [customGenre, setCustomGenre] = useState("");
  const [artStyle, setArtStyle] = useState("fantasy_watercolor");
  const [startingQuest, setStartingQuest] = useState("");
  const [customQuest, setCustomQuest] = useState("");
  const [isCustomGenreActive, setIsCustomGenreActive] = useState(false);
  const [isCustomQuestActive, setIsCustomQuestActive] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const classPresets = language === "pt-br" ? CLASS_PRESETS_PT : CLASS_PRESETS_EN;
  const questPresetsMap = language === "pt-br" ? QUEST_PRESETS_PT : QUEST_PRESETS_EN;

  // Sync starting quest presets when selected genre changes or language changes
  useEffect(() => {
    if (!isCustomGenreActive) {
      const presets = questPresetsMap[genre] || [];
      if (presets.length > 0) {
        setStartingQuest(presets[0]);
      }
    } else {
      setStartingQuest("");
    }
  }, [genre, isCustomGenreActive, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = characterName.trim() || "The Nameless One";
    
    onStart({
      genre: isCustomGenreActive ? "custom" : genre,
      customGenre: isCustomGenreActive ? customGenre.trim() || "Mysterious Realm" : undefined,
      characterName: finalName,
      characterClass,
      artStyle,
      startingQuest: isCustomQuestActive ? "custom" : startingQuest,
      customQuest: isCustomQuestActive ? customQuest.trim() || "Find my inner path" : undefined,
      language
    });
  };

  const getGenreDescription = (gKey: string) => {
    if (language === "pt-br") {
      switch(gKey) {
        case "medieval_fantasy": return "Um vasto universo repleto de cavaleiros, magias ancestrais, dragões selvagens e florestas esquecidas.";
        case "cyberpunk_noir": return "Arranha-céus espelhados sob chuvas ácidas, neons ofuscantes, invasão de sistemas e esconderijos suburbanos.";
        case "cosmic_horror": return "Vilas pesqueiras repletas de segredos antigos, névoas salinas, quebra-cabeças de sanidade e sussurros alienígenas.";
        case "post_apocalyptic": return "Cidades enferrujadas em desertos radioativos, escassez de suprimentos puros, filtros e nômades selvagens.";
        case "ancient_mythology": return "Intervenção dos deuses do Olimpo, templos de mármore, artefatos divinos, serpentes colossais e veleiros lendários.";
        default: return "";
      }
    } else {
      switch(gKey) {
        case "medieval_fantasy": return "A broad world of knights, ancient magic circles, dragon vaults, and dense forgotten forests.";
        case "cyberpunk_noir": return "Rain-swept glass spires, blinding neon lights, hacking cyber-terminals, and shady syndicate safehouses.";
        case "cosmic_horror": return "Riddle-packed seaside villages, saltwater mist, geometric sanity shifting, and alien star whisperers.";
        case "post_apocalyptic": return "Rust towers, desolate radioactive roads, protective filters, dust-mufflers, and tense desert scavenging.";
        case "ancient_mythology": return "Pantheonic interventions, marble shrines, golden artifacts, serpent groves, and epic sails across azure seas.";
        default: return "";
      }
    }
  };

  return (
    <div 
      id="setup-panel"
      className="max-w-4xl mx-auto bg-immersive-panel border border-immersive-border rounded-3xl overflow-hidden p-6 md:p-8 shadow-2xl relative"
    >
      {/* Visual background ambient lighting */}
      <div 
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full filter blur-3xl opacity-10 transition-all duration-700"
        style={{
          backgroundColor: isCustomGenreActive ? "#d4a373" : (GENRES[genre]?.colorSchema?.[0] || "#d4a373")
        }}
      />
      
      {/* Title block with language select toggler */}
      <header className="mb-8 border-b border-white/5 pb-6 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Compass className="w-8 h-8 text-immersive-accent stroke-[1.5]" />
            {t.forgeTitle}
          </h1>
          <p className="text-slate-400 text-xs mt-2 max-w-xl font-serif italic">
            {t.forgeSubtitle}
          </p>
        </div>

        {/* Dynamic Multi-Language Selector Toggles */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-1.5 flex items-center gap-1 shrink-0">
          <Languages className="w-3.5 h-3.5 text-immersive-accent/70 ml-2 mr-1" />
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold select-none cursor-pointer transition-all ${
              language === "en" 
                ? "bg-immersive-accent text-immersive-bg font-extrabold shadow" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage("pt-br")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold select-none cursor-pointer transition-all ${
              language === "pt-br" 
                ? "bg-immersive-accent text-immersive-bg font-extrabold shadow" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            PT-BR
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {/* ROW 1: Character Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent opacity-90 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {t.protagonistName}
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder={t.placeholderHero}
              maxLength={30}
              className="w-full bg-white/[0.02] border border-white/10 focus:border-immersive-accent focus:ring-1 focus:ring-immersive-accent/20 rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none transition-all text-white font-sans text-sm"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent opacity-90">
              {t.archetypeClass}
            </label>
            <div className="relative">
              <select
                value={characterClass}
                onChange={(e) => setCharacterClass(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 focus:border-immersive-accent focus:ring-1 focus:ring-immersive-accent/20 rounded-xl px-4 py-3 focus:outline-none transition-all text-white font-sans text-sm appearance-none cursor-pointer"
              >
                {classPresets.map((cls) => (
                  <option key={cls.value} value={cls.value} className="bg-immersive-bg text-white">
                    {cls.value}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Archetype Quick Info Display */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {classPresets.map((preset) => {
            const ActiveIcon = preset.icon;
            const isSelected = characterClass === preset.value;
            return (
              <button
                type="button"
                key={preset.value}
                onClick={() => setCharacterClass(preset.value)}
                className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all duration-300 ${
                  isSelected 
                    ? "bg-white/[0.05] border-immersive-accent text-immersive-accent shadow-[0_0_12px_rgba(212,163,115,0.2)] font-semibold" 
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <ActiveIcon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-immersive-accent scale-110' : 'text-slate-500'}`} />
                <span className="text-[11px] font-bold tracking-tight">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* ROW 2: World Setting */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent opacity-90">
            {t.settingGenre}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
              {/* Preset selection buttons */}
              <div className="flex flex-col gap-2">
                {Object.entries(GENRES).map(([key, item]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => {
                      setGenre(key);
                      setIsCustomGenreActive(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all text-xs flex justify-between items-center cursor-pointer ${
                      genre === key && !isCustomGenreActive
                        ? "bg-white/[0.06] border-white/20 text-white font-semibold shadow-inner"
                        : "bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span 
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: item.colorSchema[0] }}
                    />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsCustomGenreActive(true)}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all text-xs flex justify-between items-center cursor-pointer ${
                    isCustomGenreActive
                      ? "bg-white/[0.06] border-immersive-accent text-white font-semibold"
                      : "bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{t.customRealm}</span>
                  <div className="w-2 h-2 rounded-full bg-immersive-accent border border-white/50 animate-pulse" />
                </button>
              </div>
            </div>

            {/* Sub-pane with custom parameters / info description */}
            <div className="col-span-1 md:col-span-3 bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
              {isCustomGenreActive ? (
                <div className="flex flex-col gap-3 h-full justify-center">
                  <h4 className="text-[10px] font-mono font-bold text-immersive-accent uppercase tracking-wider">{t.customRealmTitle}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {t.customRealmDesc}
                  </p>
                  <input
                    type="text"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    placeholder={t.customRealmPlaceholder}
                    className="w-full bg-white/[0.02] border border-white/10 focus:border-immersive-accent rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                    required={isCustomGenreActive}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 h-full justify-between animate-fadeIn">
                  <div>
                    <h4 className="text-base font-bold text-immersive-accent">
                      {GENRES[genre]?.label}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {getGenreDescription(genre)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 border-t border-white/5 pt-3 text-[10px] text-slate-500 font-mono">
                    <span>{t.paletteMatrix}</span>
                    <div className="flex gap-1.5">
                      {(GENRES[genre]?.colorSchema || []).map((clr) => (
                        <span 
                          key={clr} 
                          className="w-3.5 h-3.5 rounded-sm mt-0.5 border border-white/10" 
                          style={{ backgroundColor: clr }}
                          title={clr}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 3: Consistent Art Style selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent opacity-90">
            {t.artRenderingStyle}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3.5 border-b border-white/5 pb-2">
            {Object.entries(ART_STYLES).map(([key, style]) => {
              const isSelected = artStyle === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setArtStyle(key)}
                  className={`flex flex-col p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? "bg-white/[0.05] border-immersive-accent text-white shadow-lg" 
                      : "bg-white/[0.01] border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-200">{style.label}</span>
                  <span className="text-[10px] text-slate-500 mt-2 leading-relaxed font-sans">
                    {style.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 4: Starter Quest Hook */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-immersive-accent opacity-90 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> {t.ctaQuest}
            </label>
            <div className="text-xs flex gap-3 text-slate-500">
              <button
                type="button"
                onClick={() => setIsCustomQuestActive(false)}
                className={`transition-colors text-[10px] font-bold font-mono uppercase tracking-wide cursor-pointer ${!isCustomQuestActive ? 'text-immersive-accent font-semibold' : 'text-slate-500'}`}
              >
                {t.questPresets}
              </button>
              <span className="text-white/10">|</span>
              <button
                type="button"
                onClick={() => setIsCustomQuestActive(true)}
                className={`transition-colors text-[10px] font-bold font-mono uppercase tracking-wide cursor-pointer ${isCustomQuestActive ? 'text-immersive-accent font-semibold' : 'text-slate-500'}`}
              >
                {t.questWriteCustom}
              </button>
            </div>
          </div>

          {isCustomQuestActive ? (
            <input
              type="text"
              value={customQuest}
              onChange={(e) => setCustomQuest(e.target.value)}
              placeholder={t.placeholderCustomQuest}
              className="w-full bg-white/[0.02] border border-white/10 focus:border-immersive-accent rounded-xl px-4 py-3 placeholder-slate-600 focus:outline-none transition-all text-white font-sans text-xs"
              required={isCustomQuestActive}
            />
          ) : (
            <div className="flex flex-col gap-2 transition-all">
              {(questPresetsMap[genre] || []).map((qText) => (
                <label 
                  key={qText}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-300 text-xs ${
                    startingQuest === qText 
                      ? "bg-white/[0.05] border-immersive-accent text-white" 
                      : "bg-white/[0.01] border-white/5 text-slate-450 hover:border-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="startingQuest"
                    value={qText}
                    checked={startingQuest === qText}
                    onChange={() => setStartingQuest(qText)}
                    className="mt-0.5 text-immersive-accent focus:ring-slate-900 border-white/20 bg-transparent shrink-0 cursor-pointer"
                  />
                  <span className="font-sans font-medium">{qText}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* START ACTION: Beautiful theme gold primary button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-immersive-accent hover:bg-immersive-accent/95 disabled:opacity-40 disabled:cursor-not-allowed text-immersive-bg font-extrabold uppercase tracking-widest font-mono rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,163,115,0.4)] flex items-center justify-center gap-2 cursor-pointer text-sm font-bold"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 bg-transparent rounded-full animate-spin" />
              <span>{t.submitLoading}</span>
            </div>
          ) : (
            <>
              <Play className="w-4 h-4 fill-immersive-bg transition-transform group-hover:scale-110" />
              <span>{t.submitButton}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
