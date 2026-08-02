export type PileTokensState =
  | "hidden"
  | "home"
  | "instructions"
  | "game"
  | "score"
  | "prize";

export type PileTokenLayout = {
  id: number;
  imageIndex: number;

  x: number;
  y: number;

  width: number;
  rotation: number;

  opacity: number;
  scale: number;
  zIndex: number;

  transitionDelay: number;
};