'use strict';
var path = require('path');
var webpack = require('webpack');

var config = function () {
  return {
    entry: {
      main: './src/js/main.js',
      'main-sp': './src/js/sp/main.js'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'public/js')
    },
    module: {
      rules: [
        {test: /\.(js|jsx)$/, use: 'babel-loader'}
      ]
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module) {
          return module.context && /node_modules/.test(module.context);
        }
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest'
      })
    ]
  };
};

module.exports = config;
