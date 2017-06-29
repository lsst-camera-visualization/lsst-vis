var debug = process.env.NODE_ENV !== "production";
var webpack = require("webpack");

module.exports = {
  context: __dirname + "/src",
  devtool: debug ? "inline-sourcemap" : null,
  entry: {
      "client": "./js/client.js"
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modulues)/,
        loader: "babel-loader",
        query: {
          presets: ["react", "es2015"],
          plugins: ["react-html-attrs", "transform-class-properties", "transform-decorators-legacy", "transform-object-rest-spread"]
        }
      }
    ]
  },
  output: {
    path: __dirname + "/src/",
    filename: "[name].min.js"
  },
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};
