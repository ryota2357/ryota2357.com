module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    'plugin:@typescript-eslint/recommended-type-checked',
    "plugin:astro/recommended",
  ],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
  ],
}
