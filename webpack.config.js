const { merge } = require("webpack-merge");
const base = require("./webpack.config.base");

module.exports = merge(base, {
    mode: process.env.NODE_ENV || "production",
    devtool: "source-map",
    output: {
        filename: "[name].bundle.js",
        path: __dirname + "/dist",
    },
    module: {
        rules: [
            {
                test: /\.(less|css)$/,
                use: ["style-loader", "css-loader", "less-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|png|svg|jpg|gif)$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 20480,
                    },
                },
            },
            {
                test: /\.svg$/,
                use: [
                    { loader: "svg-sprite-loader", options: {} },
                    { loader: "svgo-loader", options: {} },
                ],
            },
        ],
    },
});
