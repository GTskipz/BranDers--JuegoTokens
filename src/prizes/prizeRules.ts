import iceCoffeeImage from "../assets/prizes/premio_ice_coffe_500x500.png";
import sundaeImage from "../assets/prizes/premio_sundae_500x500.png";
import iceCoffeeQrImage from "../assets/qr/qr-ice-coffee.png";
import sundaeQrImage from "../assets/qr/qr-sundae.png";

export type PrizeDefinition = {
  id: string;
  name: string;
  image: string;
  qrImage: string;
  minimumScore: number;
};

export const PRIZE_RULES: PrizeDefinition[] = [
  {
    id: "sundae",
    name: "Sundae",
    image: sundaeImage,
    qrImage: sundaeQrImage,
    minimumScore: 0,
  },
  {
    id: "ice-coffee",
    name: "Ice Coffee",
    image: iceCoffeeImage,
    qrImage: iceCoffeeQrImage,
    minimumScore: 2000,
  },
];

let prizeImagePreloadPromise: Promise<void> | null = null;

export function preloadPrizeImages(): Promise<void> {
  if (prizeImagePreloadPromise) {
    return prizeImagePreloadPromise;
  }

  if (typeof Image === "undefined") {
    prizeImagePreloadPromise = Promise.resolve();
    return prizeImagePreloadPromise;
  }

  prizeImagePreloadPromise = Promise.all(
    PRIZE_RULES.map(
      (prize) =>
        new Promise<void>((resolve) => {
          const image = new Image();

          image.onload = () => {
            resolve();
          };

          image.onerror = () => {
            resolve();
          };

          image.src = prize.image;
        }),
    ),
  ).then(() => {});

  return prizeImagePreloadPromise;
}

export function getPrizeForScore(
  score: number,
): PrizeDefinition {
  return PRIZE_RULES.reduce((selectedPrize, prize) => {
    if (
      score >= prize.minimumScore &&
      prize.minimumScore >= selectedPrize.minimumScore
    ) {
      return prize;
    }

    return selectedPrize;
  }, PRIZE_RULES[0]);
}
