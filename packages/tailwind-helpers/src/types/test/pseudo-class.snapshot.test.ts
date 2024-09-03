import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("pseudo-class snapshot", () => {
	test("should match snapshot", () => {
		const filePath = resolve(__dirname, "../pseudo-class.type.ts");
		const fileContent = readFileSync(filePath, "utf-8");

		expect(fileContent).toMatchSnapshot();
	});
});
