import { createMedia } from "@tamagui/react-native-media-driver";
import { config } from "@tamagui/config/v2";
import { createFont, createTamagui, createTokens } from "tamagui";
const appConfig = createTamagui(config);

const interFont = createFont({
  family: "Inter, Helvetica, Arial, sans-serif",
  // keys used for the objects you pass to `size`, `lineHeight`, `weight`
  // and `letterSpacing` should be consistent. The `createFont` function
  // will fill-in any missing values if `lineHeight`, `weight` or `letterSpacing`
  // are subsets of `size`
  size: {
    1: 12,
    2: 14,
    3: 15,
  },
  lineHeight: {
    // 1 will be 22
    2: 22,
  },
  weight: {
    1: "300",
    // 2 will be 300
    3: "600",
  },
  letterSpacing: {
    1: 0,
    2: -1,
    // 3 will be -1
  },
  // (native) swap out fonts by face/style
  face: {
    300: { normal: "InterLight", italic: "InterItalic" },
    600: { normal: "InterBold" },
  },
});

// these keys can be different, but again we highly recommend consistency
const size = {
  0: 0,
  1: 5,
  2: 10,
};

export const tokens = createTokens({
  size,
  space: { ...size, "-1": -5, "-2": -10 },
  radius: { 0: 0, 1: 3 },
  zIndex: { 0: 0, 1: 100, 2: 200 },
  color: {
    white: "#fff",
    black: "#000",
  },
});

export type AppConfig = typeof appConfig;
declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}
export default config;
