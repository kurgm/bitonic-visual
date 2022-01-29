import { SortVariant } from "./enums";

export type IndexPair = [smallIdx: number, largeIdx: number];

export interface BitonicNetwork {
  orderType: "flip" | "shift";
  pairs: IndexPair[];
}

export const bitonicSortNetwork = (variant: SortVariant, nElem: number, stage: number, substage: number): BitonicNetwork => {
  const blockSize = 1 << stage;
  const subblockSizeHalf = 1 << substage;

  const pairs: IndexPair[] = [];
  const flipRightSubblock = (start: number) => {
    for (let i = 0; i < subblockSizeHalf; i++) {
      pairs.push([start + i, start + 2 * subblockSizeHalf - 1 - i]);
    }
  };
  const shiftLeftSubblock = (start: number) => {
    for (let i = 0; i < subblockSizeHalf; i++) {
      pairs.push([start + subblockSizeHalf + i, start + i]);
    }
  };
  const shiftRightSubblock = (start: number) => {
    for (let i = 0; i < subblockSizeHalf; i++) {
      pairs.push([start + i, start + subblockSizeHalf + i]);
    }
  };

  if (variant === "sawtooth") {
    if (stage - 1 === substage) {
      for (let subBlockStart = 0; subBlockStart < nElem; subBlockStart += 2 * subblockSizeHalf) {
        flipRightSubblock(subBlockStart);
      }
      return { orderType: "flip", pairs };
    }
    for (let subBlockStart = 0; subBlockStart < nElem; subBlockStart += 2 * subblockSizeHalf) {
      shiftRightSubblock(subBlockStart);
    }
    return { orderType: "shift", pairs };
  }

  for (let subBlockStart = 0; subBlockStart < nElem; subBlockStart += 2 * subblockSizeHalf) {
    const reverse = (subBlockStart & blockSize) !== 0;
    if (reverse) {
      shiftLeftSubblock(subBlockStart);
    } else {
      shiftRightSubblock(subBlockStart);
    }
  }
  return { orderType: "shift", pairs };
};

export const bitonicSortFullNetwork = (variant: SortVariant, nElem: number) => {
  const result: BitonicNetwork[] = [];
  for (let stage = 1; (1 << stage) <= nElem; stage++) {
    for (let substage = stage - 1; substage >= 0; substage--) {
      result.push(bitonicSortNetwork(variant, nElem, stage, substage));
    }
  }
  return result;
};
