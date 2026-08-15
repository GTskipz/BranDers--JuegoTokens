import {
  GAME_SOUND_IDS,
  gameSoundController,
} from "../../audio/gameSoundController";

import "./HomeScreen.scss";

type HomeScreenProps = {
  onStart: () => void;
  isLeaving: boolean;
};

export function HomeScreen({
  onStart,
  isLeaving,
}: HomeScreenProps) {
  const screenClassName = isLeaving
    ? "home-screen home-screen--leaving"
    : "home-screen";

  function handleStart() {
    gameSoundController.unlock();
    gameSoundController.play(GAME_SOUND_IDS.buttonPress);
    onStart();
  }

  return (
    <section className={screenClassName}>
      <div className="home-content">
        <button
          className="home-play-button"
          type="button"
          onClick={handleStart}
          disabled={isLeaving}
        >
          Juega
        </button>

        <h1 className="home-title">
          Participa y gana
        </h1>
      </div>
    </section>
  );
}
