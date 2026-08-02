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

  return (
    <section className={screenClassName}>
      <div className="instructions-card">
        <div className="instructions-card-content">
          <p>
            Atrapa la mayor cantidad de tokens tocándolos en la pantalla antes
            de que se acabe el tiempo.
          </p>

          <p>
            Acumula puntos, supera cada nivel y demuestra qué tan rápido eres.
          </p>
        </div>
      </div>

      <button
        className="instructions-play-button"
        type="button"
        onClick={onStartGame}
        disabled={isEntering}
      >
        Jugar
      </button>
    </section>
  );
}