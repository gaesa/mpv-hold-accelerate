const path = require("path");

module.exports = {
  mode: "production",
  target: ["web", "es5"],
  entry: "./src/hold-accelerate.ts",
  output: {
    filename: "hold-accelerate.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
