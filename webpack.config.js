const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  // Entry point aplikasi
  entry: './index.js',
  
  // Output ke folder dist
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  // Modul dan rules untuk pengolahan file
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          
        },
        
      },{
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
      
    ],
  },

  // Plugin untuk mengenerate file HTML dengan link ke bundle.js
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'service-worker.js' } 
      ]
    })
  ],
  

  // Mode development untuk pengaturan cepat dan hot reloading
  mode: 'development',

  // Konfigurasi untuk development server
  devServer: {
    static: path.join(__dirname, 'dist'),  // Ganti contentBase dengan static
    compress: true,
    port: 9000,
    hot: true,
    open: true, // Untuk otomatis membuka browser
  },
};
