<h1 align="center">Carbon for IBM.com Web Components HTML Template</h1>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Creating new pages](#creating-new-pages)
  - [Page Language / i18n Support](#page-language--i18n-support)
- [SASS compilation and `carbon-components`](#sass-compilation-and-carbon-components)
- [Right-to-Left (RTL)](#right-to-left-rtl)
- [Things to Note](#things-to-note)
  - [Digital Data Object](#digital-data-object)
  - [Meta Tags and Analytics](#meta-tags-and-analytics)
- [Upgrading from the Template](#upgrading-from-the-template)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

This is an HTML Template utilizing Carbon for IBM.com Web Components. It
contains a basic WebPack setup using Handlebars for page management, which
includes the
[dds-dotcom-shell](https://www.ibm.com/standards/carbon/web-components/?path=/story/components-dotcom-shell--default),
along with other various patterns and components available in Carbon for
IBM.com.

## Getting Started

Get the code by clicking `Use this template`, or clone this repo using git:

```bash
git clone https://github.com/carbon-design-system/carbon-for-ibm-dotcom-web-components-template.git
```

Once cloned, go to the project directory to install dependencies and build the
project

```bash
$ yarn && yarn build
```

In order to enable features like Right-to-Left (RTL), you will have to set
environment variables in a `.env` file. Please see `.env.example`.

```
ALTLANG_ROOT_PATH=<Sets the root path for language alternative urls, default is '/' >
LANG_DEFAULT=<Sets the default language, default is 'en-us'>
```

Then start the application:

```bash
$ yarn start
```

To export to a static site, run the following:

```bash
$ yarn build
```

Then the contents of the `dist` folder can be uploaded to your production
environment.

## Creating new pages

This repo contains an example page that can be easily modified and expanded
upon. In order to get started, navigate to `src/pages/home/home.hbs` and you can
start editing the Handlebars template as you would regular HTML.

If you'd like to create more pages, you're welcome to copy the example directory
into one of your own. However, you'll have to edit the file in `src/pages.js` to
include this new page. Note the `translationKey`, which is the string
responsible to fetch the translated values to be used in the page -- more on
that later.

```
const pages = [
  // other pages
  {
    output: './example/index.html',
    content: {
      title: 'Example page',
      description: 'An example page',
    },
    chunks: ['example'],
    chunkEntry: {
      'example': './src/pages/example/example.js',
    },
    template: './src/pages/example/example.hbs',
    translationKey: 'example'
  },
]
```

### Page Language / i18n Support

This template handles page language functionality, where the available language
template strings are defined in `src/locales/[language-locale]/*.json`, where
the name of each `json` file is the corresponding page translation key.

For example, the homepage for `en-us` would live under
`/src/locales/en-us/home.json` with the following content:

```
{
  "leadspace_title": "Lead space title",
  "leadspace_copy": "Use this area for a short line of copy to support the title",
  "content_block_mixed_heading": "Content Block - Mixed Groups",
  "content_block_segmented_heading": "Content Block - Segmented",
  "content_block_simple_heading": "Content Block - Simple",
  "content_block_media_heading": "Content Block - With Media"
}
```

To create additional languages, create a new folder for the language/locale,
then generate the corresponding page data.

For example, creating a corresponding `home` page data for `fr-ca`, the file
`/src/locales/fr-ca/home.json` would be created with the following content:

```
{
  "leadspace_title": "Titre de l'espace principal",
  "leadspace_copy": "Utilisez cette zone pour une courte ligne de copie pour soutenir le titre",
  "content_block_mixed_heading": "Bloc de contenu - Groupes mixtes",
  "content_block_segmented_heading": "Bloc de contenu - Segmenté",
  "content_block_simple_heading": "Bloc de contenu - Simple",
  "content_block_media_heading": "Bloc de contenu - Avec média"
}
```

Once you run `yarn build`, the exported files will be found in the `dist`
folder, and each locale will also output its own folder containing all of the
translated pages from the original template.

Urls for the above examples would output as:

- /en-us/index.html
- /fr-ca/index.html

Note, if there is only one language folder in `/src/locales`, then the output
will not generate the corresponding language/locale folders, and would generate
in the root distribution folder:

- /index.html

## SASS compilation and `carbon-components`

There may be times pathing errors are encountered when importing certain

stylesheets (like `carbon-components`). We're working hard to fix these, but in
the meantime you can add the following to your `.env` file to resolve:

```
SASS_PATH=node_modules:src
```

> **Note:** For Windows, the syntax is slightly different

```
SASS_PATH=./node_modules;./src
```

## Right-to-Left (RTL)

Right-to-left rendering is supported, and is automatically set for the following
language codes:

- `ar` (Arabic)

For example, creating Arabic pages for Saudi Arabia would be auto-generated in
RTL for any locale content under `/src/locales/ar-sa`.

## Things to Note

If building an IBM.com page, there are items that need to be included which can
be viewed here:

[Building for IBM.com](https://github.com/carbon-design-system/carbon-for-ibm-dotcom/blob/master/docs/building-for-ibm-dotcom.md)

### Digital Data Object

The Digital Data Object (DDO) is a flexible, customizable collection of metadata
that also provides tools and services such as live chat and analytics to page
authors. You can find more details on
[Building for IBM.com](https://github.com/carbon-design-system/carbon-for-ibm-dotcom/blob/master/docs/building-for-ibm-dotcom.md).

The template has a placeholder DDO you can define located in
`src/layouts/base.hbs`. Example values shown below:

```javascript
<script>
  digitalData = {
    page: {
      category: {
        primaryCategory: '' // e.g. SB03
      },
      pageInfo: {
        effectiveDate: '', // e.g. 2014-11-19
        expiryDate: '', // e.g. 2017-11-19
        language: '{{i18n "base_lang"}}', // e.g. en-US, automatically updated
        publishDate: '', // e.g. 2014-11-19
        publisher: '', // e.g. IBM Corporation
        version: 'Carbon for IBM.com',
        ibm: {
          contentDelivery: '', // e.g. ECM/Filegen
          contentProducer: '', // e.g. ECM/IConS Adopter 34 - GS83J2343G3H3ERG - 11/19/2014 05:14:02 PM
          country: '{{i18n "base_country"}}', // e.g. US, automatically updated
          industry: '', // e.g. B,U
          owner: '', // e.g. Some Person/City/IBM
          siteID: '', // e.g. MySiteID
          subject: '', // e.g. SW492
          type: '' // e.g CT305
        }
      }
    }
  };
</script>
```

### Meta Tags and Analytics

The template already renders the required meta tags and IBM.com analytics script
that are required for IBM.com websites.

They are located in `src/layouts/base.hbs`.These can be adjusted/removed to fit
your project and needs.

Meta Tags:

```html
<meta charset="UTF-8" />

<link rel="icon" href="//www.ibm.com/favicon.ico" />

<meta name="dcterms.date" content="YYYY-MM-DD" />
<meta name="dcterms.rights" content="© Copyright IBM Corp. 2021" />
<meta name="geo.country" content="US" />
<meta name="robots" content="index,follow" />
```

IBM.com Tag Management and Site Analytics Script

```html
<!-- IBM Tag Management and Site Analytics -->

<script
  src="//1.www.s81c.com/common/stats/ibm-common.js"
  async="async"
></script>
```

## Upgrading from the Template

To pull latest changes from the Carbon for IBM.com HTML template, this repo can
be added as a remote to your application repository:

```bash
git remote add template https://github.com/carbon-design-system/carbon-for-ibm-dotcom-web-components-template.git
```

Then run `git fetch` to update the changes:

```bash
git fetch --all
```

And finally merge changes in:

```bash
git merge template/main
```
