import * as React from "react";

export interface StepControllerProps {
  canStep: boolean;
  onStep: () => void;
  canReset: boolean;
  onReset: () => void;
  nonstop: boolean;
  onNonstopChange: (value: boolean) => void;
}

const StepController: React.FC<StepControllerProps> = (props) => {
  const { onNonstopChange } = props;
  const handleNonstopChkboxChange = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    onNonstopChange(evt.currentTarget.checked);
  }, [onNonstopChange]);

  return (
    <div>
      <button onClick={props.onStep} disabled={!props.canStep}>step</button>
      <button onClick={props.onReset} disabled={!props.canReset}>reset</button>
      <label>
        <input type="checkbox" onChange={handleNonstopChkboxChange} checked={props.nonstop} />
        Non-stop
      </label>
    </div>
  );
};

export default StepController;