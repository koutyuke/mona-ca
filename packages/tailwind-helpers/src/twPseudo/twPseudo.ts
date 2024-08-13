import { twMerge } from "tailwind-merge";
import type { PseudoClass } from "../types/pseudo-class.type";

type Key = PseudoClass | (string & {});

type Pseudo = {
	[key in Key]?: string | Nest;
};

type Nest = Pseudo & {
	_className: string;
};

const flattenPseudoClass = (pseudo: Nest | string): string[] => {
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
 * @param className
 * @param pseudo
 * @returns { string }
 */
const twPseudo = (className: string, pseudo?: Pseudo): string => {
	if (!pseudo) {
		return className;
	}

	return twMerge(
		Object.entries(pseudo).reduce((acc, [key, value]) => {
			if (!value) {
				return acc;
			}
			return `${acc} ${flattenPseudoClass(value).reduce((a, v) => (v ? `${a} ${key}:${v}` : a), "")}`;
		}, className),
	);
};

export { twPseudo };
