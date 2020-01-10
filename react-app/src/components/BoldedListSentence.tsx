import * as React from "react";
import { assertNever } from "./../assertNever";

export const BoldedListSentence: React.FC<{ words: string[] }> = ({
  words,
}) => {
  if (words.length === 0)
    throw new Error("Shouldn't be called with empty list");
  if (words.length === 1) return <strong>{words[0]}</strong>;

  if (words.length === 2)
    return (
      <>
        <strong>{words[0]}</strong> and <strong>{words[1]}</strong>
      </>
    );

  if (words.length > 2)
    return (
      <>
        {words
          .slice(0, -1)
          .map<React.ReactNode>((login) => <strong>{login}</strong>)
          .reduce((prev, curr) => [prev, ", ", curr])}
        , and <strong>{words[words.length - 1]}</strong>
      </>
    );

  return assertNever();
};
