const path = require("path");
module.exports = {
  src: path.resolve(__dirname, "../src"),
  build: path.resolve(__dirname, "../dist"),
  extBuild: path.resolve(__dirname, "../dist-ext"),
  extJS: ["blank"],
  extPages: ["blank"],
  ext: path.resolve(__dirname, "../dist-ext"),
  public: path.resolve(__dirname, "../src"),
  type: process.env.TYPE,
  pages: ["index", "themes"],
};
