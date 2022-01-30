import * as React from "react";

export interface StepControllerProps {
  animating: boolean;
  onStepForward: () => void;
  onStepBack: () => void;
  playing: boolean;
  onPlayPauseClick: () => void;
}

const StepController: React.FC<StepControllerProps> = (props) => {
  return (
    <div>
      <button onClick={props.onStepBack} disabled={props.animating}>&lt; step</button>
      <button
        disabled={!props.playing && props.animating}
        onClick={props.onPlayPauseClick}
      >
        {props.playing ? "pause" : "play"}
      </button>
      <button onClick={props.onStepForward} disabled={props.animating}>step &gt;</button>
    </div>
  );
};

export default StepController;