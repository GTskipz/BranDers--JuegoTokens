import "./FloatingTokens.scss";

import {
  floatingTokenAssetIds,
  tokenAssets,
} from "../../assets/tokens/tokenAssets";

import { FLOATING_TOKEN_LAYOUTS } from "./floatingLayouts";
import type { FloatingTokensState } from "./types";

type FloatingTokensProps = {
  state: FloatingTokensState;
};

export function FloatingTokens({
  state,
}: FloatingTokensProps) {
  const layout = FLOATING_TOKEN_LAYOUTS[state];

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