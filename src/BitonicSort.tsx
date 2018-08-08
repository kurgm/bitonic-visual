import React from "react";

const randomArray = (num: number) => {
  const arr: Array<[number, number]> = [];
  for (let i = 1; i <= num; i++) {
    arr.push([Math.random(), i]);
  }
  return arr.sort((a, b) => a[0] - b[0]).map((e) => e[1]);
};

enum SortVariant {
  bitonic,
  monotonic,
}

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

enum Phase {
  waiting,
  animationIn,
  animationOut,
}

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
  public render() {
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
          <div>
            <button onClick={this.handleStep} disabled={this.state.phase !== Phase.waiting}>step</button>
            <button onClick={this.handleReset} disabled={this.state.phase !== Phase.waiting}>reset</button>
            <label>
              <input type="checkbox" onChange={this.handleNonstop} checked={this.state.nonstop} />
              Non-stop
            </label>
          </div>
          <div>
            <label>
              N =
              <select onChange={this.handleNum} value={this.state.numOfElem}>
                {[2, 4, 8, 16, 32, 64, 128, 256, 512].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <label>
              Mode:
              <select
                onChange={this.handleMode} value={this.state.variant}
                disabled={!(this.state.completed
                  || this.state.phase === Phase.waiting && this.state.stage[0] === 1 && this.state.stage[1] === 0)}
              >
                <option value={SortVariant.monotonic}>flip</option>
                <option value={SortVariant.bitonic}>shift</option>
              </select>
            </label>
          </div>
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
  private handleNonstop = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      nonstop: e.currentTarget.checked,
    });
  }
  private handleNum = (e: React.SyntheticEvent<HTMLSelectElement>) => {
    this.setState({
      numOfElem: parseInt(e.currentTarget.value, 10),
    });
  }
  private handleMode = (e: React.SyntheticEvent<HTMLSelectElement>) => {
    if (!(this.state.completed
      || this.state.phase === Phase.waiting && this.state.stage[0] === 1 && this.state.stage[1] === 0)) {
      return;
    }
    this.setState({
      variant: parseInt(e.currentTarget.value, 10),
    });
  }
}
