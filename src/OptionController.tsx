import * as React from "react";

import { SortVariant, sortVariants } from "./enums";

const nElem_options = [2, 4, 8, 16, 32, 64, 128, 256, 512];

export interface ResetOption {
  nElem: number;
  sortVariant: SortVariant;
}

export interface OptionControllerProps {
  canReset: boolean;
  onReset: (opt: ResetOption) => void;
}

const OptionController: React.FC<OptionControllerProps> = (props) => {
  const { onReset } = props;

  const [nElem, setNElem] = React.useState(32);
  const [sortVariant, setSortVariant] = React.useState<SortVariant>("sawtooth");

  const handleNElemChange = React.useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newNElem = parseInt(evt.currentTarget.value, 10);
    setNElem(newNElem);
  }, []);
  const handleVariantChange = React.useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = evt.currentTarget.value as SortVariant;
    setSortVariant(newMode);
  }, []);
  const handleReset = React.useCallback(() => {
    onReset({
      nElem,
      sortVariant,
    });
  }, [nElem, sortVariant, onReset]);

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
        <select onChange={handleVariantChange} value={sortVariant}>
          {sortVariants.map((sortVariant) => (
            <option key={sortVariant} value={sortVariant}>{sortVariant}</option>
          ))}
        </select>
      </label>
      <button onClick={handleReset} disabled={!props.canReset}>reset</button>
    </div>
  );
};

export default OptionController;
