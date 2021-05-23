import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import transformer from 'react-refresh-typescript'
import { Configuration } from 'webpack'
import { Configuration as Dev } from 'webpack-dev-server'

const config: Configuration = {
    mode: 'development',
    devtool: false,
    // https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/398
    entry: { main: './src/index.tsx' },
    resolve: { extensions: ['.ts', '.tsx', '.mjs', '.js'] },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    getCustomTransformers() {
                        return { before: [transformer({})] }
                    },
                    transpileOnly: true,
                },
            },
        ],
    },
    plugins: [
        new ReactRefreshWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: './index.html',
            templateContent: '<div id=root></div>',
        }),
    ],
    // @ts-ignore
    devServer: {
        hot: true,
    } as Dev,
}
export default config
