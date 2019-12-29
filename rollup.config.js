import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

const bundle = 'vue-keep-navigator';

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: `dist/${bundle}.common.js`,
        format: 'cjs'
      },
      {
        file: `dist/${bundle}.esm.js`,
        format: 'es'
      }
    ],
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true
      })
    ]
  },
  {
    input: `dist/${bundle}.esm.js`,
    output: {
      name: 'VueKeepNavigator',
      file: `dist/${bundle}.umd.min.js`,
      format: 'umd'
    },
    plugins: [uglify()]
  }
];
