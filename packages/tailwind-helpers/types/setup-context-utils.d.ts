declare module "tailwindcss/lib/lib/setupContextUtils" {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	export function createContext(tailwindConfig: any, changedContent?: any[], root?: any): Context;

	export interface Context {
		disposables: Array<(context: Context) => void>;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		ruleCache: Set<[any, postcss.Rule]>;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		candidateRuleCache: Map<string, any>;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		classCache: Map<string, any>;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		applyClassCache: Map<string, any>;
		notClassCache: Set<string>;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		postCssNodeCache: Map<any, any>;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		candidateRuleMap: Map<string, any>;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		tailwindConfig: any;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		changedContent: any[];
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		variantMap: Map<string, any>;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		stylesheetCache: any;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		variantOptions: Map<string, any>;
		markInvalidUtilityCandidate(candidate: string): void;
		markInvalidUtilityNode(node: postcss.Node): void;
	}
}
