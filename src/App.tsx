import { useEffect, useState } from "react";
import { Compass, AlertTriangle, LogOut, ShieldCheck, X, RefreshCw } from "lucide-react";
import { AdventureConfig, AdventureScene, GameState } from "./types";
import { LoginPanel } from "./components/LoginPanel";
import { SetupPanel } from "./components/SetupPanel";
import { GameScreen } from "./components/GameScreen";
import { SidebarTracker } from "./components/SidebarTracker";

export default function App() {
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "anonymous">("checking");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; name: string; picture: string } | null>(null);
  
  // Access Logs modal state
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

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

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/status");
      const data = await response.json();
      setAuthStatus(data.authenticated ? "authenticated" : "anonymous");
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setAuthStatus("anonymous");
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const response = await fetch("/api/auth/google/url");
      if (!response.ok) throw new Error("Failed to initialize Google authentication URL");
      const { url } = await response.json();
      
      const width = 500;
      const height = 620;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        url,
        "google_login_popup",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
      );
      
      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for active sign-in.");
      }
      
      const handleMessage = (event: MessageEvent) => {
        const origin = event.origin;
        if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
          return;
        }
        
        if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
          window.removeEventListener("message", handleMessage);
          setAuthStatus("authenticated");
          if (event.data.user) {
            setUser(event.data.user);
          } else {
            checkAuth();
          }
          setIsAuthLoading(false);
        }
      };
      
      window.addEventListener("message", handleMessage);
    } catch (err: any) {
      setAuthError(err.message || "Failed to engage Google Authentication.");
      setIsAuthLoading(false);
    }
  };

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

      await checkAuth();
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
    setUser(null);
  };

  const fetchLoginLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await fetch("/api/admin/logins");
      if (response.ok) {
        const data = await response.json();
        setLoginLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
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

          <div className="flex items-center gap-4">
            {authStatus === "authenticated" && (
              <>
                {user && (
                  <div className="flex items-center gap-3 border-r border-white/5 pr-4 hidden md:flex">
                    {user.picture ? (
                      <img 
                        src={user.picture} 
                        alt={user.name} 
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full border border-immersive-accent/30"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-immersive-accent/10 border border-immersive-accent/30 flex items-center justify-center text-[10px] font-bold text-immersive-accent uppercase">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col text-[10px]">
                      <span className="font-bold text-white leading-none">{user.name}</span>
                      <span className="text-slate-500 leading-none mt-1 font-mono">{user.email}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowLogsModal(true);
                    fetchLoginLogs();
                  }}
                  className="text-[10px] font-mono tracking-wider text-slate-400 hover:text-immersive-accent uppercase font-bold flex items-center gap-1.5 transition-colors border border-white/5 bg-white/[0.02] px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  Access Logs
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[10px] font-mono tracking-wider text-slate-400 hover:text-rose-300 uppercase font-bold flex items-center gap-1.5 transition-colors border border-white/5 bg-white/[0.02] px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  Lock
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {authStatus === "anonymous" ? (
          <LoginPanel 
            onLogin={handleLogin} 
            onGoogleLogin={handleGoogleLogin} 
            isLoading={isAuthLoading} 
            error={authError} 
          />
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

      {/* Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-immersive-panel border border-immersive-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-immersive-accent" />
                <div>
                  <h3 className="font-extrabold text-white uppercase tracking-wider text-sm">Gate Security Log</h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">Real-time gate access & authentication telemetry</p>
                </div>
              </div>
              
              <div id="logs-controls" className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchLoginLogs}
                  disabled={isLoadingLogs}
                  className="p-2 bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] text-slate-400 hover:text-white rounded-lg border border-immersive-border transition-colors cursor-pointer"
                  title="Reload Logs"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogsModal(false)}
                  className="p-2 bg-white/[0.03] hover:bg-rose-950/40 text-slate-400 text-slate-400 hover:text-rose-400 rounded-lg border border-immersive-border transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingLogs ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                  <div className="w-6 h-6 border-2 border-white/5 border-t-immersive-accent rounded-full animate-spin" />
                  <span className="font-mono text-[9px] tracking-widest uppercase text-immersive-accent">Querying security systems...</span>
                </div>
              ) : loginLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  No login events recorded on this device yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 uppercase text-[9px] tracking-wider text-left">
                        <th className="pb-3 border-b border-white/5">Time</th>
                        <th className="pb-3 border-b border-white/5">Method</th>
                        <th className="pb-3 border-b border-white/5">identity</th>
                        <th className="pb-3 border-b border-white/5">Status</th>
                        <th className="pb-3 border-b border-white/5 text-right">IPv4</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {loginLogs.map((log, index) => {
                        const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date(log.timestamp).toLocaleDateString([], { month: '2-digit', day: '2-digit' });
                        return (
                          <tr key={index} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 text-slate-400 pr-2 whitespace-nowrap">{dateStr}</td>
                            <td className="py-3 pr-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border whitespace-nowrap ${
                                log.method.includes('Google') 
                                  ? 'bg-blue-950/30 text-blue-350 border-blue-500/25' 
                                  : 'bg-amber-950/30 text-amber-300 border-amber-500/25'
                              }`}>
                                {log.method}
                              </span>
                            </td>
                            <td className="py-3 text-white pr-4 font-sans select-all font-medium truncate max-w-[150px]" title={log.email}>
                              {log.email}
                            </td>
                            <td className="py-3 pr-2">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide border ${
                                log.success 
                                  ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/25' 
                                  : 'bg-rose-950/30 text-rose-300 border-rose-500/25'
                              }`}>
                                {log.success ? 'GRANTED' : 'DENIED'}
                              </span>
                            </td>
                            <td className="py-3 text-slate-400 pl-2 text-right select-all whitespace-nowrap">{log.ip}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center text-[10px] text-slate-500 font-mono">
              🛡️ GATE ACCESS GRANTED TO VERIFIED SYSTEM OPERATORS ONLY • DATA PERSISTED TO DISK
            </div>
          </div>
        </div>
      )}

      {/* Sleek Footprint */}
      <footer className="border-t border-white/5 bg-immersive-panel/10 py-5 text-center text-[10px] text-slate-600 font-mono mt-12 uppercase tracking-widest">
        <p>© 2026 ADVENTURE ENGINE INC. • FULLY MULTIMODAL GEMINI ARCHITECTURE • IMMERSIVE DESIGN THEME</p>
      </footer>
    </div>
  );
}
