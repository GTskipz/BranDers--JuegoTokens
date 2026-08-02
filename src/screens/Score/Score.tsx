import "./Score.scss";

type ScoreProps = {
  score: number;
  isEntering: boolean;
  onContinue: () => void;
};

export function Score({
  score,
  isEntering,
  onContinue,
}: ScoreProps) {
  const screenClassName = isEntering
    ? "score-screen score-screen--entering"
    : "score-screen score-screen--active";

  return (
    <section className={screenClassName}>
      <h1 className="score-title">
        Puntos
        <br />
        acumulados
      </h1>

      <output
        className="score-value"
        aria-label={`Puntaje acumulado: ${score}`}
      >
        {String(score).padStart(5, "0")}
      </output>

      <button
        className="score-prize-button"
        type="button"
        onClick={onContinue}
        disabled={isEntering}
      >
        Premio
      </button>
    </section>
  );
}