import "./Prize.scss";

type PrizeProps = {
  prizeName: string;
  prizeImage?: string;
  isEntering: boolean;
  onRedeem: () => void;
};

export function Prize({
  prizeName,
  prizeImage,
  isEntering,
  onRedeem,
}: PrizeProps) {
  const screenClassName = isEntering
    ? "prize-screen prize-screen--entering"
    : "prize-screen prize-screen--active";

  return (
    <section className={screenClassName}>
      <h1 className="prize-title">
        Felicidades
        <br />
        te ganaste
      </h1>

      <div className="prize-image-frame">
        {prizeImage ? (
          <img
            className="prize-image"
            src={prizeImage}
            alt={prizeName}
            draggable={false}
          />
        ) : (
          <div className="prize-image-placeholder">
            Imagen del premio
          </div>
        )}
      </div>

      <div className="prize-name">
        {prizeName}
      </div>

      <button
        className="prize-redeem-button"
        type="button"
        onClick={onRedeem}
        disabled={isEntering}
      >
        Canjea tu premio
      </button>
    </section>
  );
}