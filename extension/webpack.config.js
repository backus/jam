var webpack = require("webpack"),
  path = require("path"),
  env = require("./utils/env"),
  CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  WriteFilePlugin = require("write-file-webpack-plugin");

require("dotenv").config({
  path: path.resolve(__dirname, "./../backend/.env"),
});

// load the secrets
var alias = {};

var fileExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "eot",
  "otf",
  "svg",
  "ttf",
  "woff",
  "woff2",
];

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const processEnv = Object.keys(process.env)
  .filter((key) => /^REACT_APP_/i.test(key))
  .reduce(
    (env, key) => {
      env[key] = process.env[key];
      return env;
    },
    { NODE_ENV: process.env.NODE_ENV }
  );

processEnv["REACT_APP_ENVIRONMENT"] = "extension";

const stringifiedEnv = {
  "process.env": Object.keys(processEnv).reduce((env, key) => {
    env[key] = JSON.stringify(processEnv[key]);
    return env;
  }, {}),
};

var options = {
  mode: processEnv.NODE_ENV,
  entry: {
    popup: path.join(__dirname, "src", "js", "popup.tsx"),
    background: path.join(__dirname, "src", "js", "background.ts"),
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        // Match .ts and .tsx files
        test: /\.(?:tsx?|m?jsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "entry",
                    // To enable tree-shaking, we need to disable modules.
                    // See: https://wanago.io/2018/08/13/webpack-4-course-part-seven-decreasing-the-bundle-size-with-tree-shaking/
                    modules: false,
                    corejs: "3",
                  },
                ],
                "@babel/preset-react",
              ],
              plugins: [
                "lodash",
                "@babel/plugin-transform-runtime",
                require("babel-plugin-macros"),
              ],
            },
          },
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.json",
            },
          },
        ],
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
      },
      {
        test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
        loader: "file-loader?name=[name].[ext]",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      ...alias,
      "@client": path.join(__dirname, "client"),
    },
    extensions: [".ts", ".tsx", ".mjs", ".js", ".css", ".gql", ".graphql"],
  },
  node: {
    fs: "empty",
    module: "empty",
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ["!manifest.json"],
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(processEnv),
    new webpack.DefinePlugin(stringifiedEnv),
    new CopyWebpackPlugin([
      {
        from: "src/manifest.json",
        transform: function (content, path) {
          let manifest = JSON.parse(content.toString());
          if (process.env.NODE_ENV === "development") {
            // Use different colored icons so we don't accidentally mix up dev and prod
            Object.entries(manifest.icons).forEach(([key, value]) => {
              manifest.icons[key] = `icon-${key}-dev.png`;
            });

            manifest.browser_action.default_icon = "icon-34-dev.png";

            console.log(
              "Adding to manifest.externally_connectable for development!"
            );

            manifest.externally_connectable.matches.push("*://localhost:*/*");
            manifest.externally_connectable.matches.push(
              "*://jam.localhost:*/*"
            );
          }
          // generates the manifest file using the package.json informations
          return Buffer.from(
            JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...manifest,
            })
          );
        },
      },
    ]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "popup.html"),
      filename: "popup.html",
      chunks: ["popup"],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "background.html"),
      filename: "background.html",
      chunks: ["background"],
    }),
    new WriteFilePlugin(),
  ],
};

if (env.ENABLE_SOURCE_MAPS) {
  console.log("Enabling source maps!");
  options.devtool = "cheap-module-eval-source-map";
}

module.exports = options;
