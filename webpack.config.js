const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new CopyPlugin([
      { from: './src/index.html', to: './' },
      { from: './src/style.css', to: './' },
      { from: './src/site.webmanifest', to: './' },
      { from: './src/assets/', to: './assets/' },
    ]),
  ],
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
    ]
  },
  mode: 'production'
};
