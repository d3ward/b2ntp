const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { marked } = require("marked");
const fs = require("fs");
const webpack = require("webpack");
const { src, extBuild, extJS, extPages } = require("./config");
const packageJson = require("../package.json");

var ext_entries, manifest_file;

ext_entries = extJS;
manifest_file = {
  from: path.join(src, "manifest.json"),
  to: path.join(extBuild, "manifest.json"),
};

module.exports = {
  context: src,
  entry: {
    ...ext_entries.reduce((acc, page) => {
      acc[page] = `./js/${page}.js`;
      return acc;
    }, {}),
  },
  output: {
    clean: false,
    assetModuleFilename: "[path][name][ext]",
    path: extBuild,
    filename: "./js/[name].js",
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(src, "assets"),
          to: path.join(extBuild, "assets"),
        },
        manifest_file,
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].css",
      chunkFilename: "[name].css",
    }),
    ...extPages.map(
      (page) =>
        new HTMLWebpackPlugin({
          template: `./${page}.ejs`,
          filename: `${page}.html`,
          chunks: [page],
          minify: false,
          sources: false,
          templateParameters: {
            changelogContent: processChangelog(),
          },
        }),
    ),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(packageJson.version),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: {
            target: 'es2015' // Specify your target environment
        }
      },
      {
        test: /\.ejs$/i,
        use: [
          "html-loader",
          {
            loader: "template-ejs-loader",
            options: {
              data: {
                changelogContent: processChangelog(),
              },
            },
          },
        ],
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [
          MiniCssExtractPlugin.loader, // extract css from commonjs
          "css-loader", // turn css into commonjs
          "sass-loader", // turn scss into css
        ],
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader", // turn css into commonjs
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[name].[ext]", // Adding a unique hash to the filename
        },
      },
    ],
  },
};

function processChangelog() {
  const changelogPath = path.resolve(__dirname, "../CHANGELOG.md");
  const changelogContent = fs.readFileSync(changelogPath, "utf-8");
  return marked(changelogContent);
}
