'use strict';
const path = require('path');
const fs = require('fs');
const Webpack = require('webpack');
const sass = require('node-sass');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const rtlcss = require('rtlcss');

const dotenv = require('dotenv').config({ path: __dirname + '/../.env' });

/**
 * Language codes that will enable RTL
 *
 * @type {string[]}
 */
const rtlLangs = ['ar'];

/**
 * Sets the default language
 *
 * @type {string|string}
 */
const defaultLang = (dotenv.parsed && dotenv.parsed.LANG_DEFAULT) || 'en-us';

/**
 * This sets the alt language directory
 *
 * @type {string|string}
 */
const altLang = (dotenv.parsed && dotenv.parsed.ALTLANG_ROOT_PATH) || '';

/**
 * Returns the list of directories in a given directory
 *
 * @param {string} dir Directory string
 * @returns {string[]} List of sub-directories
 * @private
 */
function _getDirectories(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

/**
 * Gets all of the language files in the folder
 * @private
 */
function _getLanguageFiles() {
  const languages = {};
  const dirpath = path.join(__dirname, '../src/locales');
  const directories = _getDirectories(dirpath);

  if (directories.length === 1) {
    languages[''] = {};
    const lang = directories[0];
    fs.readdirSync(`${dirpath}/${lang}`).forEach((file) => {
      const page = file.slice(0, -5);
      const content = fs.readFileSync(`${dirpath}/${lang}/${file}`, 'utf8');
      languages[''][page] = JSON.parse(content);
      languages[''][page].base_lang = lang;
      languages[''][page].base_country = lang.slice(-2);
    });
  } else {
    directories.forEach((lang) => {
      languages[lang] = {};
      fs.readdirSync(`${dirpath}/${lang}`).forEach((file) => {
        const page = file.slice(0, -5);
        const content = fs.readFileSync(`${dirpath}/${lang}/${file}`, 'utf8');
        languages[lang][page] = JSON.parse(content);
        languages[lang][page].base_lang = lang;
        languages[lang][page].base_country = lang.slice(-2);
        languages[lang][page].base_languages = directories;
        languages[lang][page].base_lang_default = defaultLang;
      });
    });
  }

  return languages;
}

/**
 * Stores the language data
 */
const languages = _getLanguageFiles();

/**
 * Generates the page entries for webpack
 *
 * @returns {{renderedPages: *[], chunkEntries: {}}}
 * @private
 */
function _renderPageEntries(options) {
  const pages = require('../src/pages');
  let renderedPages = [];
  let chunkEntries = {};
  for (let i = 0; i < pages.length; i++) {
    let page = Object.assign({}, pages[i]);
    Object.keys(languages).map((language) => {
      const lc = language.substring(0, 2);
      const enableRTL = rtlLangs.indexOf(lc) !== -1;

      // Will only build the LTR or RTL pages separately
      if (
        (options.buildRTL && enableRTL) ||
        (!options.buildRTL && !enableRTL)
      ) {
        renderedPages.push(
          new HtmlWebpackPlugin({
            hash: true,
            inject: false,
            template: page.template,
            filename: `./${language}/${page.output}`,
            data: languages[language][page.translationKey],
            chunks: page.chunks,
            title: page.content.title,
            description: page.content.description,
            altlangRootPath: altLang,
            enableRTL: enableRTL,
          })
        );
      }

      chunkEntries = Object.assign({}, chunkEntries, page.chunkEntry);
    });
  }

  return { renderedPages, chunkEntries };
}

module.exports = (options) => {
  const pages = _renderPageEntries(options);

  const dest = path.join(__dirname, '../dist');

  const hostPseudo = require('../tools/postcss-fix-host-pseudo')();
  const autoprefixer = require('autoprefixer')({
    overrideBrowserslist: ['last 1 version', 'ie >= 11'],
  });

  const postcssPlugins = options.buildRTL
    ? [rtlcss, hostPseudo, autoprefixer]
    : [hostPseudo, autoprefixer];

  const webpackPlugins = [
    new MiniCssExtractPlugin({
      filename: options.buildRTL
        ? './assets/css/[name].rtl.css'
        : './assets/css/[name].css',
    }),
    new Webpack.DefinePlugin({
      'process.env': JSON.stringify(
        Object.assign({}, dotenv.parsed || {}, {
          NODE_ENV: options.isProduction ? 'production' : 'development',
        })
      ),
    }),
  ];

  // only copy assets during LTR build
  if (!options.buildRTL) {
    webpackPlugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: './src/assets',
            to: './assets',
            globOptions: {
              ignore: ['**/scss/**/*.scss'],
            },
          },
        ],
      })
    );
  }

  // replace .css.js files to load the RTL version
  if (options.buildRTL) {
    webpackPlugins.push(
      new Webpack.NormalModuleReplacementPlugin(/\.css.js$/, (resource) => {
        const rtl_version = resource.request.replace(
          /\.css.js$/,
          '.rtl.css.js'
        );
        if (fs.existsSync(path.resolve(resource.context, rtl_version))) {
          resource.request = rtl_version;
        }
      })
    );
  }

  let webpackConfig = {
    mode: 'production',
    devtool: options.devtool,
    entry: pages.chunkEntries,
    output: {
      path: dest,
      filename: options.buildRTL
        ? './assets/js/[name].rtl.js'
        : './assets/js/[name].js',
    },
    plugins: webpackPlugins,
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
        {
          test: /\.scss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
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
                postcssOptions: {
                  plugins: postcssPlugins,
                },
              },
            },
            {
              loader: 'sass-loader',
              options: {
                implementation: sass,
                webpackImporter: false,
                sassOptions: {
                  includePaths: [path.resolve(__dirname, '..', 'node_modules')],
                  additionalData: `
                    $feature-flags: (
                      enable-css-custom-properties: true
                    );
                  `,
                },
              },
            },
          ],
        },
      ],
    },
  };

  if (options.isProduction) {
    webpackConfig.optimization = {
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
  }

  webpackConfig.plugins = webpackConfig.plugins.concat(pages.renderedPages);

  return webpackConfig;
};
