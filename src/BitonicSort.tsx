import React from "react";

import { BitonicNetwork, bitonicSortNetwork } from "./bitonicSortNetwork";
import { Phase, SortVariant } from "./enums";
import OptionController, { ResetOption } from "./OptionController";
import SortCanvas from "./SortCanvas";
import StepController from "./StepController";

const randomArray = (num: number) => {
  const arr: Array<[number, number]> = [];
  for (let i = 1; i <= num; i++) {
    arr.push([Math.random(), i]);
  }
  return arr.sort((a, b) => a[0] - b[0]).map((e) => e[1]);
};

const bitonicSortStep = (array: number[], network: BitonicNetwork) => {
  const result = array.slice();
  for (const [smallIdx, largeIdx] of network.pairs) {
    if (array[smallIdx] > array[largeIdx]) {
      result[smallIdx] = array[largeIdx];
      result[largeIdx] = array[smallIdx];
    }
  }
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
    const network = bitonicSortNetwork(this.state.variant, this.state.array.length, this.state.stage);
    return (
      <div>
        <SortCanvas
          width={this.props.width}
          height={this.props.height}
          array={this.state.array}
          phase={this.state.phase}
          network={network}
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
    const network = bitonicSortNetwork(this.state.variant, this.state.array.length, this.state.stage);
    const newArray = bitonicSortStep(this.state.array, network);
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
