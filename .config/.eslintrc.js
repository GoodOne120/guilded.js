module.exports = {
	root: true,
	extends: ["neon/common", "neon/node", "neon/typescript", "neon/prettier"],
	parserOptions: {
		project: "../../tsconfig.eslint.json",
	},
	rules: {
		"unicorn/no-abusive-eslint-disable": "off",
		"@typescript-eslint/unbound-method": "off",
		"@typescript-eslint/no-var-requires": "off",
		"@typescript-eslint/explicit-function-return-type": "error",
		"@typescript-eslint/explicit-member-accessibility": "off",
		"@typescript-eslint/no-invalid-this": "off",
		"@typescript-eslint/no-use-before-define": "off",
		"@typescript-eslint/promise-function-async": "off",
		"jsdoc/multiline-blocks": "off",
		"jsdoc/newline-after-description": "off",
		"typescript-sort-keys/interface": "off",
		"@typescript-eslint/lines-between-class-members": [
			"warn",
			"always",
			{
				exceptAfterOverload: true,
			},
		],
		"@typescript-eslint/switch-exhaustiveness-check": "off",
		"array-callback-return": "off",
		"import/extensions": "off",
		"no-param-reassign": "off",
		"promise/prefer-await-to-then": "error",
		"tsdoc/syntax": "off",
		"sonarjs/no-nested-switch": "off",
		"id-length": "off",
		"no-restricted-globals": "off",
		"n/prefer-global/process": "off",
		"no-promise-executor-return": "off",
		"jsdoc/no-undefined-types": "off",
		"prettier/prettier": "off",
		"n/shebang": "off"
	}
};
