export const dataKinds = [
  "random",
] as const;

export type DataKind = (typeof dataKinds)[number];

const randomArray = (num: number) => {
  const arr: Array<[number, number]> = [];
  for (let i = 1; i <= num; i++) {
    arr.push([Math.random(), i]);
  }
  return arr.sort((a, b) => a[0] - b[0]).map((e) => e[1]);
};

export const generateData = (nElem: number, dataKind: DataKind): number[] => {
  switch (dataKind) {
    case "random": {
      return randomArray(nElem);
    }
  }
};
