import {
  GAME_SOUND_IDS,
  gameSoundController,
} from "../../audio/gameSoundController";

import "./SurprisePrize.scss";

type SurprisePrizeProps = {
  isEntering: boolean;
  onRestart: () => void;
};

export function SurprisePrize({
  isEntering,
  onRestart,
}: SurprisePrizeProps) {
  const screenClassName = isEntering
    ? "surprise-prize-screen surprise-prize-screen--entering"
    : "surprise-prize-screen surprise-prize-screen--active";

  function handleRestart() {
    gameSoundController.play(GAME_SOUND_IDS.buttonPress);
    onRestart();
  }

  return (
    <section className={screenClassName}>
      <div className="surprise-prize-content">
        <h1 className="surprise-prize-title">
          ¡Felicidades!
          <br />
          ganaste
        </h1>

        <div className="surprise-prize-label">
          Premio sorpresa
        </div>

        <button
          className="surprise-prize-restart-button"
          type="button"
          onClick={handleRestart}
          disabled={isEntering}
        >
          Reiniciar
        </button>
      </div>
    </section>
  );
}
