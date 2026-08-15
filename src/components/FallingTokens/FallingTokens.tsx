import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  CSSProperties,
  PointerEvent,
} from "react";

import tokenSpinSprite from "../../assets/tokens/token-spin-cycle-sprite.webp";
import {
  GAME_SOUND_IDS,
  gameSoundController,
} from "../../audio/gameSoundController";

import "./FallingTokens.scss";

type FallingTokensProps = {
  isRunning: boolean;
  elapsedTime: number;
  spawnInterval: number;
  maxTokens: number;
  minimumFallDuration: number;
  maximumFallDuration: number;
  onCatch: (points: number) => void;
};

type FallingToken = {
  id: number;
  x: number;
  size: number;
  points: number;
  isSpecial: boolean;
  fallDuration: number;
  spinDuration: number;
  isCaught: boolean;
};

type TokenStyle = CSSProperties & {
  "--token-x": string;
  "--token-size": string;
  "--fall-duration": string;
  "--spin-duration": string;
};

const TOKEN_VALUES = [25, 50, 75] as const;
const SPECIAL_TOKEN_POINTS = 300;
const SPECIAL_TOKEN_APPEAR_AT = 15;
const CATCH_ANIMATION_DURATION = 650;

function randomBetween(
  minimum: number,
  maximum: number,
): number {
  return Math.random() * (maximum - minimum) + minimum;
}

function getRandomTokenValue(): number {
  const valueIndex = Math.floor(
    Math.random() * TOKEN_VALUES.length,
  );

  return TOKEN_VALUES[valueIndex];
}

function createToken(
  id: number,
  minimumFallDuration: number,
  maximumFallDuration: number,
): FallingToken {
  return {
    id,
    x: randomBetween(3, 84),
    size: randomBetween(11, 18),
    points: getRandomTokenValue(),
    isSpecial: false,

    fallDuration: randomBetween(
      minimumFallDuration,
      maximumFallDuration,
    ),

    spinDuration: randomBetween(2.7, 4.1),

    isCaught: false,
  };
}

function createSpecialToken(
  id: number,
  maximumFallDuration: number,
): FallingToken {
  return {
    id,
    x: randomBetween(8, 78),
    size: randomBetween(11, 18) * 1.25,
    points: SPECIAL_TOKEN_POINTS,
    isSpecial: true,
    fallDuration: maximumFallDuration * 1.15,
    spinDuration: randomBetween(2.7, 4.1),
    isCaught: false,
  };
}

export function FallingTokens({
  isRunning,
  elapsedTime,
  spawnInterval,
  maxTokens,
  minimumFallDuration,
  maximumFallDuration,
  onCatch,
}: FallingTokensProps) {
  const [tokens, setTokens] = useState<FallingToken[]>([]);

  const nextTokenId = useRef(0);
  const removalTimers = useRef<number[]>([]);
  const hasSpawnedSpecialToken = useRef(false);

  function removeToken(id: number) {
    setTokens((currentTokens) =>
      currentTokens.filter((token) => token.id !== id),
    );
  }

  function catchToken(
    event: PointerEvent<HTMLButtonElement>,
    token: FallingToken,
  ) {
    event.preventDefault();

    if (!isRunning || token.isCaught) {
      return;
    }

    gameSoundController.play(GAME_SOUND_IDS.tokenCatch);

    onCatch(token.points);

    setTokens((currentTokens) =>
      currentTokens.map((currentToken) =>
        currentToken.id === token.id
          ? {
              ...currentToken,
              isCaught: true,
            }
          : currentToken,
      ),
    );

    const removalTimer = window.setTimeout(() => {
      removeToken(token.id);
    }, CATCH_ANIMATION_DURATION);

    removalTimers.current.push(removalTimer);
  }

  useEffect(() => {
    if (!isRunning) {
      setTokens([]);
      hasSpawnedSpecialToken.current = false;
      return;
    }

    function spawnToken() {
      setTokens((currentTokens) => {
        const activeTokens = currentTokens.filter(
          (token) => !token.isCaught,
        );

        if (activeTokens.length >= maxTokens) {
          return currentTokens;
        }

        const newToken = createToken(
          nextTokenId.current,
          minimumFallDuration,
          maximumFallDuration,
        );

        nextTokenId.current += 1;

        return [...currentTokens, newToken];
      });
    }

    spawnToken();

    const spawnTimer = window.setInterval(
      spawnToken,
      spawnInterval,
    );

    return () => {
      window.clearInterval(spawnTimer);
    };
  }, [
    isRunning,
    spawnInterval,
    maxTokens,
    minimumFallDuration,
    maximumFallDuration,
  ]);

  useEffect(() => {
    if (
      !isRunning ||
      hasSpawnedSpecialToken.current ||
      elapsedTime < SPECIAL_TOKEN_APPEAR_AT
    ) {
      return;
    }

    hasSpawnedSpecialToken.current = true;
    gameSoundController.play(
      GAME_SOUND_IDS.specialTokenAppear,
    );

    setTokens((currentTokens) => {
      const specialToken = createSpecialToken(
        nextTokenId.current,
        maximumFallDuration,
      );

      nextTokenId.current += 1;

      return [...currentTokens, specialToken];
    });
  }, [isRunning, elapsedTime, maximumFallDuration]);

  useEffect(() => {
    return () => {
      removalTimers.current.forEach((timer) => {
        window.clearTimeout(timer);
      });

      removalTimers.current = [];
    };
  }, []);

  return (
    <div
      className={`falling-tokens-layer ${
        isRunning
          ? "falling-tokens-layer--running"
          : ""
      }`}
      aria-hidden={!isRunning}
    >
      {tokens.map((token) => {
        const tokenStyle: TokenStyle = {
          "--token-x": `${token.x}%`,
          "--token-size": `${token.size}%`,
          "--fall-duration": `${token.fallDuration}s`,
          "--spin-duration": `${token.spinDuration}s`,
        };

        const tokenClassName = [
          "falling-token",
          token.isSpecial ? "falling-token--special" : "",
          token.isCaught ? "falling-token--caught" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={token.id}
            className={tokenClassName}
            type="button"
            style={tokenStyle}
            disabled={token.isCaught}
            aria-label={`Token de ${token.points} puntos`}
            onPointerDown={(event) => {
              catchToken(event, token);
            }}
            onAnimationEnd={(event) => {
              if (
                !token.isCaught &&
                event.animationName === "token-fall"
              ) {
                removeToken(token.id);
              }
            }}
          >
            <span
              className="falling-token__sprite"
              style={{
                backgroundImage: `url(${tokenSpinSprite})`,
              }}
            />

            <span className="falling-token__flash" />

            <span className="falling-token__particles">
              <span className="falling-token__particle falling-token__particle--1" />
              <span className="falling-token__particle falling-token__particle--2" />
              <span className="falling-token__particle falling-token__particle--3" />
              <span className="falling-token__particle falling-token__particle--4" />
              <span className="falling-token__particle falling-token__particle--5" />
              <span className="falling-token__particle falling-token__particle--6" />
            </span>

            <span className="falling-token__feedback">
              +{token.points}
            </span>
          </button>
        );
      })}
    </div>
  );
}
