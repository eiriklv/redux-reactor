import webpack from 'webpack';
import path from 'path';

const { NODE_ENV } = process.env;

const plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
  }),
];

if (NODE_ENV === 'production') {
  plugins.push(
   new webpack.optimize.UglifyJsPlugin({
     compressor: {
       screw_ie8: true,
       warnings: false,
     },
   })
 );
}

export default {
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ },
    ],
  },

  entry: [
    './src/index',
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
  },

  plugins,
};
