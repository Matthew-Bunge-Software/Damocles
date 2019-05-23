module.exports = {
    entry: "./src/index.js",
    output: {
        filename: 'bundle-index.js'
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