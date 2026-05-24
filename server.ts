import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { generateFallbackSvg, ART_STYLES } from "./src/utils.js"; // Standard extension for ES modules if transpiled

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Initialize Gemini Client
// Using the recommended server-side approach with standard telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

const ai = getGeminiClient();

// Helper to check if API Key is configured
function isApiKeyConfigured() {
  return process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
}

// --------------------------------------------------------------------------
// API ENDPOINTS
// --------------------------------------------------------------------------

// Health probe API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    apiKeyConfigured: !!isApiKeyConfigured(),
    timestamp: new Date().toISOString()
  });
});

// JSON Schema for AdventureScene
const adventureSceneResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Short dramatic location or chapter title of physical setting"
    },
    description: {
      type: Type.STRING,
      description: "Engaging immersive text detailing what happens next, reacting directly to the user's action/choice. Word count: 100-180 words."
    },
    choices: {
      type: Type.ARRAY,
      description: "Exactly 3 unique choice objects reflecting logical next courses of action (combat, dialogue, stealth, research, etc.)",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique ID like choice_1, choice_2" },
          text: { type: Type.STRING, description: "Descriptive high-stakes action choice" },
          consequencePreview: { type: Type.STRING, description: "One/two-word visual cue hint representing choice stance (e.g., 'Risky', 'Tactical', 'Cautious', 'Audacious')" }
        },
        required: ["id", "text", "consequencePreview"]
      }
    },
    inventoryChanges: {
      type: Type.ARRAY,
      description: "List of items gained (add) or lost (remove) during this scene. Only add changes that dynamically happen in the scene narrative.",
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "Name of weapon, consumable, relic, or key item" },
          action: { type: Type.STRING, description: "Must be exactly 'add' or 'remove'" },
          reasoning: { type: Type.STRING, description: "Brief narrative explanation of how/why item was found/used" }
        },
        required: ["item", "action", "reasoning"]
      }
    },
    questUpdate: {
      type: Type.OBJECT,
      description: "The current state of the main adventure goal",
      properties: {
        currentQuest: { type: Type.STRING, description: "The overarching objective. Update only if player progresses, completes it, or gets a new primary focus." },
        statusUpdate: { type: Type.STRING, description: "Brief status summary of what just happened regarding this pursuit" }
      },
      required: ["currentQuest", "statusUpdate"]
    },
    characterStatus: {
      type: Type.OBJECT,
      description: "Protagonist status tracking state",
      properties: {
        health: { type: Type.INTEGER, description: "Current health value (0-100). Adjust logically based on hazards, combat, or healing events." },
        statusMessage: { type: Type.STRING, description: "Emotional/physical condition label (e.g., 'Dazed', 'Empowered', 'Poisoned', 'Healthy', 'Exhausted')" }
      },
      required: ["health", "statusMessage"]
    },
    imagePrompt: {
      type: Type.STRING,
      description: "Descriptive spatial image design prompt. Describe the scene's key physical focal points, single character presence, elements, and dramatic lighting. Focus purely on subject matter, NO art style terms."
    }
  },
  required: [
    "title",
    "description",
    "choices",
    "inventoryChanges",
    "questUpdate",
    "characterStatus",
    "imagePrompt"
  ]
};

// Route: Start a new adventure session
app.post("/api/adventure/start", async (req, res) => {
  const { config } = req.body;

  if (!config) {
    return res.status(400).json({ error: "Missing config object in body parameters." });
  }

  const genre = config.customGenre || config.genre;
  const quest = config.customQuest || config.startingQuest;
  const isPt = config.language === "pt-br";

  const languageInstructions = isPt 
    ? "IMPORTANT: You MUST generate all text content of the response in Brazilian Portuguese (Português Brasileiro). This includes 'title', 'description', choices 'text' and 'consequencePreview', inventoryChanges 'item' and 'reasoning', questUpdate 'currentQuest' and 'statusUpdate', and characterStatus 'statusMessage'. Do not use English for these fields."
    : "IMPORTANT: You MUST generate all text content of the response in English.";

  const systemInstruction = `You are a legendary Choose-Your-Own-Adventure game master.
The setting/genre: ${genre}
The protagonist's name: ${config.characterName}
Protagonist's specialty class: ${config.characterClass}
The overarching starting venture/goal: ${quest}

${languageInstructions}

You craft customized, deeply responsive narrative arcs. Create the introductory scene (Chapter 1) of the campaign.
Ensure that:
1. The narrator describes the physical world, setting a rich sensory scene. Keep it tight and atmospheric.
2. Provide 3 distinct active structural prompts (choices).
3. Set the starting quest properly.
4. Give the player some logical starters in inventory, like a starter tool/weapon or standard kit based on their background class. Return these under \`inventoryChanges\` as 'add' actions so the engine registers them!
5. Default starting health should be near 100, and include a starting status message like 'Nervous' or 'Ready'.
6. Do NOT return markdown or wrapping backticks outside of the JSON. Return a clean, valid JSON matching the schema precisely.`;

  try {
    if (!isApiKeyConfigured()) {
      // Fallback if no real key is configured
      if (isPt) {
        return res.json({
          id: "start_scene",
          title: `Os Portões de ${config.characterClass}`,
          description: `Sua jornada começa como um ${config.characterClass} chamado(a) ${config.characterName} no reino de ${genre}. Você se destaca perante o limiar, preparando-se para buscar: "${quest}". Nota: Para uma experiência de IA totalmente personalizada, insira sua GEMINI_API_KEY no painel de Segredos em Configurações.`,
          choices: [
            { id: "choice_1", text: "Seguir pela estrada principal de paralelepípedos sob o arco", consequencePreview: "Seguro" },
            { id: "choice_2", text: "Esgueirar-se pelo beco sombrio e oculto nas redondezas", consequencePreview: "Furtivo" },
            { id: "choice_3", text: "Consulte os pergaminhos da taverna por um guia alternativo", consequencePreview: "Sábio" }
          ],
          inventoryChanges: [
            { item: "Bússola de Bronze", action: "add", reasoning: "Herdada de seu mentor." },
            { item: "Rações de Sobrevivência", action: "add", reasoning: "Provisões de viagem padrão." }
          ],
          questUpdate: {
            currentQuest: quest,
            statusUpdate: "Você alcançou a etapa inicial de sua grande empreitada."
          },
          characterStatus: {
            health: 100,
            statusMessage: "Preparado"
          },
          imagePrompt: `A portrait of ${config.characterName} the ${config.characterClass} looking out into a misty ${genre} valley, back turned, atmospheric cinematic composition`
        });
      }

      return res.json({
        id: "start_scene",
        title: `The Gates of ${config.characterClass}`,
        description: `Your journey begins as a ${config.characterClass} named ${config.characterName} in the realm of ${genre}. You stand before the threshold, preparing to pursue: "${quest}". Note: For a fully personalized AI experience, please register your GEMINI_API_KEY in the Secrets panel in Settings.`,
        choices: [
          { id: "choice_1", text: "Take the primary cobblestone road under the archway", consequencePreview: "Safe" },
          { id: "choice_2", text: "Slink into the shadowy cobblestone underbelly alley", consequencePreview: "Stealth" },
          { id: "choice_3", text: "Consult the local tavern scrolls for an alternative guide", consequencePreview: "Knowledge" }
        ],
        inventoryChanges: [
          { item: "Bronze Compass", action: "add", reasoning: "Passed down by your mentor." },
          { item: "Survival Rations", action: "add", reasoning: "Standard exploration provisions." }
        ],
        questUpdate: {
          currentQuest: quest,
          statusUpdate: "You have arrived at the staging point of your massive endeavor."
        },
        characterStatus: {
          health: 100,
          statusMessage: "Prepared"
        },
        imagePrompt: `A portrait of ${config.characterName} the ${config.characterClass} looking out into a misty ${genre} valley, back turned, atmospheric cinematic composition`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate the starting scene of the adventure.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: adventureSceneResponseSchema,
        temperature: 0.9,
      }
    });

    const sceneData = JSON.parse(response.text || "{}");
    // Generate a unique ID
    sceneData.id = "scene_" + Date.now();
    res.json(sceneData);
  } catch (err: any) {
    console.error("Error starting adventure:", err);
    res.status(500).json({ error: err.message || "Failed to generate dynamic starting scene." });
  }
});

// Route: Advance adventure session based on selection
app.post("/api/adventure/next", async (req, res) => {
  const { config, state, choiceSelected } = req.body;

  if (!config || !state || !choiceSelected) {
    return res.status(400).json({ error: "Missing required body parameters: config, state, or choiceSelected." });
  }

  const genre = config.customGenre || config.genre;
  const isPt = config.language === "pt-br";

  const languageInstructions = isPt 
    ? "IMPORTANT: You MUST generate all text content of the response in Brazilian Portuguese (Português Brasileiro). This includes 'title', 'description', choices 'text' and 'consequencePreview', inventoryChanges 'item' and 'reasoning', questUpdate 'currentQuest' and 'statusUpdate', and characterStatus 'statusMessage'. Do not use English for these fields."
    : "IMPORTANT: You MUST generate all text content of the response in English.";

  // Format historical actions for short context memory
  const historySnippet = state.history && state.history.length > 0
    ? state.history.map((h: any, i: number) => `Chapter ${i+1}: Action: ${h.choiceSelected}\nNarrative: ${h.sceneDescription}`).join("\n\n")
    : "The path just started.";

  const systemInstruction = `You are a Choose-Your-Own-Adventure game master.
Setting / Genre: ${genre}
Protagonist Name: ${config.characterName} (Specialty Class: ${config.characterClass})
Primary active objective: ${state.currentQuest}

CURRENT INGAME ENGINE STATES (Must be respected, synchronized, and built upon):
- Inventory: [${state.inventory.join(", ") || "Nothing"}]
- Current Health: ${state.characterStatus.health}%
- Status Label: ${state.characterStatus.statusMessage}

CAMPAIGN HISTORY SUMMARY:
${historySnippet}

THE USER HAS ENERGETICALLY TAKEN THIS SPECIFIC ACTION:
"${choiceSelected}"

${languageInstructions}

Your crucial rules:
1. Progress the story instantly based on their action. If they chose one of your choices, expand on its implied scenario. If they wrote a custom response, evaluate its sanity, courage, or logic and generate a perfectly customized consequence reactively!
2. Dynamically modify properties:
   - If they spent or lost items (e.g. using a potion or shattering a shield), add a { item: "Name", action: "remove", reasoning: "..." } block.
   - If they discovered something new in their surrounding chest or taken from a foe, add a { item: "Name", action: "add", reasoning: "..." } block.
   - If they did something dangerous, decrease health rationally. If they took heavy fire/traps, they could drop by 15-30% HP. If they found a temple or drank standard medical supplies, restore some health!
   - Ensure you update the health accurately based on the current state. Do not let HP go below 5, unless they are critically defeated (e.g., they did something highly lethal, but let them survive with 5-10 HP for continuation if possible!).
3. Keep prose snappy and highly atmospheric (100 to 180 words maximum).
4. Outline EXACTLY 3 fresh choices suited to the immediate new situation. Indicate risk level or action stance in consequencePreview.
5. Do NOT return markdown or wrapping backticks outside of the JSON. Precision schema compliance is mandatory.`;

  try {
    if (!isApiKeyConfigured()) {
      // Fallback next scene
      if (isPt) {
        const sampleItem = choiceSelected.toLowerCase().includes("beco") || choiceSelected.toLowerCase().includes("sombrio")
          ? { item: "Pedaço de Manto Sombrio", action: "add", reasoning: "Encontrado pendurado em um gancho na parede escura do beco." }
          : { item: "Amuleto da Sorte", action: "add", reasoning: "Encontrado caído na estrada de terra." };

        const fallbackHealth = Math.max(10, state.characterStatus.health - (choiceSelected.toLowerCase().includes("beco") ? 15 : 0));

        return res.json({
          id: "scene_" + Date.now(),
          title: `Adentrando em ${genre}`,
          description: `Você seguiu com a escolha: "${choiceSelected}". Enfrentando as consequências imediatas de sua ação, caminhos desconhecidos se formam. Seu destino reverbera sob as leis de ${genre}. Esta é uma continuação estática. Forneça uma chave GEMINI_API_KEY em Segredos para histórias plenamente customizadas que reagem a suas iniciativas.`,
          choices: [
            { id: "choice_a", text: "Avançar à frente com postura alerta e defensiva", consequencePreview: "Defensivo" },
            { id: "choice_b", text: "Investigar um som de clique mecânico suave vindo de perto", consequencePreview: "Arriscado" },
            { id: "choice_c", text: "Tentar retornar com cautela ao cruzamento anterior", consequencePreview: "Cauteloso" }
          ],
          inventoryChanges: [sampleItem],
          questUpdate: {
            currentQuest: state.currentQuest,
            statusUpdate: `Prosseguindo na missão ativa: ${state.currentQuest}`
          },
          characterStatus: {
            health: fallbackHealth,
            statusMessage: fallbackHealth < 90 ? "Fraturado" : "Saudável"
          },
          imagePrompt: `A dynamic atmospheric action snapshot of adventure in ${genre} in response to action: ${choiceSelected}`
        });
      }

      const sampleItem = choiceSelected.toLowerCase().includes("alley") || choiceSelected.toLowerCase().includes("shadowy")
        ? { item: "Shadow Cloak Piece", action: "add", reasoning: "Snatched from a hook on a dark alley wall." }
        : { item: "Lucky Trinket", action: "add", reasoning: "Picked up off the road." };

      const fallbackHealth = Math.max(10, state.characterStatus.health - (choiceSelected.toLowerCase().includes(" alley") ? 15 : 0));

      return res.json({
        id: "scene_" + Date.now(),
        title: `Deep in ${genre}`,
        description: `You committed to the choice: "${choiceSelected}". Following this path, you face the immediate consequences. Shadows slide to reveal paths unknown. Your actions echo in ${genre}. This is a static continuation. Provide a GEMINI_API_KEY in Secrets for fully custom stories that react to your action.`,
        choices: [
          { id: "choice_a", text: "Move forward with defensive awareness", consequencePreview: "Defensive" },
          { id: "choice_b", text: "Investigate a soft clicking sound nearby", consequencePreview: "Risky" },
          { id: "choice_c", text: "Try to loop back to the crossroads", consequencePreview: "Cautious" }
        ],
        inventoryChanges: [sampleItem],
        questUpdate: {
          currentQuest: state.currentQuest,
          statusUpdate: `Continuing the main quest: ${state.currentQuest}`
        },
        characterStatus: {
          health: fallbackHealth,
          statusMessage: fallbackHealth < 90 ? "Slightly Bruised" : "Healthy"
        },
        imagePrompt: `A dynamic atmospheric action snapshot of adventure in ${genre} in response to action: ${choiceSelected}`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate consequences for character action: "${choiceSelected}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: adventureSceneResponseSchema,
        temperature: 0.85,
      }
    });

    const sceneData = JSON.parse(response.text || "{}");
    sceneData.id = "scene_" + Date.now();
    res.json(sceneData);
  } catch (err: any) {
    console.error("Error generating next scene:", err);
    res.status(500).json({ error: err.message || "Failed to proceed to next scene in story." });
  }
});

// Route: Real-time image generation with fallback
app.post("/api/adventure/image", async (req, res) => {
  const { imagePrompt, genre, artStyle, title } = req.body;

  if (!imagePrompt || !genre || !artStyle) {
    return res.status(400).json({ error: "Missing required parameters (imagePrompt, genre, artStyle)." });
  }

  const selectedPreset = ART_STYLES[artStyle] || { prompt: "realistic fantasy scene" };
  const baseStylePrompt = selectedPreset.prompt;

  // We combine the preset style and the scene's descriptive prompt to ensure absolute artistic style consistency!
  const finalPrompt = `An evocative landscape/scene. Artistic style: ${baseStylePrompt}. Subject matter: ${imagePrompt}. Focus on rich mood, beautiful spacing, centered focal point, professional coloring, no text, no captions, highly dramatic game illustration. Aspect ratio 16:9.`;

  try {
    if (!isApiKeyConfigured()) {
      // Fallback SVG
      const fallbackUrl = generateFallbackSvg(title || "A Mystical Chapter", imagePrompt, genre, artStyle);
      return res.json({ imageUrl: fallbackUrl, isFallback: true });
    }

    console.log(`Generating real-time image with model gemini-2.5-flash-image... Prompt length: ${finalPrompt.length}`);
    
    // Call gemini-2.5-flash-image
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    let base64Image = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (base64Image) {
      res.json({ imageUrl: `data:image/png;base64,${base64Image}`, isFallback: false });
    } else {
      console.warn("[Media Engine] Gemini model did not supply image bits. Dispatching vector visualization fallback.");
      const fallbackUrl = generateFallbackSvg(title || "A Mystical Chapter", imagePrompt, genre, artStyle);
      res.json({ imageUrl: fallbackUrl, isFallback: true });
    }
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      console.warn(`[Media Engine] Quota limit encountered [429]. Instantly serving highly responsive vector illustrations.`);
    } else {
      console.warn(`[Media Engine] Image model offline or busy. Instantly serving beautiful vector illustration fallbacks.`);
    }
    const fallbackUrl = generateFallbackSvg(title || "A Mystical Chapter", imagePrompt, genre, artStyle);
    res.json({ imageUrl: fallbackUrl, isFallback: true, error: "Quota system limit reached. Vector visualization rendered successfully." });
  }
});

// --------------------------------------------------------------------------
// VITE CLIENT LOADING & PRODUCTION STATIC SERVING
// --------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(`⚡ Adventure Engine server running on Port ${PORT} ⚡`);
    console.log(`- API Status: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer();
