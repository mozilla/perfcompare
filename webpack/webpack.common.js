const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, '..', './src/index.tsx'),
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    // these polyfills are for taskcluster-client-web
    fallback: {
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      process: require.resolve('process'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      vm: false,
    },
  },
  module: {
    rules: [
      {
        // should use babel-loader for all ts js tsx and jsx files
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        // should use style-loader and css-loader for all css files
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        // v5 supports image loaders out of box
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: 'asset/inline',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '..', './build'),
    filename: '[name].[chunkhash].js',
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '..', './public/index.html'),
      favicon: './public/favicon.svg',
    }),
    new CopyWebpackPlugin({
      patterns: ['public/_redirects'],
    }),
  ],
};
