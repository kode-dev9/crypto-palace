const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpack = require('webpack');

var libraryName = 'library';
var outputFile = libraryName + '.js';


module.exports = {
  entry: './public/pre-compilesJs/main.js',
  mode: "production",
  output: {
    path: path.resolve(__dirname, "public/src/js"),
    filename: 'main-bundle.min.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        loader: "babel-loader",
        options: {
          presets: ["babel-preset-env"]
        },
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },


  plugins: [new VueLoaderPlugin()
  ],
  // webpack outputs performance related stuff in the browser.
  performance: {
    hints: false,
  },
};
