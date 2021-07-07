const Handlebars = require('handlebars/runtime');

let translations;

Handlebars.registerHelper('save_i18n', function (context) {
  translations = context;
  return '';
});

Handlebars.registerHelper('i18n', function (context) {
  return translations[context];
});

module.exports = Handlebars;
