import tokenCatchSound from "../assets/audio/coin_grab.mp3";
import specialTokenAppearSound from "../assets/audio/especial_coin_event.mp3";
import menuBackgroundMusic from "../assets/audio/sonido_fondo_menu.mp3";
import buttonPressSound from "../assets/audio/menu_select.mp3";
import countdownSound from "../assets/audio/countdown.mp3";
import gameBackgroundMusic from "../assets/audio/music_game.mp3";

export const GAME_SOUND_IDS = {
  tokenCatch: "tokenCatch",
  specialTokenAppear: "specialTokenAppear",
  menuBackground: "menuBackground",
  gameBackground: "gameBackground",
  countdown: "countdown",
  gameStart: "gameStart",
  gameEnd: "gameEnd",
  buttonPress: "buttonPress",
  prize: "prize",
} as const;

export type GameSoundId =
  (typeof GAME_SOUND_IDS)[keyof typeof GAME_SOUND_IDS];

type SoundDefinition = {
  src?: string;
  volume: number;
  poolSize: number;
  maxPoolSize?: number;
  canOverlap?: boolean;
  loop?: boolean;
};

const SOUND_DEFINITIONS: Record<
  GameSoundId,
  SoundDefinition
> = {
  tokenCatch: {
    src: tokenCatchSound,
    volume: 0.9,
    poolSize: 8,
    maxPoolSize: 32,
    canOverlap: true,
  },
  specialTokenAppear: {
    src: specialTokenAppearSound,
    volume: 1,
    poolSize: 1,
  },
  menuBackground: {
    src: menuBackgroundMusic,
    volume: 0.3,
    poolSize: 1,
    loop: true,
  },
  gameBackground: {
    src: gameBackgroundMusic,
    volume: 0.45,
    poolSize: 1,
    loop: true,
  },
  countdown: {
    src: countdownSound,
    volume: 1,
    poolSize: 1,
  },
  gameStart: {
    volume: 1,
    poolSize: 1,
  },
  gameEnd: {
    volume: 1,
    poolSize: 1,
  },
  buttonPress: {
    src: buttonPressSound,
    volume: 0.8,
    poolSize: 3,
    canOverlap: true,
  },
  prize: {
    volume: 1,
    poolSize: 1,
  },
};

type SoundStateListener = (isMuted: boolean) => void;

const OVERLAP_RESERVATION_DURATION = 1000;

type SoundPool = {
  sounds: HTMLAudioElement[];
  nextIndex: number;
};

type BrowserAudioWindow = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

class GameSoundController {
  private isMuted = false;
  private isUnlocked = false;
  private masterVolume = 1;
  private activeLoops = new Set<GameSoundId>();
  private listeners = new Set<SoundStateListener>();
  private pools = new Map<GameSoundId, SoundPool>();
  private audioContext: AudioContext | null = null;
  private soundReservations =
    new WeakMap<HTMLAudioElement, number>();

  play(soundId: GameSoundId) {
    if (this.isMuted || !this.isUnlocked) {
      return;
    }

    const definition = SOUND_DEFINITIONS[soundId];

    if (!definition.src) {
      return;
    }

    const pool = this.getPool(soundId, definition);

    if (pool.sounds.length === 0) {
      return;
    }

    const sound = this.getSound(pool, definition);

    sound.currentTime = 0;
    sound.volume = this.getSoundVolume(definition);
    this.reserveSound(sound, definition);

    sound.play().catch(() => {});
  }

  unlock() {
    if (this.isUnlocked) {
      return;
    }

    this.isUnlocked = true;
    void this.resumeAudioContext();

    if (!this.isMuted) {
      this.resumeActiveLoops();
    }
  }

  playLoop(soundId: GameSoundId) {
    const definition = SOUND_DEFINITIONS[soundId];

    if (!definition.src) {
      return;
    }

    this.activeLoops.add(soundId);

    if (this.isMuted || !this.isUnlocked) {
      return;
    }

    const pool = this.getPool(soundId, definition);
    const sound = pool.sounds[0];

    if (!sound) {
      return;
    }

    sound.loop = true;
    sound.volume = this.getSoundVolume(definition);

    if (sound.paused) {
      sound.play().catch(() => {});
    }
  }

  pause(soundId: GameSoundId) {
    this.activeLoops.delete(soundId);

    const pool = this.pools.get(soundId);
    const sound = pool?.sounds[0];

    if (sound) {
      sound.pause();
    }
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  toggleMuted(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  setMuted(isMuted: boolean) {
    if (this.isMuted === isMuted) {
      return;
    }

    this.isMuted = isMuted;

    if (this.isMuted) {
      this.pauseAllSounds();
    } else if (this.isUnlocked) {
      this.resumeActiveLoops();
    }

    this.notifyListeners();
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.min(
      Math.max(volume, 0),
      1,
    );

    this.pools.forEach((pool, soundId) => {
      const definition = SOUND_DEFINITIONS[soundId];

      pool.sounds.forEach((sound) => {
        sound.volume = this.getSoundVolume(definition);
      });
    });
  }

  subscribe(listener: SoundStateListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private getPool(
    soundId: GameSoundId,
    definition: SoundDefinition,
  ): SoundPool {
    const existingPool = this.pools.get(soundId);

    if (existingPool) {
      return existingPool;
    }

    if (typeof Audio === "undefined") {
      const emptyPool = {
        sounds: [],
        nextIndex: 0,
      };

      this.pools.set(soundId, emptyPool);
      return emptyPool;
    }

    const poolSize = Math.max(1, definition.poolSize);
    const sounds = Array.from(
      { length: poolSize },
    () => {
        return this.createSound(definition);
      },
    );

    const pool = {
      sounds,
      nextIndex: 0,
    };

    this.pools.set(soundId, pool);
    return pool;
  }

  private getSound(
    pool: SoundPool,
    definition: SoundDefinition,
  ): HTMLAudioElement {
    if (definition.canOverlap) {
      return this.getOverlappingSound(pool, definition);
    }

    const availableSound = pool.sounds.find(
      (sound) => sound.paused || sound.ended,
    );

    if (availableSound) {
      return availableSound;
    }

    return pool.sounds[0];
  }

  private getOverlappingSound(
    pool: SoundPool,
    definition: SoundDefinition,
  ): HTMLAudioElement {
    const sound = pool.sounds[pool.nextIndex];

    pool.nextIndex =
      (pool.nextIndex + 1) % pool.sounds.length;

    if (
      this.isSoundReserved(sound) &&
      pool.sounds.length < this.getMaxPoolSize(definition)
    ) {
      const extraSound = this.createSound(definition);

      pool.sounds.push(extraSound);
      pool.nextIndex = pool.sounds.length % pool.sounds.length;

      return extraSound;
    }

    return sound;
  }

  private reserveSound(
    sound: HTMLAudioElement,
    definition: SoundDefinition,
  ) {
    if (!definition.canOverlap) {
      return;
    }

    this.soundReservations.set(
      sound,
      Date.now() + OVERLAP_RESERVATION_DURATION,
    );
  }

  private isSoundReserved(
    sound: HTMLAudioElement,
  ): boolean {
    const reservedUntil =
      this.soundReservations.get(sound) ?? 0;

    return (
      reservedUntil > Date.now() ||
      (!sound.paused && !sound.ended)
    );
  }

  private createSound(
    definition: SoundDefinition,
  ): HTMLAudioElement {
    const sound = new Audio(definition.src);
    sound.preload = "auto";
    sound.loop = definition.loop === true;
    sound.volume = this.getSoundVolume(definition);
    return sound;
  }

  private async resumeAudioContext() {
    if (typeof window === "undefined") {
      return;
    }

    const audioWindow = window as BrowserAudioWindow;
    const AudioContextConstructor =
      audioWindow.AudioContext ??
      audioWindow.webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContextConstructor();
    }

    const audioContext = this.audioContext;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
  }

  private getMaxPoolSize(
    definition: SoundDefinition,
  ): number {
    return Math.max(
      definition.poolSize,
      definition.maxPoolSize ?? definition.poolSize,
    );
  }

  private getSoundVolume(
    definition: SoundDefinition,
  ): number {
    return this.masterVolume * definition.volume;
  }

  private pauseAllSounds() {
    this.pools.forEach((pool) => {
      pool.sounds.forEach((sound) => {
        sound.pause();
      });
    });
  }

  private resumeActiveLoops() {
    this.activeLoops.forEach((soundId) => {
      this.playLoop(soundId);
    });
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      listener(this.isMuted);
    });
  }
}

export const gameSoundController =
  new GameSoundController();
