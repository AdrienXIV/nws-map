var HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV !== 'production';
const path = require('path');

module.exports = {
    entry: './src/source.js',
    devtool: 'inline-source-map',
    devServer: {
        contentBase : './public',
        hot : true
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'public'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Kit de démarrage OpenLayers NWS",
            filename: 'index.html',
            template: 'src/source.html'
        }),
        new MiniCssExtractPlugin({
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: process.env.NODE_ENV === 'development'                        }
                    },
                    'css-loader',
                   // 'postcss-loader',
                    'sass-loader'
                ]
            }
        ]
    }
};