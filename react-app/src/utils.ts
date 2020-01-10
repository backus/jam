import { parseISO, isValid } from "date-fns";
import * as _ from "lodash";

import { FieldValidator } from "final-form";
export const parseISOTime = (value: string): Date => {
  if (!value.includes("T")) throw new Error("Expected an ISO8601 time");
  const date = parseISO(value);
  if (!isValid(date)) throw new Error("Failed to parse date string!");

  return date;
};

export const assertInvariant = (checkFn: () => boolean) => {
  if (!checkFn())
    throw new Error(`Failed invariant check! ${checkFn.toString()}`);
};

export const possessive = (name: string) =>
  name.endsWith("s") ? `${name}'` : `${name}'s`;

export const indefiniteArticle = (noun: string) =>
  ["a", "e", "i", "o", "u"].includes(noun[0].toLowerCase()) ? "an" : "a";

export const isFilled = (value: string) => !_.isEmpty(value.trim());
export const isEmail = (value: string) => !!value.match(/^.+@.+\..+$/);

export const formValidations = {
  compose: (...validators: Function[]) => (value: unknown) =>
    validators.reduce(
      (error, validator) => error || validator(value),
      undefined
    ),
  not: (exclude: string) => (value: unknown) =>
    exclude === value ? "Invalid value" : undefined,
  domain(val: unknown) {
    if (typeof val !== "string") return "Not a string";
    if (val.match(/^\s*$/)) return "Type something";

    // Match "foo.com", "sub.foo.com", "sub.foo.co.uk", etc
    if (!val.match(/^[\w-]+\.[\w-]+(\.[\w-]+)*$/)) return "Invalid domain";

    return undefined;
  },
  notBlank(val: unknown) {
    if (typeof val !== "string") return "Not a string";
    if (val.match(/^\s*$/)) return "Type something";

    return undefined;
  },
  email(val: unknown) {
    if (typeof val !== "string") return "Not a string";
    if (val.match(/^\s*$/)) return "Type something";
    if (!isEmail(val)) return "Type in your email";
    if (/\s/.test(val)) return "Email shouldn't contain whitespace";

    return undefined;
  },
};
