module.exports = api => {
	api.cache(true);
	return {
		presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
		plugins: [
			[
				"module-resolver",
				{
					alias: {
						// tsconfig.json paths
						"@mobile/assets": "../mobile/assets",
						"@mobile": "../mobile/src",
						"@ui/assets": "../../packages/ui/assets",
						"@ui": "../../packages/ui/src",
						// module exports fields
						// "@mona-ca/ui/native": "../../packages/ui/src/index.native.ts",
					},
				},
			],
		],
	};
};
