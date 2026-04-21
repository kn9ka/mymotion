/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['build/**/*'],
  rules: {
    'import-notation': null,
    'hue-degree-notation': null,
    'lightness-notation': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['apply', 'custom-variant', 'layer', 'theme'],
      },
    ],
  },
};
