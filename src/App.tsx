import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { FloatingTokens } from "./components/FloatingTokens/FloatingTokens";
import type { FloatingTokensState } from "./components/FloatingTokens/types";
import { Logo } from "./components/Logo/Logo";
import { PileTokens } from "./components/PileTokens/PileTokens";
import type { PileTokensState } from "./components/PileTokens/types";
import {
  WaveTransition,
  type WaveState,
} from "./components/WaveTransition/WaveTransition";
import {
  GAME_SOUND_IDS,
  gameSoundController,
} from "./audio/gameSoundController";
import { Game } from "./screens/Game/Game";
import { HomeScreen } from "./screens/Home/HomeScreen";
import { InactiveScreen } from "./screens/Inactive/InactiveScreen";
import { Instructions } from "./screens/Instructions/Instructions";
import { Prize } from "./screens/Prize/Prize";
import { QR } from "./screens/QR/QR";
import { Score } from "./screens/Score/Score";
import { SurprisePrize } from "./screens/SurprisePrize/SurprisePrize";
import type { AdminLevelConfigs } from "./engine/useGameEngine";
import { useKioskInputGuards } from "./hooks/useKioskInputGuards";
import { preloadPrizeImages } from "./prizes/prizeRules";

const ADMIN_API = "http://localhost:3001/api";
const COUNTDOWN_TWO_DELAY = 930;
const COUNTDOWN_ONE_DELAY = 1810;
const COUNTDOWN_GO_DELAY = 2700;
const COUNTDOWN_END_DELAY = 3600;

type AdminConfig = {
  restaurantName: string;
  activationName: string;
  prizeName: string;
  prizeImageUrl: string | null;
  logoUrl: string | null;
  gameDuration: number;
  levels?: AdminLevelConfigs;
};

type TransitionPhase =
  | "home"
  | "logo-moving"
  | "waves-moving"
  | "instructions-content"
  | "instructions"
  | "game-countdown"
  | "game"
  | "score-entering"
  | "score"
  | "prize-entering"
  | "prize"
  | "surprise-entering"
  | "surprise"
  | "qr-entering"
  | "qr";

type CountdownValue = 3 | 2 | 1 | "GO" | null;
type GameMode = "qr" | "surprise";

function getInitialGameMode(): GameMode {
  if (typeof window === "undefined") {
    return "qr";
  }

  const mode = new URLSearchParams(
    window.location.search,
  ).get("mode");

  return mode === "surprise" ? "surprise" : "qr";
}

function App() {
  useKioskInputGuards();

  const [gameMode] = useState<GameMode>(
    getInitialGameMode,
  );

  const [phase, setPhase] =
    useState<TransitionPhase>("home");

  const [countdown, setCountdown] =
    useState<CountdownValue>(null);

  const [finalScore, setFinalScore] = useState(0);

  const [isAudioMuted, setIsAudioMuted] = useState(
    gameSoundController.getIsMuted(),
  );

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [config, setConfig] = useState<AdminConfig>({
    restaurantName: "BranDers",
    activationName: "",
    prizeName: "Papas medianas",
    prizeImageUrl: null,
    logoUrl: null,
    gameDuration: 30,
  });

  // 'loading' | 'active' | 'inactive'
  const [sessionStatus, setSessionStatus] =
    useState<"loading" | "active" | "inactive">("loading");

  const sessionStartRef = useRef<string | null>(null);

  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach((timer) => {
      window.clearTimeout(timer);
    });

    timers.current = [];
  }

  function addTimer(callback: () => void, delay: number) {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  }

  function showInstructions() {
    if (phase !== "home") return;

    clearTimers();
    setPhase("logo-moving");

    addTimer(() => {
      setPhase("waves-moving");
    }, 100);

    addTimer(() => {
      setPhase("instructions-content");
    }, 720);

    addTimer(() => {
      setPhase("instructions");
    }, 1080);
  }

  function startGame() {
    if (phase !== "instructions") return;

    clearTimers();

    sessionStartRef.current = new Date().toISOString();
    setFinalScore(0);
    setCountdown(3);
    setPhase("game-countdown");
    gameSoundController.pause(
      GAME_SOUND_IDS.menuBackground,
    );
    gameSoundController.play(GAME_SOUND_IDS.countdown);

    addTimer(() => {
      setCountdown(2);
    }, COUNTDOWN_TWO_DELAY);

    addTimer(() => {
      setCountdown(1);
    }, COUNTDOWN_ONE_DELAY);

    addTimer(() => {
      setCountdown("GO");
      setPhase("game");
      gameSoundController.playLoop(
        GAME_SOUND_IDS.gameBackground,
      );
    }, COUNTDOWN_GO_DELAY);

    addTimer(() => {
      setCountdown(null);
    }, COUNTDOWN_END_DELAY);
  }

  const finishGame = useCallback(
    (score: number) => {
      clearTimers();
      gameSoundController.pause(
        GAME_SOUND_IDS.gameBackground,
      );

      setFinalScore(score);
      setPhase("score-entering");

      addTimer(() => {
        setPhase("score");
      }, 80);

      // Register session in admin DB
      fetch(`${ADMIN_API}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: config.restaurantName,
          activationName: config.activationName,
          finalScore: score,
          completed: true,
          startedAt: sessionStartRef.current,
        }),
      }).catch(() => {});
    },
    [config.restaurantName, config.activationName],
  );

  function showPrize() {
    if (phase !== "score") return;

    clearTimers();
    setPhase("prize-entering");

    addTimer(() => {
      setPhase("prize");
    }, 80);
  }

  function showSurprisePrize() {
    if (phase !== "score") return;

    clearTimers();
    setPhase("surprise-entering");

    addTimer(() => {
      setPhase("surprise");
    }, 80);
  }

  function showReward() {
    if (gameMode === "surprise") {
      showSurprisePrize();
      return;
    }

    showPrize();
  }

  function showQr() {
    if (phase !== "prize") return;

    clearTimers();
    setPhase("qr-entering");

    addTimer(() => {
      setPhase("qr");
    }, 80);
  }

  function restartApp() {
    clearTimers();

    setCountdown(null);
    setFinalScore(0);
    gameSoundController.pause(
      GAME_SOUND_IDS.countdown,
    );
    gameSoundController.pause(
      GAME_SOUND_IDS.gameBackground,
    );
    setPhase("home");
  }

  useEffect(() => {
    return clearTimers;
  }, []);

  useEffect(() => {
    void preloadPrizeImages();
  }, []);

  useEffect(() => {
    return gameSoundController.subscribe(setIsAudioMuted);
  }, []);

  useEffect(() => {
    function syncFullscreenState() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    syncFullscreenState();

    document.addEventListener(
      "fullscreenchange",
      syncFullscreenState,
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        syncFullscreenState,
      );
    };
  }, []);

  // Load config from admin server on mount
  useEffect(() => {
    fetch(`${ADMIN_API}/config`)
      .then((r) => r.json())
      .then((data: AdminConfig & { sessionStatus?: string }) => {
        setConfig(data);
        // 'closed' → show inactive screen; anything else → show game
        if (data.sessionStatus === "closed") {
          setSessionStatus("inactive");
        } else {
          setSessionStatus("active");
        }
      })
      .catch(() => {
        // Admin server not running — show game normally
        setSessionStatus("active");
      });
  }, []);

  function toggleAudio() {
    gameSoundController.unlock();
    gameSoundController.toggleMuted();
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Some browser policies can reject fullscreen requests.
    }
  }

  const logoClassName =
    phase === "home"
      ? "shared-logo shared-logo--home"
      : phase === "game-countdown" || phase === "game"
        ? "shared-logo shared-logo--game"
        : phase === "score-entering" || phase === "score"
          ? "shared-logo shared-logo--score"
          : phase === "prize-entering" ||
              phase === "prize" ||
              phase === "surprise-entering" ||
              phase === "surprise" ||
              phase === "qr-entering" ||
              phase === "qr"
            ? "shared-logo shared-logo--prize"
            : "shared-logo shared-logo--instructions";

  const homeIsLeaving = phase !== "home";

  const instructionsIsMounted =
    phase === "waves-moving" ||
    phase === "instructions-content" ||
    phase === "instructions";

  const instructionsContentIsVisible =
    phase === "instructions-content" ||
    phase === "instructions";

  const gameIsMounted =
    phase === "game-countdown" ||
    phase === "game";

  const scoreIsMounted =
    phase === "score-entering" ||
    phase === "score";

  const prizeIsMounted =
    phase === "prize-entering" ||
    phase === "prize";

  const surprisePrizeIsMounted =
    phase === "surprise-entering" ||
    phase === "surprise";

  const qrIsMounted =
    phase === "qr-entering" ||
    phase === "qr";

  const showRestartButton =
    phase !== "home" &&
    phase !== "logo-moving" &&
    phase !== "waves-moving" &&
    phase !== "surprise-entering" &&
    phase !== "surprise" &&
    phase !== "qr-entering" &&
    phase !== "qr";

  const waveState: WaveState =
    phase === "home" || phase === "logo-moving"
      ? "home"
      : phase === "waves-moving"
        ? "to-instructions"
        : "instructions";

  const floatingTokensState: FloatingTokensState =
    phase === "home"
      ? "home"
      : phase === "logo-moving" || phase === "waves-moving"
        ? "hidden"
        : phase === "instructions-content" ||
            phase === "instructions"
          ? "instructions"
          : phase === "game-countdown" || phase === "game"
            ? "game"
            : phase === "score-entering" || phase === "score"
              ? "score"
              : phase === "prize-entering" ||
                  phase === "prize" ||
                  phase === "surprise-entering" ||
                  phase === "surprise" ||
                  phase === "qr-entering" ||
                  phase === "qr"
                ? "prize"
                : "hidden";

  const pileTokensState: PileTokensState =
    phase === "home"
      ? "home"
      : phase === "score-entering" || phase === "score"
        ? "score"
        : phase === "prize-entering" ||
            phase === "prize" ||
            phase === "surprise-entering" ||
            phase === "surprise" ||
            phase === "qr-entering" ||
            phase === "qr"
          ? "prize"
          : phase === "instructions-content" ||
              phase === "instructions"
            ? "instructions"
            : phase === "game-countdown" || phase === "game"
              ? "game"
              : "hidden";

  const menuMusicShouldPlay =
    sessionStatus !== "inactive" &&
    (phase === "home" ||
      phase === "logo-moving" ||
      phase === "waves-moving" ||
      phase === "instructions-content" ||
      phase === "instructions" ||
      phase === "score-entering" ||
      phase === "score" ||
      phase === "prize-entering" ||
      phase === "prize" ||
      phase === "surprise-entering" ||
      phase === "surprise" ||
      phase === "qr-entering" ||
      phase === "qr");

  useEffect(() => {
    if (menuMusicShouldPlay) {
      gameSoundController.playLoop(
        GAME_SOUND_IDS.menuBackground,
      );
    } else {
      gameSoundController.pause(
        GAME_SOUND_IDS.menuBackground,
      );
    }
  }, [menuMusicShouldPlay, phase]);

  useEffect(() => {
    return () => {
      gameSoundController.pause(
        GAME_SOUND_IDS.menuBackground,
      );
      gameSoundController.pause(
        GAME_SOUND_IDS.countdown,
      );
      gameSoundController.pause(
        GAME_SOUND_IDS.gameBackground,
      );
    };
  }, []);

  return (
    <main className="app">
      <section className="kiosk-screen">
        <WaveTransition state={waveState} />

        <FloatingTokens state={floatingTokensState} />

        <PileTokens state={pileTokensState} />

        <div className={logoClassName}>
          <Logo />
        </div>

        <button
          className="sound-toggle-button"
          type="button"
          onClick={toggleAudio}
          aria-label={
            isAudioMuted
              ? "Activar sonido"
              : "Desactivar sonido"
          }
        >
          {isAudioMuted ? "🔇" : "🔊"}
        </button>

        <button
          className="fullscreen-toggle-button"
          type="button"
          onClick={toggleFullscreen}
          aria-label={
            isFullscreen
              ? "Salir de pantalla completa"
              : "Entrar a pantalla completa"
          }
        >
          {isFullscreen ? "🗗" : "⛶"}
        </button>

        {/* Show inactive overlay when session is closed */}
        {sessionStatus === "inactive" && <InactiveScreen />}

        {/* Show game content only when session is active or loading */}
        {sessionStatus !== "inactive" && (
          <>
            {phase !== "instructions" &&
              phase !== "game-countdown" &&
              phase !== "game" &&
              phase !== "score-entering" &&
              phase !== "score" &&
              phase !== "prize-entering" &&
              phase !== "prize" &&
              phase !== "surprise-entering" &&
              phase !== "surprise" &&
              phase !== "qr-entering" &&
              phase !== "qr" && (
                <HomeScreen
                  onStart={showInstructions}
                  isLeaving={homeIsLeaving}
                />
              )}

            {instructionsIsMounted && (
              <Instructions
                onStartGame={startGame}
                isEntering={!instructionsContentIsVisible}
              />
            )}

            {gameIsMounted && (
              <Game
                countdown={countdown}
                duration={config.gameDuration}
                levels={config.levels}
                onFinish={finishGame}
              />
            )}

            {scoreIsMounted && (
              <Score
                score={finalScore}
                isEntering={phase === "score-entering"}
                onContinue={showReward}
              />
            )}

            {prizeIsMounted && (
              <Prize
                score={finalScore}
                isEntering={phase === "prize-entering"}
                onRedeem={showQr}
              />
            )}

            {surprisePrizeIsMounted && (
              <SurprisePrize
                isEntering={phase === "surprise-entering"}
                onRestart={restartApp}
              />
            )}

            {qrIsMounted && (
              <QR
                score={finalScore}
                isEntering={phase === "qr-entering"}
                onPlayAgain={restartApp}
              />
            )}

            {showRestartButton && (
              <button
                className="restart-button"
                type="button"
                onClick={restartApp}
                aria-label="Volver al inicio"
              >
                ↺ Inicio
              </button>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default App;
