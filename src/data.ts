export const dataKinds = [
  "shuffle",
  "ascending",
  "descending",
  "nearly-sorted",
  "shuffled skewed",
  "few unique",
  "sorted+random",
] as const;

export type DataKind = (typeof dataKinds)[number];

// Generates [1, 2, ..., nElem]
const seq = (nElem: number) => Array.from({ length: nElem }, (_, i) => i + 1);

const shuffleArray = (array: number[]) => {
  return array
    .map((value) => ({
      key: Math.random(),
      value,
    }))
    .sort((a, b) => a.key - b.key)
    .map(({ value }) => value);
};

export const generateData = (nElem: number, dataKind: DataKind): number[] => {
  switch (dataKind) {
    case "shuffle": {
      return shuffleArray(seq(nElem));
    }
    case "ascending": {
      return seq(nElem);
    }
    case "descending": {
      return seq(nElem).reverse();
    }
    case "nearly-sorted": {
      const k = nElem ** 0.5;
      return seq(nElem)
        .map((value, i) => ({
          key: i + k * Math.random(),
          value,
        }))
        .sort((a, b) => a.key - b.key)
        .map(({ value }) => value);
    }
    case "shuffled skewed": {
      const array = seq(nElem).map((elem) => {
        // -1 <= x <= 1
        const x = ((elem - 1) / (nElem - 1)) * 2 - 1;
        return ((x ** 3 + 1) / 2) * (nElem - 1) + 1;
      });
      return shuffleArray(array);
    }
    case "few unique": {
      const k = Math.floor(nElem ** 0.5);
      const array = seq(nElem).map(
        (elem) => Math.floor(((elem - 1) / nElem) * k) + 1,
      );
      return shuffleArray(array);
    }
    case "sorted+random": {
      const array1 = [],
        array2 = [];
      for (const item of seq(nElem)) {
        if (Math.random() < 0.1) {
          array2.push(item);
        } else {
          array1.push(item);
        }
      }
      return array1.concat(shuffleArray(array2));
    }
  }
};
