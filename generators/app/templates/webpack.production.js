'use strict';
var path = require('path');
var webpack = require('webpack');

var config = {
  entry: {
    main: './src/js/main.js',
    'main-sp': './src/js/sp/main.js'
  },
  output: {
    filename: '[name].min.js',
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
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {warnings: false},
      comments: function (astNode, comment) {
        return comment.type !== 'comment1';
        //return /^!\*?/.test(comment.value) ||
        //       /(@preserve|@license|Copyright)/.test(comment.value);
      },
      mangle: false
    })
  ]
};

module.exports = config;
