import type { CSSProperties } from "react";

import "./PileTokens.scss";

import {
  tokenAssets,
  type TokenAssetId,
} from "../../assets/tokens/tokenAssets";

import { PILE_TOKEN_LAYOUTS } from "./pileLayouts";
import type { PileTokensState } from "./types";

type PileTokensProps = {
  state: PileTokensState;
};

type PileTokenStyle = CSSProperties & {
  "--pile-idle-delay": string;
  "--pile-idle-duration": string;
};

const PILE_TOKEN_ASSET_IDS = [
  "pile-01",
  "pile-02",
  "pile-03",
  "pile-04",
  "pile-05",
  "pile-06",
  "pile-07",
] as const satisfies readonly TokenAssetId[];

export function PileTokens({
  state,
}: PileTokensProps) {
  const layout = PILE_TOKEN_LAYOUTS[state];

  return (
    <div
      className={`pile-tokens-layer pile-tokens-layer--${state}`}
      aria-hidden="true"
    >
      {layout.map((token, index) => {
        const assetId =
          PILE_TOKEN_ASSET_IDS[token.imageIndex];

        const style: PileTokenStyle = {
          left: `${token.x}%`,
          top: `${token.y}%`,
          width: `${token.width}%`,
          opacity: token.opacity,
          zIndex: token.zIndex,

          transform: `
            translate(-50%, -50%)
            rotate(${token.rotation}deg)
            scale(${token.scale})
          `,

          transitionDelay: `${token.transitionDelay}ms`,

          // Valores diferentes para que no se muevan todos juntos.
          "--pile-idle-delay": `${index * -0.28}s`,
          "--pile-idle-duration": `${1.65 + index * 0.22}s`,
        };

        return (
          <img
            key={token.id}
            className="pile-token"
            src={tokenAssets[assetId]}
            alt=""
            draggable={false}
            style={style}
          />
        );
      })}
    </div>
  );
}