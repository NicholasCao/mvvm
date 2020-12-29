const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'vm.min.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    contentBase: './dist',
    port: 8080,
    hot: true,
    open: true
  },
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
}
