import * as React from "react";

import { BitonicNetwork } from "./bitonicSortNetwork";
import { Phase } from "./enums";

const getTransforms = (nElem: number, network: BitonicNetwork): React.CSSProperties[] => {
  const result = new Array<React.CSSProperties>(nElem).fill({});
  for (const [smallIdx, largeIdx] of network.pairs) {
    if (network.orderType === "flip") {
      const origin = (largeIdx + smallIdx + 1) / 2;
      result[smallIdx] = {
        transform: "rotateY(180deg)",
        transformOrigin: `${origin}px 50%`
      };
    } else {
      const shiftAmount = largeIdx - smallIdx;
      result[smallIdx] = {
        transform: `translateX(${shiftAmount}px)`,
      };
    }
  }
  return result;
};

export interface BitonicSortStep {
  array: number[];
  nextNetwork: BitonicNetwork | null;
  prevNetwork: BitonicNetwork | null;
}

export interface SortCanvasProps {
  height: number;
  width: number;
  phase: Phase;
  sortStep: BitonicSortStep;
  onTransitionEnd: () => void;
}

const SortCanvas: React.FC<SortCanvasProps> = (props) => {
  const { width, height, sortStep, phase, onTransitionEnd } = props;
  const array = sortStep.array;
  const network = phase === Phase.animationOut ? sortStep.prevNetwork : sortStep.nextNetwork;
  const nElem = array.length;
  const maxValue = Math.max(...array);
  const csses = React.useMemo(() => (
    network ? getTransforms(nElem, network) : null
  ), [nElem, network]);
  return (
    <svg className="canvas" height={height} width={width}>
      <g transform={`translate(0,${height}) scale(${width / nElem},${-height / maxValue})`}>
        {array.map((value, i) => {
          const { transform = undefined, ...css } = csses ? csses[i] : {};
          return (
            <rect
              key={i}
              className="bar"
              x={i}
              y={0}
              width={1}
              height={value}
              style={{
                ...(phase === Phase.animationIn) && { transform },
                ...css,
              }}
              {...(i === 0) && { onTransitionEnd }}
            />
          );
        })}
      </g>
    </svg>
  )
};

export default SortCanvas;
