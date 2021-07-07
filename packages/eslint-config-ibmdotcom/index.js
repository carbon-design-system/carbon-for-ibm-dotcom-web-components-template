/**
 * Copyright IBM Corp. 2018, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

module.exports = {
  parser: 'babel-eslint',
  extends: ['eslint:recommended', 'plugin:jsdoc/recommended'],
  plugins: ['jsdoc'],
  rules: {
    // Handle cases where we are destructuring but may not be using the initial
    // variables
    'no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreMemberSort: true,
      },
    ],
    'jsdoc/require-jsdoc': [
      2,
      {
        require: {
          ArrowFunctionExpression: true,
          ClassDeclaration: true,
          FunctionDeclaration: true,
          MethodDefinition: true,
        },
      },
    ],
    'jsdoc/require-param-description': 2,
    'jsdoc/require-param-name': 2,
    'jsdoc/require-param': 2,
    'jsdoc/require-param-type': 2,
    'jsdoc/valid-types': 2,
    'jsdoc/check-param-names': 2,
    'jsdoc/check-tag-names': 2,
    'jsdoc/check-types': 2,
  },
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
    jasmine: true,
  },
  globals: {
    __DEV__: true,
  },
  settings: {
    jsdoc: {
      tagNamePreference: {
        augments: 'extends',
      },
    },
  },
};
