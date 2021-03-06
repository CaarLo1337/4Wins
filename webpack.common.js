const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: ['./public/src/typescript/index.ts', './public/src/scss/main.scss'],
    watch: true,
    devServer: {
        static: {
            directory: path.join(__dirname, '/public/dist'),
        },
        compress: true,
        port: 9000,
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].bundle.css',
            chunkFilename: 'css/[id].css',
        }),
        new Dotenv({
            path: './.env', // Path to .env file (this is the default)
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'public/src')],
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-sass-loader', 'sass-loader'],
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: 'js/build.js',
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
};
