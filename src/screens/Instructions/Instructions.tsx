import {
  GAME_SOUND_IDS,
  gameSoundController,
} from "../../audio/gameSoundController";

import "./Instructions.scss";

type InstructionsProps = {
  onStartGame: () => void;
  isEntering: boolean;
};

export function Instructions({
  onStartGame,
  isEntering,
}: InstructionsProps) {
  const screenClassName = isEntering
    ? "instructions-screen instructions-screen--entering"
    : "instructions-screen instructions-screen--active";

  function handleStartGame() {
    gameSoundController.play(GAME_SOUND_IDS.buttonPress);
    onStartGame();
  }

  return (
    <section className={screenClassName}>
      <div className="instructions-card">
        <div className="instructions-card-content">
          <p>
            Atrapa la mayor cantidad de monedas en la pantalla antes que se acabe el tiempo
          </p>
        </div>
      </div>

      <button
        className="instructions-play-button"
        type="button"
        onClick={handleStartGame}
        disabled={isEntering}
      >
        Jugar
      </button>
    </section>
  );
}
