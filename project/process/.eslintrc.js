module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
		'vue/setup-compiler-macros': true
	},
	extends: ['eslint:recommended', 'plugin:vue/vue3-essential', 'prettier'],
	parser: 'vue-eslint-parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	plugins: ['vue', 'prettier'],
	rules: {
		// 代码风格相关 - 保持现有习惯
		quotes: ['error', 'single'], // 单引号
		semi: ['error', 'never'], // 无分号(Vue项目常见)

		// Vue相关规则
		'vue/html-indent': ['error', 'tab'],
		'vue/multi-word-component-names': 'off', // 允许单词组件名
		'vue/no-multiple-template-root': 'off', // Vue 3允许多个根元素

		// uni-app特殊规则
		'no-undef': 'off', // uni-app有全局变量如uni、wx等

		// 代码质量
		'no-console': 'warn', // 警告console，但不报错
		'no-debugger': 'error',
		'no-unused-vars': 'warn',

		// Prettier集成
		'prettier/prettier': [
			'error',
			{
				useTabs: true,
				singleQuote: true,
				semi: false,
				trailingComma: 'none',
				endOfLine: 'auto'
			}
		]
	},
	globals: {
		// uni-app全局变量
		uni: 'readonly',
		wx: 'readonly',
		getCurrentPages: 'readonly',
		getApp: 'readonly',
		Page: 'readonly',
		Component: 'readonly',
		Behavior: 'readonly',
		plus: 'readonly'
	},
	overrides: [
		{
			files: ['*.vue'],
			rules: {
				indent: 'off' // Vue文件中的缩进由vue/html-indent控制
			}
		}
	]
}
