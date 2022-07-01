const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

let config = {
    mode: "development",
    devtool: "eval-source-map",
    entry: {
        index: "./src/index.ts"
    },
    devServer: {
        static: "./dist"
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                type: "javascript/auto",
                test: /\.(png|xml|json|woff(2?))$/,
                use: "file-loader"
            },
            {
                test: /\.(s?)css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
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
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "@leela/common": path.resolve(__dirname, "../common/src")
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./public/index.html")
        }),
        new CopyWebpackPlugin({
            patterns: [
                "public/logo.png"
            ]
        })
    ],
    output: {
        filename: "[name].[contenthash].js",
        path: path.resolve(__dirname, "dist")
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

module.exports = config;
