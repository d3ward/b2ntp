var path = require("path"),
  glob = require("glob"),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  PurgecssPlugin = require('purgecss-webpack-plugin'),
WriteFilePlugin = require("write-file-webpack-plugin");
const PATHS = {
  src: path.join(__dirname, 'src')
}
module.exports = {
  mode: "production",
  context: path.resolve(__dirname, './src'),
  entry: './index.js',
  output: {
    filename: './main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: false,
    assetModuleFilename: '[path][name][ext]'
  },

  module: {
    rules: [{
        test: /\.(gif|png|jpe?g)$/,
        type: "asset/resource"
      }, {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/,
        options: {
          minimize: false,
        },
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "./[name].css",
      chunkFilename: "[name].css",
    }),
    new PurgecssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      sources: false,
      minify: false,
    })
  ]
};