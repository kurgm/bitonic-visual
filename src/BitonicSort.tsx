import React from "react";

import { BitonicNetwork, bitonicSortFullNetwork } from "./bitonicSortNetwork";
import { Phase, SortVariant } from "./enums";
import OptionController, { defaultOption, ResetOption } from "./OptionController";
import SortCanvas, { BitonicSortStep } from "./SortCanvas";
import StepController from "./StepController";
import { ExhaustiveCheckError } from "./utils";

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

const generateSortProcessFromOpt = (opt: ResetOption) => {
  const array = randomArray(opt.nElem);
  return generateSortProcess(opt.sortVariant, array);
};

export interface IBitonicSortProps {
  width: number;
  height: number;
}

const BitonicSort: React.FC<IBitonicSortProps> = (props) => {
  const [sortProcess, setSortProcess] = React.useState(() => (
    generateSortProcessFromOpt(defaultOption)
  ));
  const [phase, setPhase] = React.useState(Phase.waiting);
  const [progress, setProgress] = React.useState(0);

  const sortStep = sortProcess.steps[progress];

  const hasPrev = sortStep.prevNetwork !== null;
  const hasNext = sortStep.nextNetwork !== null;

  const [playing, setPlaying] = React.useState(false);
  const handlePlayPauseClick = React.useCallback(() => {
    if (playing) {
      setPlaying(false);
    } else if (phase === Phase.waiting && hasNext) {
      setPlaying(true);
      setPhase(Phase.animationToNext);
    }
  }, [playing, phase, hasNext]);

  const handleStepBack = React.useCallback(() => {
    if (phase === Phase.waiting && hasPrev) {
      setPhase(Phase.animationToPrev);
    }
  }, [phase, hasPrev]);
  const handleStepForward = React.useCallback(() => {
    if (phase === Phase.waiting && hasNext) {
      setPhase(Phase.animationToNext);
    }
  }, [phase, hasNext]);
  const handleProgressChange = React.useCallback((progress: number) => {
    if (phase === Phase.waiting) {
      setProgress(progress);
    }
  }, [phase]);

  const handleTransitionEnd = React.useCallback(() => {
    switch (phase) {
      case Phase.animationToNext: {
        setPhase(Phase.animationFromPrev);
        setProgress((progress) => progress + 1);
        break;
      }
      case Phase.animationFromPrev: {
        if (hasNext && playing) {
          setPhase(Phase.animationToNext);
        } else {
          setPhase(Phase.waiting);
          setPlaying(false);
        }
        break;
      }
      case Phase.animationToPrev: {
        setPhase(Phase.animationFromNext);
        setProgress((progress) => progress - 1);
        break;
      }
      case Phase.animationFromNext: {
        setPhase(Phase.waiting);
        break;
      }
      case Phase.waiting: {
        break;
      }
      default: {
        throw new ExhaustiveCheckError(phase);
      } 
    }
  }, [phase, playing, hasNext]);

  const handleReset = React.useCallback((opt: ResetOption) => {
    if (phase !== Phase.waiting) {
      return;
    }
    setSortProcess(generateSortProcessFromOpt(opt));
    setPhase(Phase.waiting);
    setProgress(0);
  }, [phase]);

  return (
    <div>
      <SortCanvas
        width={props.width}
        height={props.height}
        sortStep={sortStep}
        phase={phase}
        onTransitionEnd={handleTransitionEnd}
      />
      <div className="controller">
        <div>
          N = {sortStep.array.length},
          Mode = {sortProcess.variant}
        </div>
        <StepController
          animating={phase !== Phase.waiting}
          onStepForward={handleStepForward}
          onStepBack={handleStepBack}
          playing={playing}
          onPlayPauseClick={handlePlayPauseClick}
          progress={progress}
          maxProgress={sortProcess.steps.length - 1}
          onProgressChange={handleProgressChange}
        />
        <OptionController
          canReset={phase === Phase.waiting}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};

export default BitonicSort;
