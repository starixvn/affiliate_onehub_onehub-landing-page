const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const outputDir = isProduction ? 'prod' : 'dev';
  
  return {
    entry: {
      site: './src/js/site.js'
    },
    output: {
      path: path.resolve(__dirname, `wwwroot/dist/${outputDir}`),
      filename: '[name].bundle.js',
      clean: false
    },
    devtool: isProduction ? false : 'source-map',
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000, // 244KB limit
        cacheGroups: {
          // Separate jQuery into its own chunk
          jquery: {
            test: /[\\/]node_modules[\\/]jquery[\\/]/,
            name: 'jquery',
            chunks: 'all',
            priority: 30,
          },
          // Separate Swiper into its own chunk
          swiper: {
            test: /[\\/]node_modules[\\/]swiper[\\/]/,
            name: 'swiper',
            chunks: 'all',
            priority: 25,
          },
          // Separate libphonenumber-js into its own chunk
          libphonenumber: {
            test: /[\\/]node_modules[\\/]libphonenumber-js[\\/]/,
            name: 'libphonenumber',
            chunks: 'all',
            priority: 20,
          },
          // Other vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
            minChunks: 1,
          }
        }
      },
      // Enable tree shaking
      usedExports: true,
      sideEffects: false,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      // Add alias for better tree shaking
      alias: {
        'jquery': path.resolve(__dirname, 'node_modules/jquery/dist/jquery.min.js'),
        'swiper': path.resolve(__dirname, 'node_modules/swiper'),
      }
    },
    // Performance hints
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 244000, // 244KB
      maxAssetSize: 244000, // 244KB
    }
  };
};