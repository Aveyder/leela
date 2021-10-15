const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {mergeWithCustomize} = require("webpack-merge");
const common = require('./webpack.common');
const utils = require('./utils');

module.exports = mergeWithCustomize({
    customizeArray: utils.pluginsMerge
})(common, {
    entry: {
        index: './demo/index.tsx'
    },
    devServer: {
        contentBase: './dist/demo'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Leela Demo'
        })
    ],
    output: {
        path: path.resolve('dist', 'demo')
    }
});
