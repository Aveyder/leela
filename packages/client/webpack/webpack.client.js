const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {mergeWithCustomize} = require("webpack-merge");
const common = require('./webpack.common');
const utils = require('./utils');

module.exports = mergeWithCustomize({
    customizeArray: utils.pluginsMerge
})(common, {
    entry: {
        index: './src/index.ts'
    },
    devServer: {
        contentBase: './dist/client'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Leela Client'
        })
    ],
    output: {
        path: path.resolve('dist', 'client')
    }
});
