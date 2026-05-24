import { useEffect, useState } from "react";
import { Compass, AlertTriangle, LogOut } from "lucide-react";
import { AdventureConfig, AdventureScene, GameState } from "./types";
import { LoginPanel } from "./components/LoginPanel";
import { SetupPanel } from "./components/SetupPanel";
import { GameScreen } from "./components/GameScreen";
import { SidebarTracker } from "./components/SidebarTracker";

export default function App() {
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "anonymous">("checking");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [config, setConfig] = useState<AdventureConfig | null>(null);
  const [scenes, setScenes] = useState<AdventureScene[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    inventory: [],
    currentQuest: "",
    characterStatus: { health: 100, statusMessage: "Prepared" },
    history: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [errorString, setErrorString] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status");
        const data = await response.json();
        setAuthStatus(data.authenticated ? "authenticated" : "anonymous");
      } catch {
        setAuthStatus("anonymous");
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (pin: string) => {
    setIsAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin })
      });

      if (!response.ok) {
        throw new Error(response.status === 429 ? "Too many attempts. Please wait and try again." : "Invalid PIN.");
      }

      setAuthStatus("authenticated");
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message || "Unable to unlock the engine.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    handleRestart();
    setAuthStatus("anonymous");
  };

  // Core triggers: Initialize new adventure session
  const handleStartAdventure = async (setupConfig: AdventureConfig) => {
    setIsLoading(true);
    setErrorString(null);

    try {
      const response = await fetch("/api/adventure/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: setupConfig })
      });

      if (response.status === 401) {
        setAuthStatus("anonymous");
        throw new Error("Session expired. Enter the PIN again.");
      }

      if (!response.ok) {
        throw new Error(`Outpost is offline. Server error code: ${response.status}`);
      }

      const initialScene: AdventureScene = await response.json();

      // Synthesize initial states based on scene updates
      const startingInventory: string[] = [];
      if (initialScene.inventoryChanges) {
        initialScene.inventoryChanges.forEach(change => {
          if (change.action === 'add') {
            startingInventory.push(change.item);
          }
        });
      }

      setScenes([initialScene]);
      setGameState({
        inventory: startingInventory,
        currentQuest: initialScene.questUpdate.currentQuest,
        characterStatus: initialScene.characterStatus,
        history: [
          {
            choiceSelected: "Inception Voyage",
            sceneDescription: initialScene.description
          }
        ]
      });
      setConfig(setupConfig);
    } catch (err: any) {
      console.error("Failed to boot adventure arc:", err);
      setErrorString(err.message || "An unexpected anomaly occurred engaging the AI story modules.");
    } finally {
      setIsLoading(false);
    }
  };

  // Core loops: Advance adventure based on selected path (choices or custom typed text)
  const handleSelectChoice = async (choiceText: string) => {
    if (!config) return;
    setIsLoadingNext(true);
    setErrorString(null);

    // Build immediate snapshot before posting
    const payload = {
      config,
      state: gameState,
      choiceSelected: choiceText
    };

    try {
      const response = await fetch("/api/adventure/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        setAuthStatus("anonymous");
        throw new Error("Session expired. Enter the PIN again.");
      }

      if (!response.ok) {
        throw new Error(`The weave of destiny failed. Status ${response.status}`);
      }

      const nextScene: AdventureScene = await response.json();

      // Process inventory adjustments in narrative state
      const currentInv = [...gameState.inventory];
      if (nextScene.inventoryChanges) {
        nextScene.inventoryChanges.forEach(change => {
          if (change.action === 'add') {
            // Avoid duplicate inventory items of identical string keys
            if (!currentInv.includes(change.item)) {
              currentInv.push(change.item);
            }
          } else if (change.action === 'remove') {
            const index = currentInv.indexOf(change.item);
            if (index > -1) {
              currentInv.splice(index, 1);
            }
          }
        });
      }

      // Update game stats and scenes stack
      setScenes(prev => [...prev, nextScene]);
      setGameState(prevState => ({
        inventory: currentInv,
        currentQuest: nextScene.questUpdate.currentQuest,
        characterStatus: nextScene.characterStatus,
        history: [
          ...prevState.history,
          {
            choiceSelected: choiceText,
            sceneDescription: nextScene.description
          }
        ]
      }));
    } catch (err: any) {
      console.error("Adventure next transition failed:", err);
      setErrorString(err.message || "Destiny split failed. Model communication error.");
    } finally {
      setIsLoadingNext(false);
    }
  };

  // Return back to configuration menu
  const handleRestart = () => {
    setConfig(null);
    setScenes([]);
    setGameState({
      inventory: [],
      currentQuest: "",
      characterStatus: { health: 100, statusMessage: "Prepared" },
      history: []
    });
    setErrorString(null);
  };

  const activeScene = scenes[scenes.length - 1];

  if (authStatus === "checking") {
    return (
      <div className="min-h-screen bg-immersive-bg text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
          <div className="w-10 h-10 border-4 border-white/5 border-t-immersive-accent rounded-full animate-spin" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-immersive-accent font-extrabold animate-pulse">
            Checking secure gate...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-immersive-bg text-slate-100 flex flex-col font-sans transition-all selection:bg-immersive-accent selection:text-immersive-bg">
      {/* Top Banner Navigation */}
      <nav id="header-nav" className="border-b border-white/5 bg-immersive-panel/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/[0.03] border border-white/10 rounded-xl">
              <Compass className="w-5 h-5 text-immersive-accent" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-sm sm:text-base uppercase tracking-wider">
                Adventure Forge
              </span>
              <span className="mx-2 text-white/10 text-xs">|</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-immersive-accent font-bold hidden sm:inline">
                Saga Engine V2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authStatus === "authenticated" && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-[10px] font-mono tracking-wider text-slate-400 hover:text-rose-300 uppercase font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Lock
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {authStatus === "anonymous" ? (
          <LoginPanel onLogin={handleLogin} isLoading={isAuthLoading} error={authError} />
        ) : (
          <>
        {/* Error notification banner if any API failed */}
        {errorString && (
          <div className="bg-rose-950/20 border border-rose-500/30 text-rose-300 px-5 py-4 rounded-2xl mb-6 text-xs flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-450 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold uppercase tracking-wider text-rose-250">System Link Anomaly</h4>
              <p className="mt-1 leading-relaxed opacity-95">{errorString}</p>
              <p className="mt-2 text-[10px] opacity-75">
                Ensure that your GEMINI_API_KEY is configured correctly under Settings &gt; Secrets, and try checking your internet connection.
              </p>
            </div>
          </div>
        )}

        {!config ? (
          /* Character creation setup view */
          <SetupPanel onStart={handleStartAdventure} isLoading={isLoading} />
        ) : activeScene ? (
          /* Live Campaign Interface viewport */
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Playable Stage Area */}
            <GameScreen 
              scene={activeScene}
              config={config}
              onSelectChoice={handleSelectChoice}
              isLoadingNext={isLoadingNext}
              onRestart={handleRestart}
            />

            {/* Live Inventory & Progress Tracker */}
            <SidebarTracker 
              config={config}
              state={gameState}
              activeGenreKey={config.genre}
            />
          </div>
        ) : (
          /* Staging fallback loader */
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
            <div className="w-10 h-10 border-4 border-white/5 border-t-immersive-accent rounded-full animate-spin" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-immersive-accent font-extrabold animate-pulse">Unpacking narrative portals...</span>
          </div>
        )}
          </>
        )}
      </main>

      {/* Sleek Footprint */}
      <footer className="border-t border-white/5 bg-immersive-panel/10 py-5 text-center text-[10px] text-slate-600 font-mono mt-12 uppercase tracking-widest">
        <p>© 2026 ADVENTURE ENGINE INC. • FULLY MULTIMODAL GEMINI ARCHITECTURE • IMMERSIVE DESIGN THEME</p>
      </footer>
    </div>
  );
}
