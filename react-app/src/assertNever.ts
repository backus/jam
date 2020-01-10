export function assertNever(...args: never[]): never {
  throw new Error(
    "Unexhaustive case statement! assertNever was called with " +
      args.toString()
  );
}
