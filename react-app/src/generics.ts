import { ApiReturnType } from "./graphqlApi";
import * as _ from "lodash";

export type Unboxed<T> = T extends (infer U)[] ? U : T;

export type Replace<Obj, K extends keyof Obj, T> = Omit<Obj, K> & Record<K, T>;
export type ReplaceEach<Arr, K extends keyof Unboxed<Arr>, T> = Replace<
  Unboxed<Arr>,
  K,
  T
>[];

// expands object types one level deep
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively
export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;
