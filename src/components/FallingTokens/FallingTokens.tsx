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

import "./FallingTokens.scss";

type FallingTokensProps = {
  isRunning: boolean;
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

const TOKEN_POINTS = 10;
const CATCH_ANIMATION_DURATION = 650;

function randomBetween(
  minimum: number,
  maximum: number,
): number {
  return Math.random() * (maximum - minimum) + minimum;
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

    fallDuration: randomBetween(
      minimumFallDuration,
      maximumFallDuration,
    ),

    spinDuration: randomBetween(2.7, 4.1),

    isCaught: false,
  };
}

export function FallingTokens({
  isRunning,
  spawnInterval,
  maxTokens,
  minimumFallDuration,
  maximumFallDuration,
  onCatch,
}: FallingTokensProps) {
  const [tokens, setTokens] = useState<FallingToken[]>([]);

  const nextTokenId = useRef(0);
  const removalTimers = useRef<number[]>([]);

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

    onCatch(TOKEN_POINTS);

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

        const tokenClassName = token.isCaught
          ? "falling-token falling-token--caught"
          : "falling-token";

        return (
          <button
            key={token.id}
            className={tokenClassName}
            type="button"
            style={tokenStyle}
            disabled={token.isCaught}
            aria-label="Token de 10 puntos"
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
              +10
            </span>
          </button>
        );
      })}
    </div>
  );
}