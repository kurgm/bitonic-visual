import * as React from "react";

import { SortVariant } from "./enums";

const nElem_options = [2, 4, 8, 16, 32, 64, 128, 256, 512];

export interface ResetOption {
  nElem: number;
}

export interface OptionControllerProps {
  disabled: boolean;
  mode: SortVariant;
  onModeChange: (mode: SortVariant) => void;
  canReset: boolean;
  onReset: (opt: ResetOption) => void;
}

const OptionController: React.FC<OptionControllerProps> = (props) => {
  const { onModeChange, onReset } = props;

  const [nElem, setNElem] = React.useState(32);

  const handleNElemChange = React.useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newNElem = parseInt(evt.currentTarget.value, 10);
    setNElem(newNElem);
  }, []);
  const handleModeChange = React.useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = parseInt(evt.currentTarget.value, 10) as SortVariant;
    onModeChange(newMode);
  }, [onModeChange]);
  const handleReset = React.useCallback(() => {
    onReset({
      nElem,
    });
  }, [nElem, onReset]);

  return (
    <div>
      <label>
        N =
        <select onChange={handleNElemChange} value={nElem}>
          {nElem_options.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      <label>
        Mode:
        <select
          onChange={handleModeChange} value={props.mode}
          disabled={props.disabled}
        >
          <option value={SortVariant.monotonic}>flip</option>
          <option value={SortVariant.bitonic}>shift</option>
        </select>
      </label>
      <button onClick={handleReset} disabled={!props.canReset}>reset</button>
    </div>
  );
};

export default OptionController;
