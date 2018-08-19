const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpack = require('webpack');

var libraryName = 'library';
var outputFile = libraryName + '.js';


module.exports = {
  entry: {
    'main-bundle': './public/pre-compilesJs/main.js',
    'chart': './public/pre-compilesJs/independent/chart.js',
    'vendor': './public/pre-compilesJs/vendors/index',
    'dashboard': './public/pre-compilesJs/independent/dashboard.js'
  },
  mode: "production",
  output: {
    path: path.resolve(__dirname, "public/src/js"),
    filename: '[name].min.js',
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
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
            loader: 'url-loader',
            options: {
                limit: 8000, // Convert images < 8kb to base64 strings
                name: 'images/[hash]-[name].[ext]'
            }
        }]
    },
      {
        test: /\.(otf|eot|svg|ttf|woff)$/,
        loader: 'url-loader?limit=8192'
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
