var _ = require('underscore');
var webpack = require('webpack');
var packageJson = require('./package.json');

var libraryName = packageJson.name;
var banner = [
    packageJson.name + " - Mask engine library v" + packageJson.version,
    "Copyright (c) 2022-2023 TSV  - http://github.com/tsv2013/mask-engine",
    "License: MIT (http://www.opensource.org/licenses/mit-license.php)",
].join("\n");

var BASE_CFG = {
  target: 'web',
  resolve: {
    extensions: ['.ts'],
  },
  module: {
      rules: [
          {
              test: /\.(ts|tsx)$/,
              loader: 'ts-loader',
              options: {
                  compilerOptions: {
                      //'declaration': true,
                      //'outDir': 'typings/'
                  }
              }
          }
      ]
  },
  entry: './sources/index.ts',
};

var DEV_CFG = _.extend({}, BASE_CFG, {
  mode: "development",
  plugins: [
  ],
  output: {
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    path: __dirname + '/dist',
    filename: libraryName + '.js'
  },
  devtool: 'inline-source-map'
});

var PROD_CFG = _.extend({}, BASE_CFG, {
  mode: "production",
  plugins: [
    new webpack.BannerPlugin(banner),
    //new webpack.optimize.UglifyJsPlugin()
  ],
  output: {
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    path: __dirname + '/dist',
    filename: libraryName + '.min.js'
  }
});

module.exports = [DEV_CFG, PROD_CFG];
