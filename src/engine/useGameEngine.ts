import { useEffect, useMemo, useRef, useState } from "react";

export type GameLevel = 1 | 2 | 3;

export type DifficultyConfig = {
  level: GameLevel;
  spawnInterval: number;
  maxTokens: number;
  minimumFallDuration: number;
  maximumFallDuration: number;
};

export type AdminDifficultyConfig = {
  spawnInterval?: number;
  maxTokens?: number;
  minimumFallDuration?: number;
  maximumFallDuration?: number;
  minFall?: number;
  maxFall?: number;
};

export type AdminLevelConfigs = Partial<
  Record<GameLevel, AdminDifficultyConfig>
>;

type UseGameEngineOptions = {
  isActive: boolean;
  duration?: number;
  levels?: AdminLevelConfigs;
  onFinish: (score: number) => void;
};

type GameEngine = {
  score: number;
  timeLeft: number;
  elapsedTime: number;
  level: GameLevel;
  difficulty: DifficultyConfig;
  isRunning: boolean;
  isFinished: boolean;
  addPoints: (points: number) => void;
};

const DEFAULT_GAME_DURATION = 30;
const MAX_GAME_DURATION = 30;

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

function getGameDuration(duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) {
    return DEFAULT_GAME_DURATION;
  }

  return Math.min(Math.floor(duration), MAX_GAME_DURATION);
}

function getLevel(timeLeft: number): GameLevel {
  if (timeLeft >= 21) {
    return 1;
  }

  if (timeLeft >= 11) {
    return 2;
  }

  return 3;
}

function getPositiveNumber(
  value: number | undefined,
  fallback: number,
): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return value;
}

function getLevelConfigs(
  levels?: AdminLevelConfigs,
): Record<GameLevel, DifficultyConfig> {
  return {
    1: getLevelConfig(1, levels?.[1]),
    2: getLevelConfig(2, levels?.[2]),
    3: getLevelConfig(3, levels?.[3]),
  };
}

function getLevelConfig(
  level: GameLevel,
  config?: AdminDifficultyConfig,
): DifficultyConfig {
  const fallback = LEVEL_CONFIGS[level];

  return {
    level,
    spawnInterval: getPositiveNumber(
      config?.spawnInterval,
      fallback.spawnInterval,
    ),
    maxTokens: Math.floor(
      getPositiveNumber(config?.maxTokens, fallback.maxTokens),
    ),
    minimumFallDuration: getPositiveNumber(
      config?.minimumFallDuration ?? config?.minFall,
      fallback.minimumFallDuration,
    ),
    maximumFallDuration: getPositiveNumber(
      config?.maximumFallDuration ?? config?.maxFall,
      fallback.maximumFallDuration,
    ),
  };
}

export function useGameEngine({
  isActive,
  duration: requestedDuration = DEFAULT_GAME_DURATION,
  levels,
  onFinish,
}: UseGameEngineOptions): GameEngine {
  const duration = useMemo(
    () => getGameDuration(requestedDuration),
    [requestedDuration],
  );

  const levelConfigs = useMemo(
    () => getLevelConfigs(levels),
    [levels],
  );

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
    () => getLevel(timeLeft),
    [timeLeft],
  );

  const elapsedTime = duration - timeLeft;

  const difficulty = levelConfigs[level];

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
    elapsedTime,
    level,
    difficulty,
    isRunning,
    isFinished,
    addPoints,
  };
}
