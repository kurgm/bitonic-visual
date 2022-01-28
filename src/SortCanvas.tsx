import * as React from "react";
import { Phase } from "./enums";

export type BinTransformShift = {
  type: "shift";
  amount: number;
};
export type BinTransformFlip = {
  type: "flip";
  originOffset: number;
};
export type BinTransform = BinTransformShift | BinTransformFlip | null;

const binTransformCss = (binWidth: number, transform: BinTransform): React.CSSProperties => {
  if (transform === null) {
    return {};
  }
  switch (transform.type) {
    case "shift": {
      return {
        transform: `translateX(${transform.amount * binWidth}px)`,
      };
    }
    case "flip": {
      return {
        transform: "rotateY(180deg)",
        transformOrigin: `${transform.originOffset * binWidth}px 50%`
      };
    }
  }
};

export interface SortCanvasProps {
  height: number;
  width: number;
  array: number[];
  phase: Phase;
  transforms: BinTransform[];
  onTransitionEnd: () => void;
}

const SortCanvas: React.FC<SortCanvasProps> = (props) => {
  const { width, height, array, phase, transforms, onTransitionEnd } = props;
  const n = array.length;
  const binWidth = width / n;
  const maxValue = Math.max(...array);
  const csses = React.useMemo(() => (
    transforms.map((transform) => binTransformCss(binWidth, transform))
  ), [binWidth, transforms]);
  return (
    <div className="canvas" style={{
      height: `${height}px`,
      width: `${width}px`,
    }}>
      {array.map((n, i) => {
        const { transform, ...css } = csses[i];
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
