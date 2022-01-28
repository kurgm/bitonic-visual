import * as React from "react";

import { SortVariant } from "./enums";

const nElem_options = [2, 4, 8, 16, 32, 64, 128, 256, 512];

interface OptionControllerProps {
  disabled: boolean;
  nElem: number;
  onNElemChange: (nElem: number) => void;
  mode: SortVariant;
  onModeChange: (mode: SortVariant) => void;
}

const OptionController: React.FC<OptionControllerProps> = (props) => {
  const { onNElemChange, onModeChange } = props;
  const handleNElemChange = React.useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newNElem = parseInt(evt.currentTarget.value, 10);
    onNElemChange(newNElem);
  }, [onNElemChange]);
  const handleModeChange = React.useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = parseInt(evt.currentTarget.value, 10) as SortVariant;
    onModeChange(newMode);
  }, [onModeChange]);

  return (
    <div>
      <label>
        N =
        <select onChange={handleNElemChange} value={props.nElem}>
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
    </div>
  );
};

export default OptionController;
