module.exports = {
    entry: "./src/index.js",
    output: {
        filename: 'bundle-index.js',
        publicPath: '/dist/'
    },
    devServer: {
        watchContentBase: true
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        }],
    }
}