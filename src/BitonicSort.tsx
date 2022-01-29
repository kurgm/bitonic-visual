import React from "react";

import { BitonicNetwork, bitonicSortFullNetwork } from "./bitonicSortNetwork";
import { Phase, SortVariant } from "./enums";
import OptionController, { ResetOption } from "./OptionController";
import SortCanvas, { BitonicSortStep } from "./SortCanvas";
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

type BitonicSortProcess = {
  steps: BitonicSortStep[];
  variant: SortVariant;
};

const generateSortProcess = (variant: SortVariant, array: number[]): BitonicSortProcess => {
  array = array.slice();
  let prevNetwork: BitonicNetwork | null = null;
  const steps: BitonicSortStep[] = [];
  for (const network of bitonicSortFullNetwork(variant, array.length)) {
    steps.push({
      array,
      nextNetwork: network,
      prevNetwork,
    });
    array = bitonicSortStep(array, network);
    prevNetwork = network;
  }
  steps.push({
    array,
    nextNetwork: null,
    prevNetwork,
  });
  return {
    steps,
    variant,
  };
};

export interface IBitonicSortProps {
  width: number;
  height: number;
}
interface IBitonicSortState {
  sortProcess: BitonicSortProcess;
  phase: Phase;
  progress: number;
}

const BitonicSort: React.FC<IBitonicSortProps> = (props) => {
  const [state, setState_] = React.useState((): IBitonicSortState => ({
    sortProcess: generateSortProcess("sawtooth", randomArray(32)),
    phase: Phase.waiting,
    progress: 0,
  }));
  const setState = (newState: Partial<IBitonicSortState>) => {
    setState_((state) => ({ ...state, ...newState }));
  };

  const [nonstop, setNonstop] = React.useState(false);

  const sortStep = state.sortProcess.steps[state.progress];

  const completed = state.sortProcess.steps.length - 1 <= state.progress;

  const handleStep = React.useCallback(() => {
    if (state.phase !== Phase.waiting || completed) {
      return;
    }
    setState({
      phase: Phase.animationIn,
    });
  }, [state.phase, completed]);
  const handleAnimationInEnd = React.useCallback(() => {
    setState({
      phase: Phase.animationOut,
      progress: state.progress + 1,
    });
  }, [state.progress]);
  const handleAnimationOutEnd = React.useCallback(() => {
    setState({
      phase: nonstop && !completed ? Phase.animationIn : Phase.waiting,
    });
  }, [nonstop, completed]);
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
      sortProcess: generateSortProcess(opt.sortVariant, randomArray(opt.nElem)),
      phase: Phase.waiting,
      progress: 0,
    });
  }, [state.phase]);

  return (
    <div>
      <SortCanvas
        width={props.width}
        height={props.height}
        sortStep={sortStep}
        phase={state.phase}
        onTransitionEnd={handleTransitionEnd}
      />
      <div className="controller">
        <div>
          N = {sortStep.array.length},
          Mode = {state.sortProcess.variant}
        </div>
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
