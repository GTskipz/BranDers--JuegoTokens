import "./FloatingTokens.scss";

import {
  floatingTokenAssetIds,
  tokenAssets,
} from "../../assets/tokens/tokenAssets";

import { FLOATING_TOKEN_LAYOUTS } from "./floatingLayouts";
import type {
  FloatingTokenLayout,
  FloatingTokensState,
} from "./types";

type FloatingTokensProps = {
  state: FloatingTokensState;
};

type FloatingTokensSafeZone = {
  minimumX: number;
  maximumX: number;
  minimumY: number;
  maximumY: number;
  minimumTokenDistance: number;
  leftCandidates: readonly FloatingTokenPosition[];
  rightCandidates: readonly FloatingTokenPosition[];
};

type FloatingTokenPosition = {
  x: number;
  y: number;
};

const CENTRAL_SAFE_ZONES: Partial<
  Record<FloatingTokensState, FloatingTokensSafeZone>
> = {
  home: {
    minimumX: 16,
    maximumX: 84,
    minimumY: 14,
    maximumY: 49,
    minimumTokenDistance: 14,
    leftCandidates: [
      { x: 10, y: 3.5 },
      { x: 28, y: 11.5 },
      { x: 7, y: 27 },
      { x: 14, y: 41 },
    ],
    rightCandidates: [
      { x: 67, y: 3.5 },
      { x: 86, y: 14.5 },
      { x: 90, y: 32 },
      { x: 91, y: 43 },
    ],
  },
  prize: {
    minimumX: 18,
    maximumX: 82,
    minimumY: 0,
    maximumY: 78,
    minimumTokenDistance: 10,
    leftCandidates: [
      { x: 10, y: 4 },
      { x: 11, y: 13 },
      { x: 7, y: 28.5 },
      { x: 8, y: 42 },
    ],
    rightCandidates: [
      { x: 89, y: 3 },
      { x: 94, y: 14.5 },
      { x: 98, y: 30 },
      { x: 95, y: 43 },
    ],
  },
};

function isInsideSafeZone(
  token: FloatingTokenLayout,
  safeZone: FloatingTokensSafeZone,
): boolean {
  return (
    token.opacity > 0 &&
    token.x >= safeZone.minimumX &&
    token.x <= safeZone.maximumX &&
    token.y >= safeZone.minimumY &&
    token.y <= safeZone.maximumY
  );
}

function keepTokenOutsideSafeZone(
  token: FloatingTokenLayout,
  safeZone: FloatingTokensSafeZone,
): FloatingTokenLayout {
  if (!isInsideSafeZone(token, safeZone)) {
    return token;
  }

  const leftDistance = Math.abs(token.x - safeZone.minimumX);
  const rightDistance = Math.abs(safeZone.maximumX - token.x);
  const nextX =
    leftDistance <= rightDistance
      ? safeZone.minimumX - token.width * 0.65
      : safeZone.maximumX + token.width * 0.65;

  return {
    ...token,
    x: Math.max(4, Math.min(96, nextX)),
  };
}

function getTokenDistance(
  firstToken: FloatingTokenLayout,
  secondToken: FloatingTokenLayout,
): number {
  const horizontalDistance =
    firstToken.x - secondToken.x;
  const verticalDistance =
    firstToken.y - secondToken.y;

  return Math.hypot(
    horizontalDistance,
    verticalDistance,
  );
}

function isTooCloseToPlacedToken(
  token: FloatingTokenLayout,
  placedTokens: FloatingTokenLayout[],
  minimumDistance: number,
): boolean {
  if (token.opacity <= 0) {
    return false;
  }

  return placedTokens.some(
    (placedToken) =>
      placedToken.opacity > 0 &&
      getTokenDistance(token, placedToken) <
        minimumDistance,
  );
}

function getCandidateToken(
  token: FloatingTokenLayout,
  candidates: readonly FloatingTokenPosition[],
  candidateIndex: number,
): FloatingTokenLayout {
  const candidate =
    candidates[
      candidateIndex % candidates.length
    ];

  return {
    ...token,
    x: candidate.x,
    y: candidate.y,
  };
}

function findTokenPosition(
  token: FloatingTokenLayout,
  placedTokens: FloatingTokenLayout[],
  safeZone: FloatingTokensSafeZone,
): FloatingTokenLayout {
  const tokenOutsideSafeZone =
    keepTokenOutsideSafeZone(token, safeZone);

  if (
    !isInsideSafeZone(tokenOutsideSafeZone, safeZone) &&
    !isTooCloseToPlacedToken(
      tokenOutsideSafeZone,
      placedTokens,
      safeZone.minimumTokenDistance,
    )
  ) {
    return tokenOutsideSafeZone;
  }

  const firstCandidateIndex =
    token.id + token.imageIndex;
  const candidates =
    token.x < 50
      ? safeZone.leftCandidates
      : safeZone.rightCandidates;

  for (
    let offset = 0;
    offset < candidates.length;
    offset += 1
  ) {
    const candidateToken = getCandidateToken(
      token,
      candidates,
      firstCandidateIndex + offset,
    );

    if (
      !isInsideSafeZone(candidateToken, safeZone) &&
      !isTooCloseToPlacedToken(
        candidateToken,
        placedTokens,
        safeZone.minimumTokenDistance,
      )
    ) {
      return candidateToken;
    }
  }

  return tokenOutsideSafeZone;
}

function getSafeLayout(
  layout: FloatingTokenLayout[],
  safeZone: FloatingTokensSafeZone | undefined,
): FloatingTokenLayout[] {
  if (!safeZone) {
    return layout;
  }

  const placedTokens: FloatingTokenLayout[] = [];

  return layout.map((token) => {
    const safeToken = findTokenPosition(
      token,
      placedTokens,
      safeZone,
    );

    placedTokens.push(safeToken);

    return safeToken;
  });
}

export function FloatingTokens({
  state,
}: FloatingTokensProps) {
  const safeZone = CENTRAL_SAFE_ZONES[state];
  const layout = getSafeLayout(
    FLOATING_TOKEN_LAYOUTS[state],
    safeZone,
  );

  return (
    <div
      className="floating-tokens-layer"
      aria-hidden="true"
    >
      {layout.map((token) => (
        <img
          key={token.id}
          className="floating-token"
          src={
            tokenAssets[
              floatingTokenAssetIds[token.imageIndex]
            ]
          }
          alt=""
          draggable={false}
          style={{
            left: `${token.x}%`,
            top: `${token.y}%`,
            width: `${token.width}%`,
            opacity: token.opacity,
            transform: `translate(-50%, -50%) rotate(${token.rotation}deg) scale(${token.scale})`,
            transitionDelay: `${token.floatDelay}ms`,
          }}
        />
      ))}
    </div>
  );
}
