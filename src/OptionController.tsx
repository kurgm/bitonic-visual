import * as React from "react";

import { SortVariant, sortVariants } from "./enums";

const nElem_options = [2, 4, 8, 16, 32, 64, 128, 256, 512];

export interface ResetOption {
  nElem: number;
  sortVariant: SortVariant;
}

export const defaultOption: ResetOption = {
  nElem: 32,
  sortVariant: "sawtooth",
};

export interface OptionControllerProps {
  canReset: boolean;
  onReset: (opt: ResetOption) => void;
}

type OptionDesc<T extends string | number> =
  | T
  | React.OptionHTMLAttributes<HTMLOptionElement> & { value: T; };

const useSelect = <T extends string | number>(
  initialValue: T | (() => T),
  options: readonly OptionDesc<T>[],
  props?: React.SelectHTMLAttributes<HTMLSelectElement>,
): [value: T, element: JSX.Element] => {

  const [value, setValue] = React.useState<T>(initialValue);
  const onChange = React.useCallback((evt: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = evt.currentTarget.value;
    setValue((oldValue) => (typeof oldValue === "number" ? Number(newValue) : newValue) as T);
  }, []);

  const element = (
    <select {...props} value={value} onChange={onChange}>
      {options.map((option, i) => {
        if (typeof option !== "object") {
          option = {
            children: option,
            value: option,
          };
        }
        return (
          <option key={i} {...option} />
        );
      })}
    </select>
  );
  return [value, element];
};

const OptionController: React.FC<OptionControllerProps> = (props) => {
  const { onReset } = props;

  const [nElem, nElemSelect] = useSelect(defaultOption.nElem, nElem_options);
  const [sortVariant, sortVariantSelect] = useSelect(defaultOption.sortVariant, sortVariants);

  const handleReset = React.useCallback(() => {
    onReset({
      nElem,
      sortVariant,
    });
  }, [nElem, sortVariant, onReset]);

  return (
    <div>
      <label>
        N = {nElemSelect}
      </label>
      <label>
        Mode: {sortVariantSelect}
      </label>
      <button onClick={handleReset} disabled={!props.canReset}>reset</button>
    </div>
  );
};

export default OptionController;
