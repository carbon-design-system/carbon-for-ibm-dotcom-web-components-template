const Handlebars = require('handlebars/runtime');

let translations;

Handlebars.registerHelper('save_i18n', function (context) {
  translations = context;
  return '';
});

Handlebars.registerHelper('i18n', function (context) {
  return translations[context];
});

/**
 * Handlebars helper that will determine if a string contains a particular string
 *
 * @example
 * {{#contains "lorem ipsum" myString }}
 * Show me!
 * {{/contains}}
 */
Handlebars.registerHelper('contains', function (needle, haystack, options) {
  needle = Handlebars.escapeExpression(needle);
  haystack = Handlebars.escapeExpression(haystack);
  return haystack.indexOf(needle) > -1
    ? options.fn(this)
    : options.inverse(this);
});

/**
 * Handlebars helper that will determine if a string does not contain a particular string
 *
 * @example
 * {{#no_contains "lorem ipsum" myString }}
 * Show me!
 * {{/contains}}
 */
Handlebars.registerHelper('no_contains', function (needle, haystack, options) {
  needle = Handlebars.escapeExpression(needle);
  haystack = Handlebars.escapeExpression(haystack);
  return haystack.indexOf(needle) === -1
    ? options.fn(this)
    : options.inverse(this);
});

module.exports = Handlebars;
