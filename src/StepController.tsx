import * as React from "react";

export interface StepControllerProps {
  animating: boolean;
  onStepForward: () => void;
  onStepBack: () => void;
  playing: boolean;
  onPlayPauseClick: () => void;
  progress: number;
  maxProgress: number;
  onProgressChange: (progress: number) => void;
}

const StepController: React.FC<StepControllerProps> = (props) => {
  const { onProgressChange } = props;
  const handleProgressChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    onProgressChange(evt.currentTarget.valueAsNumber);
  }, [onProgressChange]);
  return (
    <div>
      <button
        onClick={props.onStepBack}
        disabled={props.animating || props.progress <= 0}
      >&lt; step</button>
      <button
        disabled={!props.playing && props.animating}
        onClick={props.onPlayPauseClick}
      >
        {props.playing ? "pause" : "play"}
      </button>
      <button
        onClick={props.onStepForward}
        disabled={props.animating || props.progress >= props.maxProgress}
      >step &gt;</button>
      <input type="range"
        value={props.progress}
        min={0}
        max={props.maxProgress}
        step={1}
        onChange={handleProgressChange}
        readOnly={props.animating}
      />
      {props.progress} / {props.maxProgress}
    </div>
  );
};

export default StepController;