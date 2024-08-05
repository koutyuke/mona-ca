import { describe, expect, test } from "bun:test";
import { twColorPalette } from "./twColorPalette";

type TestCase = {
	params: {
		className: Parameters<typeof twColorPalette>[0];
		color: Parameters<typeof twColorPalette>[1];
	};
	include: string[];
	unInclude: string[];
};

describe("twColorPalette(tailwindcss color palette utils)", () => {
	test("should return className with color palette", () => {
		const testCases = [
			{
				params: {
					className: "colorPalette-500",
					color: "red",
				},
				include: ["colorPalette-500"],
				unInclude: ["red-500"],
			},
			{
				params: {
					className: "bg-colorPalette-500",
					color: "red",
				},
				include: ["bg-red-500"],
				unInclude: ["bg-colorPalette-500"],
			},

			{
				params: {
					className: "flex items-center bg-colorPalette-500 p-2",
					color: "blue",
				},
				include: ["flex", "items-center", "bg-blue-500", "p-2"],
				unInclude: ["bg-colorPalette-500"],
			},
		] satisfies TestCase[];

		for (const { params, include, unInclude } of testCases) {
			const result = twColorPalette(params.className, params.color).split(" ");
			expect(result.length).toBe(include.length);
			expect(include.every(i => result.includes(i))).toBe(true);
			expect(unInclude.every(i => !result.includes(i))).toBe(true);
		}
	});
});
