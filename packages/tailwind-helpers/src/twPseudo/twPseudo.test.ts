import { describe, expect, test } from "bun:test";
import { twPseudo } from "./twPseudo";

type TestCase = {
	params: {
		className: Parameters<typeof twPseudo>[0];
		pseudo?: Parameters<typeof twPseudo>[1];
	};
	include: string[];
};

describe("twPseudo(tailwindcss pseudo class, function utils)", () => {
	test("should return className with pseudo class", () => {
		const testCases = [
			{
				params: {
					className: "text-red-500",
					pseudo: {
						baz: "qux",
						after: {
							_className: "text-blue-500",
							dark: "font-xl",
							foo: {
								_className: "bar",
							},
						},
					},
				},
				include: ["text-red-500", "after:text-blue-500", "after:dark:font-xl", "after:foo:bar", "baz:qux"],
			},
		] satisfies TestCase[];

		for (const { params, include } of testCases) {
			const result = twPseudo(params.className, params.pseudo).split(" ");

			expect(result.length).toBe(include.length);
			expect(include.every(i => result.includes(i))).toBe(true);
		}
		expect(true).toBe(true);
	});
});
