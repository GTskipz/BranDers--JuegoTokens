import { FallingTokens } from "../../components/FallingTokens/FallingTokens";
import {
  type AdminLevelConfigs,
  useGameEngine,
} from "../../engine/useGameEngine";

import "./Game.scss";

type GameProps = {
  countdown: 3 | 2 | 1 | "GO" | null;
  duration?: number;
  levels?: AdminLevelConfigs;
  onFinish: (score: number) => void;
};

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export function Game({
  countdown,
  duration = 30,
  levels,
  onFinish,
}: GameProps) {
  const engine = useGameEngine({
    isActive: countdown === null || countdown === "GO",
    duration,
    levels,
    onFinish,
  });

  return (
    <section className="game-screen">
      <header className="game-hud">
        <div className="game-time">
          <span className="game-hud-label">Tiempo</span>

          <span className="game-time-value">
            {formatTime(engine.timeLeft)}
          </span>
        </div>

        <div className="game-score">
          <span className="game-hud-label">Puntos</span>

          <span className="game-score-value">
            {String(engine.score).padStart(5, "0")}
          </span>
        </div>
      </header>

      <FallingTokens
        isRunning={engine.isRunning}
        elapsedTime={engine.elapsedTime}
        spawnInterval={engine.difficulty.spawnInterval}
        maxTokens={engine.difficulty.maxTokens}
        minimumFallDuration={
          engine.difficulty.minimumFallDuration
        }
        maximumFallDuration={
          engine.difficulty.maximumFallDuration
        }
        onCatch={engine.addPoints}
      />

      {countdown !== null && (
        <div
          key={countdown}
          className="game-countdown"
        >
          {countdown}
        </div>
      )}

      {engine.isFinished && (
        <div className="game-finished-message">
          ¡Tiempo!
        </div>
      )}
    </section>
  );
}
