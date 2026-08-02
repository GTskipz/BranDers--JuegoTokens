import { useEffect, useMemo, useRef, useState } from "react";

export type GameLevel = 1 | 2 | 3;

export type DifficultyConfig = {
  level: GameLevel;
  spawnInterval: number;
  maxTokens: number;
  minimumFallDuration: number;
  maximumFallDuration: number;
};

type UseGameEngineOptions = {
  isActive: boolean;
  duration?: number;
  onFinish: (score: number) => void;
};

type GameEngine = {
  score: number;
  timeLeft: number;
  level: GameLevel;
  difficulty: DifficultyConfig;
  isRunning: boolean;
  isFinished: boolean;
  addPoints: (points: number) => void;
};

const DEFAULT_GAME_DURATION = 60;

const LEVEL_CONFIGS: Record<GameLevel, DifficultyConfig> = {
  1: {
    level: 1,
    spawnInterval: 650,
    maxTokens: 10,
    minimumFallDuration: 4.5,
    maximumFallDuration: 6.5,
  },

  2: {
    level: 2,
    spawnInterval: 470,
    maxTokens: 14,
    minimumFallDuration: 3.4,
    maximumFallDuration: 5.2,
  },

  3: {
    level: 3,
    spawnInterval: 320,
    maxTokens: 18,
    minimumFallDuration: 2.5,
    maximumFallDuration: 4.2,
  },
};

function getLevel(
  timeLeft: number,
  gameDuration: number,
): GameLevel {
  const elapsedTime = gameDuration - timeLeft;
  const firstLevelEnd = gameDuration / 3;
  const secondLevelEnd = firstLevelEnd * 2;

  if (elapsedTime < firstLevelEnd) {
    return 1;
  }

  if (elapsedTime < secondLevelEnd) {
    return 2;
  }

  return 3;
}

export function useGameEngine({
  isActive,
  duration = DEFAULT_GAME_DURATION,
  onFinish,
}: UseGameEngineOptions): GameEngine {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isFinished, setIsFinished] = useState(false);

  const scoreRef = useRef(0);
  const hasFinishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const level = useMemo(
    () => getLevel(timeLeft, duration),
    [timeLeft, duration],
  );

  const difficulty = LEVEL_CONFIGS[level];

  const isRunning =
    isActive &&
    !isFinished &&
    timeLeft > 0;

  function addPoints(points: number) {
    if (!isRunning || points <= 0) {
      return;
    }

    scoreRef.current += points;
    setScore(scoreRef.current);
  }

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((currentTime) =>
        Math.max(0, currentTime - 1),
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft !== 0 || hasFinishedRef.current) {
      return;
    }

    hasFinishedRef.current = true;
    setIsFinished(true);

    const finishTimer = window.setTimeout(() => {
      onFinishRef.current(scoreRef.current);
    }, 700);

    return () => {
      window.clearTimeout(finishTimer);
    };
  }, [timeLeft]);

  return {
    score,
    timeLeft,
    level,
    difficulty,
    isRunning,
    isFinished,
    addPoints,
  };
}