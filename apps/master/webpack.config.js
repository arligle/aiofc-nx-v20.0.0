const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/master'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      // target: 'node',
      // compiler: 'tsc',
      // main: './src/main.ts',
      // tsConfig: './tsconfig.app.json',
      // assets: ['./src/assets', './src/i18n'],
      // optimization: false,
      // outputHashing: 'none',
      // generatePackageJson: true,
    }),
  ],
};

// TODO: 注意这里的配置应当与 project.json 中的配置合并，当前没有处理
