export const sortVariants = [
  "sawtooth",
  "triangle",
] as const;

export type SortVariant = (typeof sortVariants)[number];

export enum Phase {
  waiting,
  animationIn,
  animationOut,
}
