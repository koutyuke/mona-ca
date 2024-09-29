declare module "*.svg" {
	import type React from "react";
	import type { SvgProps } from "react-native-svg";
	const content: React.FC<SvgProps>;
	// biome-ignore lint/style/noDefaultExport: <explanation>
	export default content;
}
