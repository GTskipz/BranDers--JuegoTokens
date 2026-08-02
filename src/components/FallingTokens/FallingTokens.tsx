import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";

import tokenFloating01 from "../../assets/tokens/floating/token-floating-01.svg";
import tokenFloating02 from "../../assets/tokens/floating/token-floating-02.svg";
import tokenFloating03 from "../../assets/tokens/floating/token-floating-03.svg";
import tokenFloating04 from "../../assets/tokens/floating/token-floating-04.svg";
import tokenFloating05 from "../../assets/tokens/floating/token-floating-05.svg";
import tokenFloating06 from "../../assets/tokens/floating/token-floating-06.svg";

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
  image: string;
  x: number;
  size: number;
  duration: number;
  rotation: number;
  points: number;
};

type TokenStyle = CSSProperties & {
  "--token-x": string;
  "--token-size": string;
  "--fall-duration": string;
  "--token-rotation": string;
};

const FLOATING_TOKEN_IMAGES = [
  tokenFloating01,
  tokenFloating02,
  tokenFloating03,
  tokenFloating04,
  tokenFloating05,
  tokenFloating06,
];

function randomBetween(
  minimum: number,
  maximum: number,
): number {
  return Math.random() * (maximum - minimum) + minimum;
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function getTokenPoints(
  duration: number,
  minimumDuration: number,
  maximumDuration: number,
): number {
  const durationRange = maximumDuration - minimumDuration;
  const fastLimit = minimumDuration + durationRange * 0.33;
  const mediumLimit = minimumDuration + durationRange * 0.66;

  if (duration <= fastLimit) {
    return 30;
  }

  if (duration <= mediumLimit) {
    return 20;
  }

  return 10;
}

function createToken(
  id: number,
  minimumFallDuration: number,
  maximumFallDuration: number,
): FallingToken {
  const duration = randomBetween(
    minimumFallDuration,
    maximumFallDuration,
  );

  return {
    id,
    image: randomItem(FLOATING_TOKEN_IMAGES),
    x: randomBetween(3, 84),
    size: randomBetween(11, 18),
    duration,
    rotation: randomBetween(-900, 900),
    points: getTokenPoints(
      duration,
      minimumFallDuration,
      maximumFallDuration,
    ),
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

    if (!isRunning) {
      return;
    }

    onCatch(token.points);
    removeToken(token.id);
  }

  useEffect(() => {
    if (!isRunning) {
      setTokens([]);
      return;
    }

    const spawnToken = () => {
      setTokens((currentTokens) => {
        if (currentTokens.length >= maxTokens) {
          return currentTokens;
        }

        const token = createToken(
          nextTokenId.current,
          minimumFallDuration,
          maximumFallDuration,
        );

        nextTokenId.current += 1;

        return [...currentTokens, token];
      });
    };

    // Genera uno inmediatamente al comenzar cada nivel.
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

  return (
    <div
      className={`falling-tokens-layer ${
        isRunning ? "falling-tokens-layer--running" : ""
      }`}
      aria-hidden={!isRunning}
    >
      {tokens.map((token) => {
        const tokenStyle: TokenStyle = {
          "--token-x": `${token.x}%`,
          "--token-size": `${token.size}%`,
          "--fall-duration": `${token.duration}s`,
          "--token-rotation": `${token.rotation}deg`,
        };

        return (
          <button
            key={token.id}
            className="falling-token"
            type="button"
            style={tokenStyle}
            onPointerDown={(event) =>
              catchToken(event, token)
            }
            onAnimationEnd={() => removeToken(token.id)}
            aria-label={`Token de ${token.points} puntos`}
          >
            <img
              src={token.image}
              alt=""
              draggable={false}
            />
          </button>
        );
      })}
    </div>
  );
}