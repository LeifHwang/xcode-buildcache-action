import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: ['./src/restore.js', './src/save.js'], // 入口文件
  output: {
    dir: 'dist',
    format: 'es',
    chunkFileNames: '[name]-[format].js'
  },
  plugins: [resolve({ preferBuiltins: false }), json(), commonjs()]
};
