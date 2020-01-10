// Support TS requires using our server tsconfig. Otherwise, models don't work
import * as models from "./../server/models";
import * as queues from "./../server/queue";

const repl = require("repl");

/**
 * Inject models into REPL context
 */

// Add values to this object if you want them to be available in the console
const customReplContext: { [k: string]: any } = {};

// Merge all model exports in via Object.assign so we don't have to update this file when we add new models

Object.assign(customReplContext, models);
Object.assign(customReplContext, queues);

// List of injected variables for the welcome message
const injectedValuesList = Object.keys(customReplContext)
  .map((key) => `   - ${key}`)
  .join("\n");

console.log(`Values injected into REPL:\n`);
console.log(injectedValuesList);
console.log();

/**
 * Initialize REPLs
 */

const replSession = repl.start({
  prompt: `jam (${process.env.NODE_ENV})> `,
});

Object.keys(customReplContext).forEach((key: string) => {
  // replSession.context already has things in it like `console` so you can do `console.log`
  // As a precaution, we should throw an error if we accidentally clobber
  if (key in replSession.context) {
    throw new Error(
      `${key} is already set in replSession.context! You'll need to give it another name`
    );
  }

  replSession.context[key] = (customReplContext as any)[key];
});
