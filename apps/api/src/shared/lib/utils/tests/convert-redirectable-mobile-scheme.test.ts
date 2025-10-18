import { describe, expect, test } from "vitest";
import { convertRedirectableMobileScheme } from "../convert-redirectable-mobile-scheme";

describe("Pass to convertRedirectableMobileScheme", () => {
	test("should convert redirectable mobile scheme", () => {
		expect(convertRedirectableMobileScheme("http://example.com")).toBe("http://example.com/");
		expect(convertRedirectableMobileScheme("http://example.com/foo/bar")).toBe("http://example.com/foo/bar");
		expect(convertRedirectableMobileScheme("example://example")).toBe("example://example");
		expect(convertRedirectableMobileScheme("example://example/foo/bar")).toBe("example://example/foo/bar");
		expect(convertRedirectableMobileScheme(new URL("http://example.com"))).toBe("http://example.com/");
		expect(convertRedirectableMobileScheme(new URL("http://example.com/foo/bar"))).toBe("http://example.com/foo/bar");
		expect(convertRedirectableMobileScheme(new URL("example://example"))).toBe("example://example");
		expect(convertRedirectableMobileScheme(new URL("example://example/foo/bar"))).toBe("example://example/foo/bar");
	});
});
