import type {
  PileTokenLayout,
  PileTokensState,
} from "./types";

const createHiddenLayout = (): PileTokenLayout[] => [
  {
    id: 1,
    imageIndex: 0,
    x: 8,
    y: 112,
    width: 32,
    rotation: -10,
    opacity: 0,
    scale: 0.9,
    zIndex: 1,
    transitionDelay: 0,
  },
  {
    id: 2,
    imageIndex: 1,
    x: 0,
    y: 112,
    width: 31,
    rotation: 0,
    opacity: 0,
    scale: 0.9,
    zIndex: 3,
    transitionDelay: 60,
  },
  {
    id: 3,
    imageIndex: 4,
    x: 23,
    y: 112,
    width: 35,
    rotation: 0,
    opacity: 0,
    scale: 0.9,
    zIndex: 4,
    transitionDelay: 120,
  },
  {
    id: 4,
    imageIndex: 3,
    x: 48,
    y: 112,
    width: 37,
    rotation: 0,
    opacity: 0,
    scale: 0.9,
    zIndex: 5,
    transitionDelay: 180,
  },
  {
    id: 5,
    imageIndex: 2,
    x: 72,
    y: 112,
    width: 35,
    rotation: 0,
    opacity: 0,
    scale: 0.9,
    zIndex: 4,
    transitionDelay: 240,
  },
  {
    id: 6,
    imageIndex: 6,
    x: 100,
    y: 112,
    width: 31,
    rotation: 0,
    opacity: 0,
    scale: 0.9,
    zIndex: 2,
    transitionDelay: 300,
  },
  {
    id: 7,
    imageIndex: 5,
    x: 92,
    y: 112,
    width: 35,
    rotation: 0,
    opacity: 0,
    scale: 0.9,
    zIndex: 6,
    transitionDelay: 360,
  },
];

const HOME_LAYOUT: PileTokenLayout[] = [
  {
    // Token inclinado del fondo izquierdo.
    id: 1,
    imageIndex: 0,
    x: 9,
    y: 86.5,
    width: 33,
    rotation: -8,
    opacity: 1,
    scale: 1,
    zIndex: 1,
    transitionDelay: 0,
  },
  {
    // Fragmento que sale por el extremo izquierdo.
    id: 2,
    imageIndex: 1,
    x: 0,
    y: 96.5,
    width: 31,
    rotation: 0,
    opacity: 1,
    scale: 1,
    zIndex: 3,
    transitionDelay: 60,
  },
  {
    // Token grande frontal izquierdo.
    id: 3,
    imageIndex: 4,
    x: 22,
    y: 94.5,
    width: 36,
    rotation: 0,
    opacity: 1,
    scale: 1,
    zIndex: 4,
    transitionDelay: 120,
  },
  {
    // Token vertical del centro.
    id: 4,
    imageIndex: 3,
    x: 48,
    y: 95.5,
    width: 37,
    rotation: 0,
    opacity: 1,
    scale: 1,
    zIndex: 5,
    transitionDelay: 180,
  },
  {
    // Token frontal derecho.
    id: 5,
    imageIndex: 2,
    x: 72,
    y: 95,
    width: 36,
    rotation: 0,
    opacity: 1,
    scale: 1,
    zIndex: 4,
    transitionDelay: 240,
  },
  {
    // Fragmento del fondo derecho.
    id: 6,
    imageIndex: 6,
    x: 100,
    y: 87,
    width: 31,
    rotation: 0,
    opacity: 1,
    scale: 1,
    zIndex: 2,
    transitionDelay: 300,
  },
  {
    // Token inclinado frontal del extremo derecho.
    id: 7,
    imageIndex: 5,
    x: 91,
    y: 91.5,
    width: 36,
    rotation: 0,
    opacity: 1,
    scale: 1,
    zIndex: 6,
    transitionDelay: 360,
  },
];

const HIDDEN_LAYOUT = createHiddenLayout();

const SCORE_LAYOUT: PileTokenLayout[] = HOME_LAYOUT.map(
  (token) => ({
    ...token,
    y: token.y + 0.5,
  }),
);

const PRIZE_LAYOUT: PileTokenLayout[] = [
  {
    ...HOME_LAYOUT[0],
    x: 11,
    y: 91,
    width: 25,
  },
  {
    ...HOME_LAYOUT[1],
    x: 4,
    y: 98,
    width: 24,
  },
  {
    ...HOME_LAYOUT[2],
    x: 25,
    y: 99,
    width: 27,
  },
  {
    ...HOME_LAYOUT[3],
    x: 51,
    y: 100,
    width: 28,
  },
  {
    ...HOME_LAYOUT[4],
    x: 75,
    y: 99,
    width: 27,
  },
  {
    ...HOME_LAYOUT[5],
    x: 98,
    y: 92,
    width: 24,
  },
  {
    ...HOME_LAYOUT[6],
    x: 91,
    y: 96,
    width: 27,
  },
];

export const PILE_TOKEN_LAYOUTS: Record<
  PileTokensState,
  PileTokenLayout[]
> = {
  hidden: HIDDEN_LAYOUT,
  home: HOME_LAYOUT,
  instructions: HIDDEN_LAYOUT,
  game: HIDDEN_LAYOUT,
  score: SCORE_LAYOUT,
  prize: PRIZE_LAYOUT,
};