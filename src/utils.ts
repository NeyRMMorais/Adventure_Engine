export const ART_STYLES: Record<string, { label: string; prompt: string; desc: string }> = {
  fantasy_watercolor: {
    label: "Vintage Watercolors",
    prompt: "delicate fantasy vintage watercolor painting, soft liquid wash textures, subtle ink line accents, faded hues, high aesthetic, glowing fairytale atmosphere",
    desc: "Soft colors and charming fairytale outlines resembling classic illustrations."
  },
  cyberpunk_sketch: {
    label: "Vibrant Anime Sketch",
    prompt: "dynamic hand-drawn anime key art sketch, cel-shaded hybrid, clean line art, vibrant neon ambient lighting, action pose, digital concept design",
    desc: "Bold lines and bright highlights bringing the future to life."
  },
  pixel_art: {
    label: "Retro 16-Bit Pixel Art",
    prompt: "detailed 16-bit retro pixel art game screenshot, rich limited color palette, clean grid scaling, indie game style, evocative retro look, detailed background sprites",
    desc: "Charming digital sprites and block scaling that mimic retro adventure games."
  },
  grimdark_charcoal: {
    label: "Grimdark Charcoal Sketch",
    prompt: "gritty charcoal graphite pencil drawing, heavy textured paper, stark high-contrast shadows, sketchy outlines, monochrome with single atmospheric colored highlight, epic dark fantasy concept art",
    desc: "Dark, gritty charcoal strokes for an intense, mysterious experience."
  },
  stained_glass: {
    label: "Stained Glass Illustration",
    prompt: "beautiful stylized stained-glass panel, thick dark leading lines dividing translucent colored glass patterns, luminous light rays shining through, cathedral art style, glowing majestic vector looks",
    desc: "Vibrant panels divided by bold lead outlines, glowing with mystical light."
  }
};

export const GENRES: Record<string, { label: string; bgClass: string; textClass: string; colorSchema: string[] }> = {
  medieval_fantasy: {
    label: "Medieval Fantasy",
    bgClass: "from-[#1b4332] to-[#081c15]",
    textClass: "text-emerald-400",
    colorSchema: ["#d4af37", "#1b4332", "#40916c", "#081c15"]
  },
  cyberpunk_noir: {
    label: "Cyberpunk Noir",
    bgClass: "from-[#1a0933] to-[#0a0212]",
    textClass: "text-pink-400",
    colorSchema: ["#ff007f", "#00f5ff", "#8a2be2", "#0a0212"]
  },
  cosmic_horror: {
    label: "Cosmic Horror",
    bgClass: "from-[#141d26] to-[#030708]",
    textClass: "text-purple-400",
    colorSchema: ["#4a154b", "#008080", "#2c1c50", "#030708"]
  },
  post_apocalyptic: {
    label: "Post-Apocalyptic",
    bgClass: "from-[#432818] to-[#170f0d]",
    textClass: "text-orange-400",
    colorSchema: ["#b85d14", "#ddbe94", "#4a4e5d", "#170f0d"]
  },
  ancient_mythology: {
    label: "Ancient Mythology",
    bgClass: "from-[#1e3d59] to-[#07131e]",
    textClass: "text-amber-400",
    colorSchema: ["#f5f0e1", "#ff6e40", "#1e3d59", "#ffc13b"]
  }
};

/**
 * Generates an atmospheric, high-quality, lightweight SVG graphic
 * representing the scene when Gemini model is unavailable.
 */
export function generateFallbackSvg(
  title: string,
  imagePrompt: string,
  genreKey: string,
  styleKey: string
): string {
  const genre = GENRES[genreKey] || { colorSchema: ["#d4a373", "#111216", "#1c1c22", "#08080a"] };
  const palette = genre.colorSchema;
  
  const width = 800;
  const height = 450;
  const c1 = palette[0];
  const c2 = palette[1];
  const c3 = palette[2] || "#000000";
  const c4 = palette[3] || "#111111";

  // Use the title or prompt of the scene to generate a seed
  let seed = 0;
  for (let i = 0; i < (imagePrompt || title).length; i++) {
    seed += (imagePrompt || title).charCodeAt(i);
  }

  const randomVal = (min: number, max: number, offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    const r = x - Math.floor(x);
    return min + r * (max - min);
  };

  // Generate stylized elements depending on the genre
  let pathElements = "";
  if (genreKey === "cyberpunk_noir") {
    // Cyberpunk grid & glowing neon shapes
    pathElements += `<defs>
      <linearGradient id="cyberGrid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0.8"/>
      </linearGradient>
    </defs>`;
    
    // Draw horizon grid
    pathElements += `<rect width="${width}" height="${height}" fill="url(#cyberGrid)"/>`;
    for (let i = 0; i < 15; i++) {
      const xStart = (width / 14) * i;
      pathElements += `<line x1="${xStart}" y1="${height}" x2="${width / 2 + (xStart - width / 2) * 0.2}" y2="${height * 0.4}" stroke="${c1}" stroke-width="1" opacity="0.4" />`;
    }
    for (let j = 0; j < 6; j++) {
      const y = height * 0.4 + (height * 0.6) * Math.pow(j / 5, 2);
      pathElements += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${c1}" stroke-width="1" opacity="0.4" />`;
    }

    // Glowing geometric towers or polygons
    for (let i = 0; i < 5; i++) {
      const w = randomVal(40, 100, i * 12);
      const h = randomVal(100, 300, i * 15);
      const x = randomVal(50, width - 150, i * 18);
      pathElements += `<rect x="${x}" y="${height - h}" width="${w}" height="${h}" fill="${c3}" opacity="0.6" stroke="${c2}" stroke-width="2" />`;
      // Neon trim
      pathElements += `<line x1="${x}" y1="${height - h}" x2="${x + w}" y2="${height - h}" stroke="${c1}" stroke-width="3" />`;
    }
  } else if (genreKey === "medieval_fantasy") {
    // Medieval Fantasy mountains, sun/moon, trees
    pathElements += `<circle cx="${width / 2}" cy="${height * 0.35}" r="${randomVal(60, 100, 5)}" fill="${c1}" opacity="0.25" />`;
    
    // Mountains
    for (let i = 0; i < 3; i++) {
      const peakX = randomVal(150, width - 150, i * 10);
      const peakY = randomVal(100, 250, i * 14);
      pathElements += `<polygon points="0,${height} ${peakX},${peakY} ${width},${height}" fill="${c2}" opacity="0.5" stroke="${c1}" stroke-width="0.5" />`;
    }
    // Secondary forest layer
    for (let i = 0; i < 8; i++) {
      const treeX = randomVal(50, width - 50, i * 9);
      const treeY = height - randomVal(10, 40, i * 3);
      pathElements += `<polygon points="${treeX - 15},${treeY} ${treeX},${treeY - 40} ${treeX + 15},${treeY}" fill="${c3}" opacity="0.8" />`;
    }
  } else if (genreKey === "cosmic_horror") {
    // Swirling circles and abstract eerie background
    for (let i = 0; i < 6; i++) {
      const cx = width / 2 + randomVal(-100, 100, i * 7);
      const cy = height / 2 + randomVal(-50, 50, i * 4);
      const r = randomVal(50, 180, i * 11);
      pathElements += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c1}" stroke-width="1.5" stroke-dasharray="5,10" opacity="${0.15 + (i * 0.05)}" />`;
    }
    // Central eerie eye / singularity
    pathElements += `<circle cx="${width / 2}" cy="${height / 2}" r="30" fill="${c4}" stroke="${c2}" stroke-width="3" />`;
    pathElements += `<ellipse cx="${width / 2}" cy="${height / 2}" rx="50" ry="10" stroke="${c1}" fill="none" stroke-width="1" />`;
  } else if (genreKey === "post_apocalyptic") {
    // Dust storms, ruins, sun filtered by ashes
    pathElements += `<circle cx="${width * 0.7}" cy="${height * 0.3}" r="45" fill="${c1}" opacity="0.8" />`;
    // Cracked debris silhouette
    for (let i = 0; i < 6; i++) {
      const hState = randomVal(80, 200, i * 8);
      const wState = randomVal(60, 120, i * 9);
      const xState = randomVal(30, width - 150, i * 11);
      pathElements += `<polygon points="${xState},${height} ${xState + wState * 0.2},${height - hState} ${xState + wState},${height - hState * 0.6} ${xState + wState},${height}" fill="${c3}" opacity="0.75" />`;
      // Highlights
      pathElements += `<line x1="${xState + wState * 0.2}" y1="${height - hState}" x2="${xState + wState}" y2="${height - hState * 0.6}" stroke="${c2}" stroke-width="1.5" />`;
    }
  } else {
    // Default abstract geometry
    for (let i = 0; i < 12; i++) {
      const r = randomVal(30, 200, i * 5);
      const cx = randomVal(0, width, i * 3);
      const cy = randomVal(0, height, i * 2);
      pathElements += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.6}" fill="${i % 2 === 0 ? c1 : c2}" opacity="0.15" />`;
    }
  }

  // Draw a sleek HUD framing
  const borderMarkup = `<rect x="15" y="15" width="${width - 30}" height="${height - 30}" fill="none" stroke="${c1}" stroke-width="2" opacity="0.3" rx="4" />
  <line x1="15" y1="35" x2="45" y2="35" stroke="${c1}" stroke-width="2" />
  <line x1="35" y1="15" x2="35" y2="45" stroke="${c1}" stroke-width="2" />
  <line x1="${width - 15}" y1="35" x2="${width - 45}" y2="35" stroke="${c1}" stroke-width="2" />
  <line x1="${width - 35}" y1="15" x2="${width - 35}" y2="45" stroke="${c1}" stroke-width="2" />`;

  const inlineSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="background-color: ${c4}; font-family: monospace;">
      <rect width="100%" height="100%" fill="${c4}" />
      ${pathElements}
      ${borderMarkup}
      <!-- Text Description HUD -->
      <rect x="30" y="${height - 75}" width="${width - 60}" height="50" fill="${c4}" opacity="0.85" rx="6" stroke="${c2}" stroke-width="1" />
      <text x="50" y="${height - 43}" fill="#ffffff" font-size="14" font-weight="bold" opacity="0.95">${title.slice(0, 48)}</text>
      <text x="50" y="${height - 32}" fill="${c1}" font-size="10" opacity="0.8">SYSTEM VISUALIZER: ${ART_STYLES[styleKey]?.label || "Visual Vector"}</text>
    </svg>
  `.trim();

  // Convert SVG to highly compact base64 data URL
  const base64Svg = Buffer.from(inlineSvg).toString("base64");
  return `data:image/svg+xml;base64,${base64Svg}`;
}

export const TRANSLATIONS = {
  en: {
    // Nav / General
    title: "Adventure Forge",
    engineVersion: "Saga Engine V2",
    coreSync: "Gemini Core Synchronized",
    systemAnomaly: "System Link Anomaly",
    checkKey: "Ensure that your GEMINI_API_KEY is configured correctly under Settings > Secrets, and try checking your internet connection.",
    loadingPortals: "Unpacking narrative portals...",
    restartGame: "OUTPOST FORGE (Restart Game)",
    confirmRestart: "Are you sure you want to abandon this campaign and return to the engine forge?",
    
    // Setup Panel
    forgeTitle: "Adventure Forge",
    forgeSubtitle: "Forge custom protagonists, calibrate unique narrative worlds, select visual render aesthetics, and embark on an infinite saga powered by Gemini AI story models.",
    protagonistName: "Protagonist Name",
    placeholderHero: "e.g. Vaelish Greyblood, Agent K, Rogue Zero",
    archetypeClass: "Archetype Class",
    settingGenre: "Adventure Setting & Genre",
    customRealm: "[Custom Realm]",
    customRealmTitle: "Write Custom Settings",
    customRealmDesc: "Describe your custom world or custom narrative canvas (e.g. \"Steampunk Desert Sky-Pirates\").",
    customRealmPlaceholder: "e.g. Steampunk Ice Age with magic crystals",
    paletteMatrix: "PALETTE MATRIX:",
    artRenderingStyle: "Art Rendering Consistency Style",
    ctaQuest: "Call to Action (Starting Quest)",
    questPresets: "Presets",
    questWriteCustom: "Write Custom",
    placeholderCustomQuest: "e.g. Rescue my lost sibling from the high-security orbital prison...",
    submitButton: "Begin Your Odyssey",
    submitLoading: "Calibrating Universe Realities...",

    // Game Screen
    currentLocation: "Current Location",
    settingSuffix: "Setting",
    choosePath: "Choose Your Path or Reaction",
    customReaction: "Write Custom Reaction Action",
    placeholderReaction: "Declare your action (e.g. 'I study the runes' or 'Toss starting items key')...",
    reactionButton: "Commit",
    visualStyle: "Visual Style",
    itemDiscovered: "Item Discovered",
    spentLost: "Spent / Lost",

    // Sidebar
    protagonistStatus: "Protagonist Status",
    unnamedExplorer: "Unnamed Explorer",
    vitality: "Vitality",
    condition: "CONDITION:",
    currentQuest: "Current Quest",
    questFootnote: "Your decisions forge the chronicle of tomorrow.",
    inventory: "Inventory",
    slots: "SLOTS",
    chroniclePath: "Chronicle Path",

    // Language selector labels
    selectLanguage: "Interface & Story Language"
  },
  "pt-br": {
    // Nav / General
    title: "Forja de Aventuras",
    engineVersion: "Saga Engine V2",
    coreSync: "Gemini Core Sincronizado",
    systemAnomaly: "Anomalia de Link do Sistema",
    checkKey: "Verifique se a sua chave GEMINI_API_KEY está configurada corretamente em Configurações > Segredos, e confira sua conexão com o servidor.",
    loadingPortals: "Descompactando portais de narrativa...",
    restartGame: "FORJA CENTRAL (Reiniciar)",
    confirmRestart: "Tem certeza que deseja abandonar esta campanha e retornar para a forja central?",
    
    // Setup Panel
    forgeTitle: "Forja de Aventuras",
    forgeSubtitle: "Forje protagonistas personalizados, calibre universos narrativos únicos, selecione estéticas visuais consistentes e embarque em uma saga de escolhas infinita alimentada pelos modelos de história da Gemini AI.",
    protagonistName: "Nome do Protagonista",
    placeholderHero: "ex: Vaelish Greyblood, Agente K, Ladino Zero",
    archetypeClass: "Classe do Arquétipo",
    settingGenre: "Gênero e Cenário da Aventura",
    customRealm: "[Mundo Personalizado]",
    customRealmTitle: "Descrever Mundo Personalizado",
    customRealmDesc: "Descreva seu mundo customizado ou mescle gêneros (ex: \"Piratas Celestes do Deserto Steampunk\").",
    customRealmPlaceholder: "ex: Era Glacial Steampunk com cristais mágicos",
    paletteMatrix: "MATRIZ DE CORES:",
    artRenderingStyle: "Consistência de Renderização de Arte",
    ctaQuest: "Chamado para Ação (Missão Inicial)",
    questPresets: "Modelos",
    questWriteCustom: "Personalizado",
    placeholderCustomQuest: "ex: Resgatar meu irmão perdido da prisão orbital de segurança máxima...",
    submitButton: "Iniciar Odisseia",
    submitLoading: "Calibrando Realidades do Universo...",

    // Game Screen
    currentLocation: "Localização Atual",
    settingSuffix: "Cenário de",
    choosePath: "Escolha Seu Caminho ou Reação",
    customReaction: "Escrever Reação Personalizada",
    placeholderReaction: "Declare sua ação (ex: 'Eu estudo as runas' ou 'Ofereço moedas ao guia')...",
    reactionButton: "Confirmar",
    visualStyle: "Estilo Visual",
    itemDiscovered: "Item Descoberto",
    spentLost: "Gasto / Perdido",

    // Sidebar
    protagonistStatus: "Status do Protagonista",
    unnamedExplorer: "Explorador Sem Nome",
    vitality: "Vitalidade",
    condition: "CONDIÇÃO:",
    currentQuest: "Missão Atual",
    questFootnote: "Suas decisões moldam a crônica do amanhã.",
    inventory: "Inventário",
    slots: "SLOTS",
    chroniclePath: "Linha do Tempo / Crônica",

    // Language selector labels
    selectLanguage: "Idioma da Interface e História"
  }
} as const;

