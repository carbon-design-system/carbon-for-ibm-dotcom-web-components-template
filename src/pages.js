const pages = [
  {
    output: 'index.html',
    content: {
      title: 'Home',
      description: 'Home Page',
    },
    chunks: ['home'],
    chunkEntry: {
      home: './src/pages/home/home.js',
    },
    template: './src/pages/home/home.hbs',
    translationKey: 'home',
  },
  {
    output: 'page2.html',
    content: {
      title: 'Page 2',
      description: 'Page 2',
    },
    chunks: ['page2'],
    chunkEntry: {
      page2: './src/pages/page2/page2.js',
    },
    template: './src/pages/page2/page2.hbs',
    translationKey: 'page2',
  },
];

module.exports = pages;
