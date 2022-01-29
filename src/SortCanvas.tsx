import * as React from "react";

import { BitonicNetwork } from "./bitonicSortNetwork";
import { Phase } from "./enums";

const getTransforms = (nElem: number, network: BitonicNetwork): React.CSSProperties[] => {
  const result = new Array<React.CSSProperties>(nElem).fill({});
  for (const [smallIdx, largeIdx] of network.pairs) {
    if (network.orderType === "flip") {
      const originOffset = (largeIdx - smallIdx + 1) / 2;
      result[smallIdx] = {
        transform: "rotateY(180deg)",
        transformOrigin: `${originOffset * 100}% 50%`
      };
    } else {
      const shiftAmount = largeIdx - smallIdx;
      result[smallIdx] = {
        transform: `translateX(${shiftAmount * 100}%)`,
      };
    }
  }
  return result;
};

export interface SortCanvasProps {
  height: number;
  width: number;
  array: number[];
  phase: Phase;
  network: BitonicNetwork | undefined;
  onTransitionEnd: () => void;
}

const SortCanvas: React.FC<SortCanvasProps> = (props) => {
  const { width, height, array, phase, network, onTransitionEnd } = props;
  const n = array.length;
  const binWidth = width / n;
  const maxValue = Math.max(...array);
  const csses = React.useMemo(() => (
    network ? getTransforms(n, network) : null
  ), [n, network]);
  return (
    <div className="canvas" style={{
      height: `${height}px`,
      width: `${width}px`,
    }}>
      {array.map((n, i) => {
        const { transform = undefined, ...css } = csses ? csses[i] : {};
        return (
          <div
            key={i}
            className="bar"
            style={{
              bottom: "0px",
              height: `${height / maxValue * n}px`,
              left: `${binWidth * i}px`,
              width: `${binWidth}px`,
              ...(phase === Phase.animationIn) && { transform },
              ...css,
            }}
            {...(i === 0) && { onTransitionEnd }}
          />
        );
      })}
    </div>
  )
};

export default SortCanvas;
