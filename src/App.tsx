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
import { Game } from "./screens/Game/Game";
import { HomeScreen } from "./screens/Home/HomeScreen";
import { InactiveScreen } from "./screens/Inactive/InactiveScreen";
import { Instructions } from "./screens/Instructions/Instructions";
import { Prize } from "./screens/Prize/Prize";
import { Score } from "./screens/Score/Score";

const ADMIN_API = "http://localhost:3001/api";

type AdminConfig = {
  restaurantName: string;
  activationName: string;
  prizeName: string;
  prizeImageUrl: string | null;
  logoUrl: string | null;
  gameDuration: number;
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
  | "prize";

function App() {
  const [phase, setPhase] =
    useState<TransitionPhase>("home");

  const [countdown, setCountdown] =
    useState<number | null>(null);

  const [finalScore, setFinalScore] = useState(0);

  const [config, setConfig] = useState<AdminConfig>({
    restaurantName: "BranDers",
    activationName: "",
    prizeName: "Papas medianas",
    prizeImageUrl: null,
    logoUrl: null,
    gameDuration: 60,
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

    addTimer(() => {
      setCountdown(2);
    }, 700);

    addTimer(() => {
      setCountdown(1);
    }, 1400);

    addTimer(() => {
      setCountdown(null);
      setPhase("game");
    }, 2100);
  }

  const finishGame = useCallback(
    (score: number) => {
      clearTimers();

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

  function redeemPrize() {
    if (phase !== "prize") return;

    console.log("Canjear premio");
  }

  function restartApp() {
    clearTimers();

    setCountdown(null);
    setFinalScore(0);
    setPhase("home");
  }

  useEffect(() => {
    return clearTimers;
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

  const logoClassName =
    phase === "home"
      ? "shared-logo shared-logo--home"
      : phase === "game-countdown" || phase === "game"
        ? "shared-logo shared-logo--game"
        : phase === "score-entering" || phase === "score"
          ? "shared-logo shared-logo--score"
          : phase === "prize-entering" || phase === "prize"
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

  const showRestartButton =
    phase !== "home" &&
    phase !== "logo-moving" &&
    phase !== "waves-moving";

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
              : phase === "prize-entering" || phase === "prize"
                ? "prize"
                : "hidden";

  const pileTokensState: PileTokensState =
    phase === "home"
      ? "home"
      : phase === "score-entering" || phase === "score"
        ? "score"
        : phase === "prize-entering" || phase === "prize"
          ? "prize"
          : phase === "instructions-content" ||
              phase === "instructions"
            ? "instructions"
            : phase === "game-countdown" || phase === "game"
              ? "game"
              : "hidden";

  return (
    <main className="app">
      <section className="kiosk-screen">
        <WaveTransition state={waveState} />

        <FloatingTokens state={floatingTokensState} />

        <PileTokens state={pileTokensState} />

        <div className={logoClassName}>
          <Logo />
        </div>

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
              phase !== "prize" && (
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
                onFinish={finishGame}
              />
            )}

            {scoreIsMounted && (
              <Score
                score={finalScore}
                isEntering={phase === "score-entering"}
                onContinue={showPrize}
              />
            )}

            {prizeIsMounted && (
              <Prize
                prizeName={config.prizeName}
                prizeImage={config.prizeImageUrl ?? undefined}
                isEntering={phase === "prize-entering"}
                onRedeem={redeemPrize}
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