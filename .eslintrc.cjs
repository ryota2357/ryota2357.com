module.exports = {
    "root": true,
    "env": {
        browser: true,
        es2023: true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:@typescript-eslint/recommended",
        'plugin:@typescript-eslint/recommended-type-checked',
        // "react-app"  ref: https://github.com/facebook/create-react-app/issues/13286
    ],
    "overrides": [
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        project: true,
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ]
}
