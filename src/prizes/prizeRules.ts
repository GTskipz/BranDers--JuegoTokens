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
