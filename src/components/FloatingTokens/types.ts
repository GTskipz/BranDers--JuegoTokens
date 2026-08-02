export type FloatingTokensState =
  | "hidden"
  | "home"
  | "instructions"
  | "game"
  | "score"
  | "prize";

export type FloatingTokenLayout = {
  id: number;
  imageIndex: number;

  x: number;
  y: number;

  width: number;
  rotation: number;

  opacity: number;
  scale: number;

  floatDelay: number;
};