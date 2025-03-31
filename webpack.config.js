const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const Dotenv = require('dotenv-webpack');

const DIST_PATH = path.resolve(__dirname, "dist", "client");

module.exports = {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    devtool: "eval-source-map",
    entry: {
        index: "./src/client/client.ts"
    },
    devServer: {
        open: false,
        port: 9000,
        host: "0.0.0.0",
        hot: true,
        static: {
            directory: DIST_PATH
        }
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.(png|xml|json|woff(2?))$/,
                type: "asset/resource",
            },
            {
                test: /\.json$/,
                oneOf: [
                    {
                        type: 'asset/resource',
                        resourceQuery: /url/
                    },
                    {
                        type: 'json'
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                test: /\.(m?)js/,
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    plugins: [
        new Dotenv({
            path: path.resolve(__dirname, "src", "config", `.${process.env.NODE_ENV}.env`)
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./src/index.html")
        })
    ],
    output: {
        filename: "[name].[contenthash].js",
        path: DIST_PATH
    },
    optimization: {
        runtimeChunk: "single",
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all",
                }
            }
        }
    }
};
