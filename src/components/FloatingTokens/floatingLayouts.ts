import type {
  FloatingTokenLayout,
  FloatingTokensState,
} from "./types";

/* =========================
   OCULTOS
========================= */

const HIDDEN_LAYOUT: FloatingTokenLayout[] = [
  {
    id: 1,
    imageIndex: 0,
    x: 8,
    y: -15,
    width: 10,
    rotation: -20,
    opacity: 0,
    scale: 0.7,
    floatDelay: 0,
  },
  {
    id: 2,
    imageIndex: 1,
    x: 68,
    y: -15,
    width: 10,
    rotation: 18,
    opacity: 0,
    scale: 0.7,
    floatDelay: 120,
  },
  {
    id: 3,
    imageIndex: 2,
    x: 22,
    y: -15,
    width: 10,
    rotation: -10,
    opacity: 0,
    scale: 0.7,
    floatDelay: 240,
  },
  {
    id: 4,
    imageIndex: 3,
    x: 82,
    y: -15,
    width: 10,
    rotation: 25,
    opacity: 0,
    scale: 0.7,
    floatDelay: 360,
  },
  {
    id: 5,
    imageIndex: 4,
    x: 6,
    y: -15,
    width: 10,
    rotation: -25,
    opacity: 0,
    scale: 0.7,
    floatDelay: 480,
  },
  {
    id: 6,
    imageIndex: 5,
    x: 84,
    y: -15,
    width: 10,
    rotation: 14,
    opacity: 0,
    scale: 0.7,
    floatDelay: 600,
  },
];

/* =========================
   HOME
========================= */

const HOME_LAYOUT: FloatingTokenLayout[] = [
  {
    id: 1,
    imageIndex: 0,
    x: 10,
    y: 3.5,
    width: 11,
    rotation: -18,
    opacity: 1,
    scale: 1,
    floatDelay: 0,
  },
  {
    id: 2,
    imageIndex: 1,
    x: 67,
    y: 3.5,
    width: 11,
    rotation: 17,
    opacity: 1,
    scale: 1,
    floatDelay: 120,
  },
  {
    id: 3,
    imageIndex: 2,
    x: 28,
    y: 11.5,
    width: 10,
    rotation: -12,
    opacity: 1,
    scale: 1,
    floatDelay: 240,
  },
  {
    id: 4,
    imageIndex: 3,
    x: 78,
    y: 14.5,
    width: 14,
    rotation: 24,
    opacity: 1,
    scale: 1,
    floatDelay: 360,
  },
  {
    id: 5,
    imageIndex: 4,
    x: 7,
    y: 27,
    width: 10,
    rotation: -24,
    opacity: 1,
    scale: 1,
    floatDelay: 480,
  },
  {
    id: 6,
    imageIndex: 5,
    x: 80,
    y: 32,
    width: 10,
    rotation: 16,
    opacity: 1,
    scale: 1,
    floatDelay: 600,
  },
];

/* =========================
   INSTRUCCIONES
========================= */

const INSTRUCTIONS_LAYOUT: FloatingTokenLayout[] = [
  {
    id: 1,
    imageIndex: 0,
    x: 76,
    y: 50,
    width: 14,
    rotation: 18,
    opacity: 1,
    scale: 1,
    floatDelay: 0,
  },
  {
    id: 2,
    imageIndex: 1,
    x: 12,
    y: 77,
    width: 17,
    rotation: -28,
    opacity: 1,
    scale: 1,
    floatDelay: 120,
  },
  {
    id: 3,
    imageIndex: 2,
    x: 25,
    y: 90,
    width: 10,
    rotation: -10,
    opacity: 0,
    scale: 0.8,
    floatDelay: 240,
  },
  {
    id: 4,
    imageIndex: 3,
    x: 75,
    y: 90,
    width: 10,
    rotation: 20,
    opacity: 0,
    scale: 0.8,
    floatDelay: 360,
  },
  {
    id: 5,
    imageIndex: 4,
    x: 5,
    y: 90,
    width: 10,
    rotation: -20,
    opacity: 0,
    scale: 0.8,
    floatDelay: 480,
  },
  {
    id: 6,
    imageIndex: 5,
    x: 90,
    y: 90,
    width: 10,
    rotation: 15,
    opacity: 0,
    scale: 0.8,
    floatDelay: 600,
  },
];

/* =========================
   JUEGO
========================= */

const GAME_LAYOUT: FloatingTokenLayout[] =
  HIDDEN_LAYOUT;

/* =========================
   SCORE
========================= */

const SCORE_LAYOUT: FloatingTokenLayout[] = [
  {
    id: 1,
    imageIndex: 0,
    x: 10,
    y: 4,
    width: 11,
    rotation: -18,
    opacity: 1,
    scale: 1,
    floatDelay: 0,
  },
  {
    id: 2,
    imageIndex: 1,
    x: 68,
    y: 3.5,
    width: 11,
    rotation: 18,
    opacity: 1,
    scale: 1,
    floatDelay: 120,
  },
  {
    id: 3,
    imageIndex: 2,
    x: 24,
    y: 12,
    width: 10,
    rotation: -12,
    opacity: 1,
    scale: 1,
    floatDelay: 240,
  },
  {
    id: 4,
    imageIndex: 3,
    x: 82,
    y: 15,
    width: 14,
    rotation: 23,
    opacity: 1,
    scale: 1,
    floatDelay: 360,
  },
  {
    id: 5,
    imageIndex: 4,
    x: 7,
    y: 28,
    width: 10,
    rotation: -24,
    opacity: 1,
    scale: 1,
    floatDelay: 480,
  },
  {
    id: 6,
    imageIndex: 5,
    x: 83,
    y: 30.5,
    width: 10,
    rotation: 16,
    opacity: 1,
    scale: 1,
    floatDelay: 600,
  },
];

/* =========================
   PREMIO
========================= */

const PRIZE_LAYOUT: FloatingTokenLayout[] = [
  {
    id: 1,
    imageIndex: 0,
    x: 10,
    y: 4,
    width: 11,
    rotation: -18,
    opacity: 1,
    scale: 1,
    floatDelay: 0,
  },
  {
    id: 2,
    imageIndex: 1,
    x: 67,
    y: 3,
    width: 11,
    rotation: 17,
    opacity: 1,
    scale: 1,
    floatDelay: 120,
  },
  {
    id: 3,
    imageIndex: 2,
    x: 20,
    y: 12,
    width: 9.5,
    rotation: -12,
    opacity: 1,
    scale: 1,
    floatDelay: 240,
  },
  {
    id: 4,
    imageIndex: 3,
    x: 82,
    y: 14.5,
    width: 14,
    rotation: 24,
    opacity: 1,
    scale: 1,
    floatDelay: 360,
  },
  {
    id: 5,
    imageIndex: 4,
    x: 7,
    y: 28.5,
    width: 10,
    rotation: -24,
    opacity: 1,
    scale: 1,
    floatDelay: 480,
  },
  {
    id: 6,
    imageIndex: 5,
    x: 83,
    y: 30,
    width: 10,
    rotation: 16,
    opacity: 1,
    scale: 1,
    floatDelay: 600,
  },
];

export const FLOATING_TOKEN_LAYOUTS: Record<
  FloatingTokensState,
  FloatingTokenLayout[]
> = {
  hidden: HIDDEN_LAYOUT,
  home: HOME_LAYOUT,
  instructions: INSTRUCTIONS_LAYOUT,
  game: GAME_LAYOUT,
  score: SCORE_LAYOUT,
  prize: PRIZE_LAYOUT,
};