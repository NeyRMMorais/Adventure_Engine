export interface AdventureConfig {
  genre: string;
  characterName: string;
  characterClass: string;
  artStyle: string;
  startingQuest: string;
  customGenre?: string;
  customQuest?: string;
  language?: "en" | "pt-br";
}

export interface Choice {
  id: string;
  text: string;
  consequencePreview: string; // Brief hint (e.g., "Risky", "Strategic", "Safe")
}

export interface InventoryChange {
  item: string;
  action: 'add' | 'remove';
  reasoning: string;
}

export interface QuestUpdate {
  currentQuest: string;
  statusUpdate: string;
}

export interface CharacterStatus {
  health: number; // 0 to 100
  statusMessage: string; // e.g., "Slightly Poisoned", "Healthy", "Inspired"
}

export interface GameState {
  inventory: string[];
  currentQuest: string;
  characterStatus: CharacterStatus;
  history: Array<{
    choiceSelected: string;
    sceneDescription: string;
  }>;
}

export interface AdventureScene {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
  inventoryChanges: InventoryChange[];
  questUpdate: QuestUpdate;
  characterStatus: CharacterStatus;
  imagePrompt: string;
  imageUrl?: string;
}

export interface AdventureSession {
  config: AdventureConfig;
  state: GameState;
  scenes: AdventureScene[];
}
