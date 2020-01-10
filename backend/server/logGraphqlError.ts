import chalk from "chalk";
import { GraphQLError } from "graphql";

export const logGraphqlError = (error: GraphQLError) => {
  if (!error.source || !error.locations) {
    console.error("GraphQL error occured but we don't have source?");
    return;
  }

  const { line } = error.locations[0];
  const source = error.source.body.split("\n");
  source[line - 1] = chalk.bgYellowBright.whiteBright(source[line - 1]);
  const highlightedSource = source.join("\n");

  const msg = `

${chalk.bgRed.white(
  `[GraphQL Error] ${error.originalError?.message || "No original error?"}`
)}

• Path: ${chalk.bold.yellow(error.path?.join("/"))}
• Offending source:

${highlightedSource}

${chalk.bgRed.white(
  `[GraphQL Error] ${error.originalError?.message || "No original error?"}`
)}`;

  console.error(msg);
};
