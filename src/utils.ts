export class ExhaustiveCheckError extends Error {
  constructor(value: never) {
    super(value);
  }
}
