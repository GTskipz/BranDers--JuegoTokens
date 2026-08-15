import {
  GAME_SOUND_IDS,
  gameSoundController,
} from "../../audio/gameSoundController";
import { getPrizeForScore } from "../../prizes/prizeRules";

import "./QR.scss";

type QRProps = {
  score: number;
  isEntering: boolean;
  onPlayAgain: () => void;
};

export function QR({
  score,
  isEntering,
  onPlayAgain,
}: QRProps) {
  const screenClassName = isEntering
    ? "qr-screen qr-screen--entering"
    : "qr-screen qr-screen--active";

  const prize = getPrizeForScore(score);

  function handlePlayAgain() {
    gameSoundController.play(GAME_SOUND_IDS.buttonPress);
    onPlayAgain();
  }

  return (
    <section className={screenClassName}>
      <h1 className="qr-title">
        Escanea el
        <br />
        código QR
      </h1>

      <div className="qr-code-frame">
        <img
          className="qr-code-image"
          src={prize.qrImage}
          alt={`Código QR de ${prize.name}`}
          draggable={false}
        />
      </div>

      <button
        className="qr-play-again-button"
        type="button"
        onClick={handlePlayAgain}
        disabled={isEntering}
      >
        Jugar nuevamente
      </button>
    </section>
  );
}
