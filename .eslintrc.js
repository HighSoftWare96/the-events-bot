module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['./', process.cwd()],
        moduleDirectory: [
          'node_modules',
          './',
          process.cwd(),
        ],
      },
    },
  },
};
