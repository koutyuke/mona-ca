import type { PseudoClass } from "@tailwind-helpers/types/pseudo-class.type";
import { twMerge } from "tailwind-merge";

type Key = PseudoClass | (string & {});

type Nest = {
	[key in Key]?: string | Nest;
} & {
	_className: string;
};

const flattenPseudoClass = (pseudo: Nest | string): string[] => {
	if (typeof pseudo === "string") {
		return [pseudo];
	}

	const { _className, ...otherPseudo } = pseudo;

	return Object.entries(otherPseudo).reduce(
		(acc, [key, value]) => {
			if (!value) {
				return acc;
			}
			if (typeof value === "string") {
				acc.push(`${key}:${value}`);
				return acc;
			}
			for (const pseudoClass of flattenPseudoClass(value)) {
				acc.push(`${key}:${pseudoClass}`);
			}
			return acc;
		},
		[_className],
	);
};

/**
 *
 * @param className
 * @param pseudo
 * @returns { string }
 */
const twPseudo = (className: string, pseudo?: Record<string, Nest | string>): string => {
	if (!pseudo) {
		return className;
	}

	return twMerge(
		Object.entries(pseudo).reduce((acc, [key, value]) => {
			return `${acc} ${flattenPseudoClass(value).reduce((acc, value) => `${acc} ${key}:${value}`, "")}`;
		}, className),
	);
};

export { twPseudo };
