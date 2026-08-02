import tokenFloating01 from './floating/token-floating-01.svg';
import tokenFloating02 from './floating/token-floating-02.svg';
import tokenFloating03 from './floating/token-floating-03.svg';
import tokenFloating04 from './floating/token-floating-04.svg';
import tokenFloating05 from './floating/token-floating-05.svg';
import tokenFloating06 from './floating/token-floating-06.svg';
import tokenPile01 from './pile/token-pile-01.svg';
import tokenPile02 from './pile/token-pile-02.svg';
import tokenPile03 from './pile/token-pile-03.svg';
import tokenPile04 from './pile/token-pile-04.svg';
import tokenPile05 from './pile/token-pile-05.svg';
import tokenPile06 from './pile/token-pile-06.svg';
import tokenPile07 from './pile/token-pile-07.svg';

export const tokenAssets = {
  'floating-01': tokenFloating01,
  'floating-02': tokenFloating02,
  'floating-03': tokenFloating03,
  'floating-04': tokenFloating04,
  'floating-05': tokenFloating05,
  'floating-06': tokenFloating06,
  'pile-01': tokenPile01,
  'pile-02': tokenPile02,
  'pile-03': tokenPile03,
  'pile-04': tokenPile04,
  'pile-05': tokenPile05,
  'pile-06': tokenPile06,
  'pile-07': tokenPile07,
} as const;

export type TokenAssetId = keyof typeof tokenAssets;

export const floatingTokenAssetIds = [
  'floating-01',
  'floating-02',
  'floating-03',
  'floating-04',
  'floating-05',
  'floating-06',
] as const satisfies readonly TokenAssetId[];
