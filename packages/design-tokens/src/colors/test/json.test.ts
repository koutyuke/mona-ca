import { describe, expect, test } from "bun:test";
import customColors from "../json/custom-colors.json";
import radixColors from "../json/radix-colors.json";

describe("color token snapshot", () => {
	test("should match snapshot(radix-color.json)", () => {
		expect(radixColors).toMatchSnapshot();
	});

	test("should match snapshot(custom-colors.json)", () => {
		expect(customColors).toMatchSnapshot();
	});
});
