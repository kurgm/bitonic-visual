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
interface IBitonicSortState {
  array: number[];
  completed: boolean;
  phase: Phase;
  stage: [number, number];
  variant: SortVariant;
}

const BitonicSort: React.FC<IBitonicSortProps> = (props) => {
  const [state, setState_] = React.useState<IBitonicSortState>({
    array: randomArray(32),
    completed: false,
    phase: Phase.waiting,
    stage: [1, 0],
    variant: SortVariant.monotonic,
  });
  const setState = (newState: Partial<IBitonicSortState>) => {
    setState_((state) => ({ ...state, ...newState }));
  };

  const [nonstop, setNonstop] = React.useState(false);

  const network = React.useMemo(() => (
    bitonicSortNetwork(state.variant, state.array.length, state.stage)
  ), [state.variant, state.array.length, state.stage]);

  const handleStep = React.useCallback(() => {
    if (state.phase !== Phase.waiting || state.completed) {
      return;
    }
    setState({
      phase: Phase.animationIn,
    });
  }, [state.phase, state.completed]);
  const handleAnimationInEnd = React.useCallback(() => {
    const newArray = bitonicSortStep(state.array, network);
    setState({
      array: newArray,
      phase: Phase.animationOut,
    });
  }, [state.array, network]);
  const handleAnimationOutEnd = React.useCallback(() => {
    const newStage: [number, number] = [state.stage[0], state.stage[1] - 1];
    if (newStage[1] === -1) {
      newStage[0]++;
      newStage[1] = newStage[0] - 1;
    }
    const completed = state.array.length < (1 << newStage[0]);
    setState({
      completed,
      phase: nonstop && !completed ? Phase.animationIn : Phase.waiting,
      stage: newStage,
    });
  }, [state.stage, state.array.length, nonstop]);
  const handleTransitionEnd = React.useCallback(() => {
    if (state.phase === Phase.animationIn) {
      handleAnimationInEnd();
    } else if (state.phase === Phase.animationOut) {
      handleAnimationOutEnd();
    }
  }, [state.phase, handleAnimationInEnd, handleAnimationOutEnd]);
  const handleReset = React.useCallback((opt: ResetOption) => {
    if (state.phase !== Phase.waiting) {
      return;
    }
    setState({
      array: randomArray(opt.nElem),
      completed: false,
      phase: Phase.waiting,
      stage: [1, 0],
      variant: opt.sortVariant,
    });
  }, [state.phase]);

  return (
    <div>
      <SortCanvas
        width={props.width}
        height={props.height}
        array={state.array}
        phase={state.phase}
        network={network}
        onTransitionEnd={handleTransitionEnd}
      />
      <div className="controller">
        <StepController
          canStep={state.phase === Phase.waiting}
          onStep={handleStep}
          nonstop={nonstop}
          onNonstopChange={setNonstop}
        />
        <OptionController
          canReset={state.phase === Phase.waiting}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};

export default BitonicSort;
