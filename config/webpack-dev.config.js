/**
 * @license
 *
 * Copyright IBM Corp. 2021
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';
const path = require('path');
const Webpack = require('webpack');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

/**
 * Gets the initial webpack configuration with dev options passed in
 *
 * @type {{devtool: *, output: {path: string, filename: string}, entry: {}, resolve: {modules: [string]}, plugins: (*|webpack.DefinePlugin)[], module: {rules}}}
 * @private
 */
const _webpackConfig = require('./webpack.config-helper')({
  isProduction: false,
  devtool: 'cheap-eval-source-map',
  buildRTL: false,
});

_webpackConfig.mode = 'development';

_webpackConfig.plugins.push(new Webpack.HotModuleReplacementPlugin());

_webpackConfig.module.rules.push({
  test: /\.js$/,
  use: 'eslint-loader',
  exclude: /node_modules/,
});

_webpackConfig.devServer = {
  port: 8081,
  static: {
    directory: path.join(__dirname, '../dist'),
  },
  compress: true,
  hot: false,
};

_webpackConfig.plugins.push(
  new BrowserSyncPlugin(
    {
      host: 'localhost',
      port: 3000,
      proxy: 'http://localhost:8081/',
      startPath: 'en-us/',
      files: [
        {
          match: ['**/*.hbs'],
          fn: function (event, file) {
            if (event === 'change' || event === 'add' || event === 'unlink') {
              const bs = require('browser-sync').get('bs-webpack-plugin');
              bs.reload();
            }
          },
        },
      ],
    },
    {
      reload: false,
    }
  )
);

module.exports = _webpackConfig;
