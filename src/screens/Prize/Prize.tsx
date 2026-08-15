import {
  GAME_SOUND_IDS,
  gameSoundController,
} from "../../audio/gameSoundController";
import { getPrizeForScore } from "../../prizes/prizeRules";

import "./Prize.scss";

type PrizeProps = {
  score: number;
  isEntering: boolean;
  onRedeem: () => void;
};

export function Prize({
  score,
  isEntering,
  onRedeem,
}: PrizeProps) {
  const screenClassName = isEntering
    ? "prize-screen prize-screen--entering"
    : "prize-screen prize-screen--active";

  const prize = getPrizeForScore(score);

  function handleRedeem() {
    gameSoundController.play(GAME_SOUND_IDS.buttonPress);
    onRedeem();
  }

  return (
    <section className={screenClassName}>
      <h1 className="prize-title">
        ¡Felicidades ganaste!
      </h1>

      <div className="prize-image-frame">
        <img
          className="prize-image"
          src={prize.image}
          alt={prize.name}
          draggable={false}
        />
      </div>

      <div className="prize-name">
        {prize.name}
      </div>

      <button
        className="prize-redeem-button"
        type="button"
        onClick={handleRedeem}
        disabled={isEntering}
      >
        Canjea tu premio
      </button>
    </section>
  );
}
