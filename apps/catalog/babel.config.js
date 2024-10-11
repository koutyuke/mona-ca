module.exports = api => {
	api.cache(true);
	return {
		presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
		plugins: [
			[
				"module-resolver",
				{
					alias: {
						"@mobile/assets": "../mobile/assets",
						"@mobile": "../mobile/src",
						"@ui/assets": "../../packages/ui/assets",
						"@ui": "../../packages/ui/src",
					},
				},
			],
			"@babel/plugin-transform-class-static-block",
		],
	};
};
