import React from "react";

import { BitonicNetwork, bitonicSortFullNetwork } from "./bitonicSortNetwork";
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
  phase: Phase;
  progress: number;
  variant: SortVariant;
}

const BitonicSort: React.FC<IBitonicSortProps> = (props) => {
  const [state, setState_] = React.useState<IBitonicSortState>({
    array: randomArray(32),
    phase: Phase.waiting,
    progress: 0,
    variant: SortVariant.monotonic,
  });
  const setState = (newState: Partial<IBitonicSortState>) => {
    setState_((state) => ({ ...state, ...newState }));
  };

  const [nonstop, setNonstop] = React.useState(false);

  const fullNetwork = React.useMemo(() => (
    bitonicSortFullNetwork(state.variant, state.array.length)
  ), [state.variant, state.array.length]);

  const network = fullNetwork[state.progress] as BitonicNetwork | undefined;

  const handleStep = React.useCallback(() => {
    if (state.phase !== Phase.waiting || fullNetwork.length <= state.progress) {
      return;
    }
    setState({
      phase: Phase.animationIn,
    });
  }, [state.phase, fullNetwork.length, state.progress]);
  const handleAnimationInEnd = React.useCallback(() => {
    const newArray = network ? bitonicSortStep(state.array, network) : state.array;
    setState({
      array: newArray,
      phase: Phase.animationOut,
    });
  }, [state.array, network]);
  const handleAnimationOutEnd = React.useCallback(() => {
    const completing = fullNetwork.length <= state.progress + 1;
    setState({
      phase: nonstop && !completing ? Phase.animationIn : Phase.waiting,
      progress: state.progress + 1,
    });
  }, [fullNetwork.length, state.progress, nonstop]);
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
      phase: Phase.waiting,
      progress: 0,
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
