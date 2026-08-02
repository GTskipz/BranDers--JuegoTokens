import "./WaveTransition.scss";

import { RedWave } from "../RedWave/RedWave";
import { YellowWave } from "../YellowWave/YellowWave";

export type WaveState =
  | "home"
  | "to-instructions"
  | "instructions";

type WaveTransitionProps = {
  state: WaveState;
};

export function WaveTransition({
  state,
}: WaveTransitionProps) {
  return (
    <div
      className={`wave-transition wave-transition--${state}`}
      aria-hidden="true"
    >
      <div className="wave-transition__red">
        <RedWave />
      </div>

      <div className="wave-transition__yellow">
        <YellowWave />
      </div>
    </div>
  );
}