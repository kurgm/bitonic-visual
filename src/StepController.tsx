import * as React from "react";

export interface StepControllerProps {
  animating: boolean;
  onStep: () => void;
  playing: boolean;
  onPlayPauseClick: () => void;
}

const StepController: React.FC<StepControllerProps> = (props) => {
  return (
    <div>
      <button onClick={props.onStep} disabled={props.animating}>step</button>
      <button
        disabled={!props.playing && props.animating}
        onClick={props.onPlayPauseClick}
      >
        {props.playing ? "pause" : "play"}
      </button>
    </div>
  );
};

export default StepController;