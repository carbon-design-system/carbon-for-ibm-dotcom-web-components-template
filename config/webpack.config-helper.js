'use strict';
const path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const rtlcss = require('rtlcss');

const dotenv = require('dotenv').config({ path: __dirname + '/../.env' });

/**
 * Flag to enable RTL
 * @type {boolean}
 */
const enableRTL = dotenv.parsed && dotenv.parsed.ENABLE_RTL === 'true';

const languages = {
  '': require('../src/locales/en.json'),
};

const pages = require('../src/pages');
let renderedPages = [];
let chunkEntries = {};
for (let i = 0; i < pages.length; i++) {
  let page = Object.assign({}, pages[i]);
  Object.keys(languages).map((language) => {
    renderedPages.push(
      new HtmlWebpackPlugin({
        hash: true,
        inject: true,
        template: page.template,
        filename: './' + language + page.output,
        data: languages[language].translation[page.translationKey],
        chunks: page.chunks,
        title: page.content.title,
        description: page.content.description,
        altlangRootPath:
          (dotenv.parsed && dotenv.parsed.ALTLANG_ROOT_PATH) || '/',
        enableRTL: enableRTL,
      })
    );
    chunkEntries = Object.assign({}, chunkEntries, page.chunkEntry);
  });
}

module.exports = (options) => {
  const dest = path.join(__dirname, '../dist');

  let webpackConfig = {
    devtool: options.devtool,
    entry: chunkEntries,
    output: {
      path: dest,
      filename: './assets/js/[name].js',
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: './src/assets/images', to: './assets/images' },
      ]),
      // new CopyWebpackPlugin([
      //   {from: './src/assets/fonts', to: './assets/fonts'}
      // ]),
      new MiniCssExtractPlugin({
        filename: './assets/css/[name].css',
      }),
      new Webpack.DefinePlugin({
        'process.env': JSON.stringify(
          Object.assign({}, dotenv.parsed || {}, {
            NODE_ENV: options.isProduction ? 'production' : 'development',
          })
        ),
      }),
    ],
    resolve: {
      modules: ['node_modules'],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.hbs$/,
          loader: 'handlebars-loader',
          options: {
            partialDirs: [
              path.join(__dirname, '../src', 'layouts'),
              path.join(__dirname, '../src', 'pages'),
            ],
            precompileOptions: {
              knownHelpersOnly: false,
            },
            runtime: path.resolve(__dirname, '../config/handlebars'),
          },
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: './assets/fonts',
              },
            },
          ],
        },
        {
          test: /\.(gif|jpg|png)$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: './assets/images',
          },
        },
      ],
    },
  };

  webpackConfig.optimization = {
    ...webpackConfig.optimization,
    splitChunks: {
      chunks: 'all',
      minSize: 30 * 1024,
      maxSize: 1024 * 1024,
    },
    minimizer: [
      new TerserPlugin({
        sourceMap: options.isProduction,
        terserOptions: {
          mangle: false,
        },
      }),
    ],
  };

  const styleLoaders = [
    {
      loader: 'css-loader',
      options: {
        importLoaders: 2,
        sourceMap: options.isProduction,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => {
          const autoPrefixer = require('autoprefixer')({
            overrideBrowserslist: ['last 1 version', 'ie >= 11'],
          });
          return enableRTL ? [autoPrefixer, rtlcss] : [autoPrefixer];
        },
        sourceMap: options.isProduction,
      },
    },
  ];

  webpackConfig.module.rules.push({
    test: /\.scss$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
      },
      ...styleLoaders,
      {
        loader: options.isProduction ? 'sass-loader' : 'fast-sass-loader',
        options: {
          includePaths: [
            path.resolve(__dirname, '..', 'node_modules'),
            path.resolve(__dirname, '../../../', 'node_modules'),
          ],
          data: `
              $feature-flags: (
                enable-css-custom-properties: true
              );
            `,
        },
      },
    ],
  });

  if (options.isProduction) {
    webpackConfig.plugins.push(
      new CleanWebpackPlugin(['../dist'], {
        verbose: true,
        dry: false,
      })
    );
  } else {
    webpackConfig.plugins.push(new Webpack.HotModuleReplacementPlugin());

    webpackConfig.module.rules.push({
      test: /\.js$/,
      use: 'eslint-loader',
      exclude: /node_modules/,
    });

    webpackConfig.devServer = {
      port: options.port,
      contentBase: dest,
      historyApiFallback: true,
      compress: options.isProduction,
      inline: !options.isProduction,
      hot: !options.isProduction,
      stats: {
        chunks: false,
      },
    };

    webpackConfig.plugins.push(
      new BrowserSyncPlugin(
        {
          host: 'localhost',
          port: 3000,
          proxy: 'http://localhost:8081/',
          files: [
            {
              match: ['**/*.hbs'],
              fn: function (event, file) {
                if (
                  event === 'change' ||
                  event === 'add' ||
                  event === 'unlink'
                ) {
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
  }

  webpackConfig.plugins = webpackConfig.plugins.concat(renderedPages);

  return webpackConfig;
};
