const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    './lib/index.js'
  ],
  devtool: 'inline-source-map',
  resolve: {
    modules: [
      'node_modules',
      'src'
    ],
    extensions: [ '.js' ],
  },
  output: {
    filename: 'todo.bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  optimization: {
    usedExports: true
  },
  mode: 'production'
};