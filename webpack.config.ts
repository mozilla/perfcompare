import * as path from 'path';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
  devtool: 'inline-source-map',
  devServer: {
    compress: true,
    open: true,
    port: 3000,
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
  entry: './src/index.tsx',
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'source-map-loader',
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'url-loader',
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      `...`,
      new CssMinimizerPlugin(),
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
      }),
    ],
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'index.js',
  },
  plugins: [
    new ESLintPlugin(),
    new MiniCssExtractPlugin(),
    new ForkTsCheckerWebpackPlugin({
      async: false,
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: 'write-references',
      },
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};

export default config;
