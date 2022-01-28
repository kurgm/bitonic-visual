import React from "react";

import { Phase, SortVariant } from "./enums";
import OptionController from "./OptionController";
import StepController from "./StepController";

const randomArray = (num: number) => {
  const arr: Array<[number, number]> = [];
  for (let i = 1; i <= num; i++) {
    arr.push([Math.random(), i]);
  }
  return arr.sort((a, b) => a[0] - b[0]).map((e) => e[1]);
};

const sortElement = (array: number[], index1: number, index2: number) => {
  if (array[index1] > array[index2]) {
    const tmp = array[index2];
    array[index2] = array[index1];
    array[index1] = tmp;
  }
};

const bitonicSortStep = (variant: SortVariant, array: number[], stage: [number, number]) => {
  const result = array.slice();
  const blockSize = 1 << stage[0];
  const shift = 1 << stage[1];
  let reverse = false;
  for (let blockStart = 0; blockStart < array.length; blockStart += blockSize) {
    for (let subBlockStart = blockStart; subBlockStart < blockStart + blockSize; subBlockStart += 2 * shift) {
      if (variant === SortVariant.monotonic && stage[0] - 1 === stage[1]) {
        // flip
        for (let i = 0; i < shift; i++) {
          sortElement(result, subBlockStart + i, subBlockStart + 2 * shift - 1 - i);
        }
      } else if (variant === SortVariant.bitonic && reverse) {
        // shift (reverse)
        for (let i = 0; i < shift; i++) {
          sortElement(result, subBlockStart + shift + i, subBlockStart + i);
        }
      } else {
        // shift
        for (let i = 0; i < shift; i++) {
          sortElement(result, subBlockStart + i, subBlockStart + shift + i);
        }
      }
    }
    reverse = !reverse;
  }
  return result;
};

const getTransform = (
  variant: SortVariant, stage: [number, number], index: number, barWidth: number,
): React.CSSProperties => {
  const blockSize = 1 << stage[0];
  const shift = 1 << stage[1];
  const blockStart = Math.floor(index / blockSize) * blockSize;
  const subBlockStart = Math.floor(index / (shift * 2)) * (shift * 2);
  const reverse = (blockStart / blockSize) % 2 === 1;
  if (variant === SortVariant.monotonic && stage[0] - 1 === stage[1]) {
    // flip
    return (index - subBlockStart < shift)
      ? {
        transform: "rotateY(180deg)",
      }
      : {};
  }
  if (variant === SortVariant.bitonic && reverse) {
    // shift (reverse)
    return (index - subBlockStart >= shift)
      ? {
        transform: `translate(${-barWidth * shift}px, 0px)`,
      }
      : {};
  }
  // shift
  return (index - subBlockStart < shift)
    ? {
      transform: `translate(${barWidth * shift}px, 0px)`,
    }
    : {};
};

const getTransformOrigin = (variant: SortVariant, stage: [number, number], index: number, barWidth: number) => {
  if (variant === SortVariant.monotonic && stage[0] - 1 === stage[1]) {
    const shift = 1 << stage[1];
    const subBlockStart = Math.floor(index / (shift * 2)) * (shift * 2);
    const center = subBlockStart + shift;
    if (index - subBlockStart < shift) {
      return {
        transformOrigin: `${barWidth * (center - index)}px 50%`,
      };
    }
  }
  return {};
};

export interface IBitonicSortProps {
  width: number;
  height: number;
}
export interface IBitonicSortState {
  array: number[];
  completed: boolean;
  nonstop: boolean;
  numOfElem: number;
  phase: Phase;
  stage: [number, number];
  variant: SortVariant;
}

export default class BitonicSort extends React.Component<IBitonicSortProps, IBitonicSortState> {
  public state: IBitonicSortState = {
    array: randomArray(32),
    completed: false,
    nonstop: false,
    numOfElem: 32,
    phase: Phase.waiting,
    stage: [1, 0],
    variant: SortVariant.monotonic,
  };
  public render(): JSX.Element {
    const maxValue = Math.max(...this.state.array);
    const barWidth = this.props.width / this.state.array.length;
    return (
      <div>
        <div className="canvas" style={{
          height: `${this.props.height}px`,
          width: `${this.props.width}px`,
        }}>
          {this.state.array.map((n, i) => (
            <div
              key={i}
              className="bar"
              style={{
                bottom: "0px",
                height: `${this.props.height / maxValue * n}px`,
                left: `${barWidth * i}px`,
                width: `${barWidth}px`,
                ...(this.state.phase === Phase.animationIn)
                && getTransform(this.state.variant, this.state.stage, i, barWidth),
                ...getTransformOrigin(this.state.variant, this.state.stage, i, barWidth),
              }}
              {...(i === 0) && {
                onTransitionEnd: this.handleTransitionEnd,
              }}
            />
          ))}
        </div>
        <div className="controller">
          <StepController
            canStep={this.state.phase === Phase.waiting}
            onStep={this.handleStep}
            canReset={this.state.phase === Phase.waiting}
            onReset={this.handleReset}
            nonstop={this.state.nonstop}
            onNonstopChange={this.handleNonstop}
          />
          <OptionController
            disabled={!(
              this.state.completed
              || this.state.phase === Phase.waiting && this.state.stage[0] === 1 && this.state.stage[1] === 0
            )}
            nElem={this.state.numOfElem}
            onNElemChange={this.handleNum}
            mode={this.state.variant}
            onModeChange={this.handleMode}
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
  private handleReset = () => {
    if (this.state.phase !== Phase.waiting) {
      return;
    }
    this.setState({
      array: randomArray(this.state.numOfElem),
      completed: false,
      phase: Phase.waiting,
      stage: [1, 0],
    });
  }
  private handleNonstop = (nonstop: boolean) => {
    this.setState({
      nonstop,
    });
  }
  private handleNum = (numOfElem: number) => {
    this.setState({
      numOfElem,
    });
  }
  private handleMode = (variant: SortVariant) => {
    if (!(this.state.completed
      || this.state.phase === Phase.waiting && this.state.stage[0] === 1 && this.state.stage[1] === 0)) {
      return;
    }
    this.setState({
      variant,
    });
  }
}
