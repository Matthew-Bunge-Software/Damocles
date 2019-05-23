module.exports = {
    entry: "./src/index.js",
    output: {
        filename: 'bundle-index.js'
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