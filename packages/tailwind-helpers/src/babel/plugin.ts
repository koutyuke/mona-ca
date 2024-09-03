import { type PluginObj, types as t } from "@babel/core";
import generator from "@babel/generator";
import { twMerge } from "tailwind-merge";

const checkIfObjectValueIsOnlyStringLiteralOrObjectExpression = (node: t.ObjectExpression): boolean => {
	const properties = node.properties;

	return properties.every(property => {
		if (!t.isObjectProperty(property)) {
			return false;
		}
		if (t.isStringLiteral(property.value)) {
			return true;
		}
		if (t.isObjectExpression(property.value)) {
			return checkIfObjectValueIsOnlyStringLiteralOrObjectExpression(property.value);
		}
		return false;
	});
};

const handlingBabelPlugin = (_api: typeof t): PluginObj => {
	return {
		visitor: {
			CallExpression(path) {
				if (!t.isIdentifier(path.node.callee) || path.node.callee.name !== "twPseudo") {
					return;
				}

				if (!t.isStringLiteral(path.node.arguments[0])) {
					return;
				}

				if (path.node.arguments.length === 1) {
					path.replaceWith(t.stringLiteral(path.node.arguments[0].value));
					return;
				}

				if (
					!t.isObjectExpression(path.node.arguments[1]) ||
					!checkIfObjectValueIsOnlyStringLiteralOrObjectExpression(path.node.arguments[1])
				) {
					return;
				}

				const twPseudoCode = generator(path.node).code;

				const code = `
const flattenPseudoClass = (pseudo) => {
	if (typeof pseudo === "string") {
		return pseudo.split(" ");
	}

	const { _className, ...otherPseudo } = pseudo;

	return Object.entries(otherPseudo).reduce(
		(acc, [key, value]) => {
			if (!value) {
				return acc;
			}
			if (typeof value === "string") {
				acc.push(\`\${key}:\${value}\`);
				return acc;
			}
			for (const pseudoClass of flattenPseudoClass(value)) {
				acc.push(\`\${key}:\${pseudoClass}\`);
			}
			return acc;
		},
		[_className],
	);
};

const twPseudo = (className, pseudo) => {
	if (!pseudo) {
		return className;
	}

	return Object.entries(pseudo).reduce(
    (acc, [key, value]) =>
      value ? \`\${acc} \${flattenPseudoClass(value).reduce((a, v) => (v ? \`\${a} \${key}:\${v}\` : a), "")}\` : acc,
    className,
  );
};

${twPseudoCode}
`;

				try {
					// biome-ignore lint/security/noGlobalEval: <explanation>
					const result = twMerge(eval(code));
					path.replaceWith(t.stringLiteral(result));
				} catch {}
			},
		},
	};
};

// biome-ignore lint/style/noDefaultExport: <explanation>
export default handlingBabelPlugin;
