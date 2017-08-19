var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    LabelLayer: [ 'babel-polyfill','./LabelLayer.js']
  },
  output: {
    path: __dirname,
    filename: 'dist/[name].js'
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
      {test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/},
      {
        loader: 'babel-loader',
        test: path.join(__dirname, "."),
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  resolve: {
    alias: {
      // Split: path.join(__dirname, "js/vendor/splitjs/split.js"),
      // jquery: path.join(__dirname, "js/vendor/jquery/jquery-3.0.0.min.js")
    }
  },
  plugins: [
    // new webpack.NoErrorsPlugin(),
    // new webpack.ProvidePlugin({
    //   Split: "Split",
    //   jQuery: "jquery",
    //   $: "$"
    // }
    // )
  ],
  stats: {
    colors: true
  },
  devtool: 'source-map',
  // debug: true,
  cache: true
};
