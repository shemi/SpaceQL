'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const {dependencies} = require('../package.json')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const BabiliWebpackPlugin = require('babili-webpack-plugin')

let mainConfig = {
    entry: {
        main: path.join(__dirname, '../src/main/index.js'),
        tab: path.join(__dirname, '../src/main/tab.js')
    },
    externals: [
        ...Object.keys(dependencies || {})
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            }
        ]
    },
    node: {
        __dirname: process.env.NODE_ENV !== 'production',
        __filename: process.env.NODE_ENV !== 'production'
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist/electron')
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new HtmlWebpackPlugin({
            filename: 'tab.html',
            template: path.resolve(__dirname, '../src/tab.ejs'),
            chunks: ['tab'],
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true
            },
            nodeModules: process.env.NODE_ENV !== 'production'
                ? path.resolve(__dirname, '../node_modules')
                : false
        }),
    ],
    resolve: {
        extensions: ['.js', '.json', '.node']
    },
    optimization: {
        minimize: false,
        usedExports: false

    },
    target: 'electron-main'
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
    mainConfig.plugins.push(
        new webpack.DefinePlugin({
            '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
        })
    )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
    mainConfig.plugins.push(
        // new BabiliWebpackPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        })
    )
}

module.exports = mainConfig
