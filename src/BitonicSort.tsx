import React from "react";

import { Phase, SortVariant } from "./enums";
import OptionController, { ResetOption } from "./OptionController";
import SortCanvas, { BinTransform } from "./SortCanvas";
import StepController from "./StepController";

const randomArray = (num: number) => {
  const arr: Array<[number, number]> = [];
  for (let i = 1; i <= num; i++) {
    arr.push([Math.random(), i]);
  }
  return arr.sort((a, b) => a[0] - b[0]).map((e) => e[1]);
};

const bitonicSortStepGeneric = (
  variant: SortVariant, nElem: number, stage: [number, number],
  callback: (smallIdx: number, largeIdx: number, isFlip: boolean) => void
) => {
  const blockSize = 1 << stage[0];
  const shift = 1 << stage[1];
  let reverse = false;
  for (let blockStart = 0; blockStart < nElem; blockStart += blockSize) {
    for (let subBlockStart = blockStart; subBlockStart < blockStart + blockSize; subBlockStart += 2 * shift) {
      if (variant === SortVariant.monotonic && stage[0] - 1 === stage[1]) {
        // flip
        for (let i = 0; i < shift; i++) {
          callback(subBlockStart + i, subBlockStart + 2 * shift - 1 - i, true);
        }
      } else if (variant === SortVariant.bitonic && reverse) {
        // shift (reverse)
        for (let i = 0; i < shift; i++) {
          callback(subBlockStart + shift + i, subBlockStart + i, false);
        }
      } else {
        // shift
        for (let i = 0; i < shift; i++) {
          callback(subBlockStart + i, subBlockStart + shift + i, false);
        }
      }
    }
    reverse = !reverse;
  }
};

const bitonicSortStep = (variant: SortVariant, array: number[], stage: [number, number]) => {
  const result = array.slice();
  bitonicSortStepGeneric(variant, array.length, stage, (smallIdx, largeIdx) => {
    if (array[smallIdx] > array[largeIdx]) {
      result[smallIdx] = array[largeIdx];
      result[largeIdx] = array[smallIdx];
    }
  });
  return result;
};

const getTransforms = (variant: SortVariant, nElem: number, stage: [number, number]): BinTransform[] => {
  const result = new Array<BinTransform>(nElem).fill(null);
  bitonicSortStepGeneric(variant, nElem, stage, (smallIdx, largeIdx, isFlip) => {
    // if (result[smallIdx] || result[largeIdx]) { throw new Error("!"); }
    result[smallIdx] = isFlip ? {
      type: "flip",
      originOffset: (largeIdx - smallIdx + 1) / 2,
    } : {
      type: "shift",
      amount: largeIdx - smallIdx,
    };
  });
  return result;
};

export interface IBitonicSortProps {
  width: number;
  height: number;
}
export interface IBitonicSortState {
  array: number[];
  completed: boolean;
  nonstop: boolean;
  phase: Phase;
  stage: [number, number];
  variant: SortVariant;
}

export default class BitonicSort extends React.Component<IBitonicSortProps, IBitonicSortState> {
  public state: IBitonicSortState = {
    array: randomArray(32),
    completed: false,
    nonstop: false,
    phase: Phase.waiting,
    stage: [1, 0],
    variant: SortVariant.monotonic,
  };
  public render(): JSX.Element {
    return (
      <div>
        <SortCanvas
          width={this.props.width}
          height={this.props.height}
          array={this.state.array}
          phase={this.state.phase}
          transforms={getTransforms(this.state.variant, this.state.array.length, this.state.stage)}
          onTransitionEnd={this.handleTransitionEnd}
        />
        <div className="controller">
          <StepController
            canStep={this.state.phase === Phase.waiting}
            onStep={this.handleStep}
            nonstop={this.state.nonstop}
            onNonstopChange={this.handleNonstop}
          />
          <OptionController
            canReset={this.state.phase === Phase.waiting}
            onReset={this.handleReset}
          />
        </div>
      </div>
    );
  }

  private handleStep = () => {
    if (this.state.phase !== Phase.waiting || this.state.completed) {
      return;
    }
    this.setState({
      phase: Phase.animationIn,
    });
  }
  private handleTransitionEnd = () => {
    if (this.state.phase === Phase.animationIn) {
      this.handleAnimationInEnd();
    } else if (this.state.phase === Phase.animationOut) {
      this.handleAnimationOutEnd();
    }
  }
  private handleAnimationInEnd = () => {
    const newArray = bitonicSortStep(this.state.variant, this.state.array, this.state.stage);
    this.setState({
      array: newArray,
      phase: Phase.animationOut,
    });
  }
  private handleAnimationOutEnd = () => {
    const newStage: [number, number] = [this.state.stage[0], this.state.stage[1] - 1];
    if (newStage[1] === -1) {
      newStage[0]++;
      newStage[1] = newStage[0] - 1;
    }
    const completed = this.state.array.length < (1 << newStage[0]);
    this.setState({
      completed,
      phase: this.state.nonstop && !completed ? Phase.animationIn : Phase.waiting,
      stage: newStage,
    });
  }
  private handleReset = (opt: ResetOption) => {
    if (this.state.phase !== Phase.waiting) {
      return;
    }
    this.setState({
      array: randomArray(opt.nElem),
      completed: false,
      phase: Phase.waiting,
      stage: [1, 0],
      variant: opt.sortVariant,
    });
  }
  private handleNonstop = (nonstop: boolean) => {
    this.setState({
      nonstop,
    });
  }
}
