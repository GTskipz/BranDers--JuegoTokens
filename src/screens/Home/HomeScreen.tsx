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

  return (
    <section className={screenClassName}>
      <div className="home-content">
        <button
          className="home-play-button"
          type="button"
          onClick={onStart}
          disabled={isLeaving}
        >
          Jugar
        </button>

        <h1 className="home-title">
          Participa y gana
        </h1>
      </div>
    </section>
  );
}