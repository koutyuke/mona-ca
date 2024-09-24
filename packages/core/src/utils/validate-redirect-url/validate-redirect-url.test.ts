import { describe, expect, test } from "bun:test";
import { validateRedirectUrl } from "./validate-redirect-url";

describe("Validate Redirect URI", () => {
	test("期待したRedirect URIが返される", () => {
		const successTestCases = [
			// HTTP Scheme
			{
				input: {
					baseURL: new URL("http://localhost:8787"),
					uri: "http://localhost:8787",
				},
				output: new URL("http://localhost:8787"),
			},
			{
				input: {
					baseURL: new URL("http://localhost:8787"),
					uri: "http://localhost:8787/redirect/path",
				},
				output: new URL("http://localhost:8787/redirect/path"),
			},
			{
				input: {
					baseURL: new URL("http://localhost:8787"),
					uri: "/redirect/path",
				},
				output: new URL("http://localhost:8787/redirect/path"),
			},
			// URL Scheme
			{
				input: {
					baseURL: new URL("app://"),
					uri: "app://",
				},
				output: new URL("app://"),
			},
			{
				input: {
					baseURL: new URL("app://"),
					uri: "app://redirect/path",
				},
				output: new URL("app://redirect/path"),
			},
			{
				input: {
					baseURL: new URL("app://"),
					uri: "/redirect/path",
				},
				output: new URL("app://redirect/path"),
			},
		] satisfies { input: { baseURL: URL; uri: string }; output: URL | null }[];

		for (const { input, output } of successTestCases) {
			expect(
				validateRedirectUrl(input.baseURL, input.uri)
					?.toString()
					.replace(/\/\/\//g, "//"),
			).toBe(output ? output.toString().replace(/\/\/\//g, "//") : output);
		}
	});

	test("不正なURIの時にnullが返される", () => {
		const failureTestCases = [
			{
				input: {
					baseURL: new URL("http://localhost:8787"),
					uri: "http://localhost:3000",
				},
				output: null,
			},
			{
				input: {
					baseURL: new URL("http://localhost:8787"),
					uri: "http://localhost:3000/redirect/path",
				},
				output: null,
			},
			{
				input: {
					baseURL: new URL("http://localhost:8787"),
					uri: "app://",
				},
				output: null,
			},
			{
				input: {
					baseURL: new URL("http://localhost:8787"),
					uri: "app://redirect/path",
				},
				output: null,
			},
			{
				input: {
					baseURL: new URL("app://"),
					uri: "http://localhost:8787/",
				},
				output: null,
			},
			{
				input: {
					baseURL: new URL("app://"),
					uri: "http://localhost:8787/redirect/path",
				},
				output: null,
			},
		] satisfies { input: { baseURL: URL; uri: string }; output: URL | null }[];

		for (const { input, output } of failureTestCases) {
			expect(validateRedirectUrl(input.baseURL, input.uri)).toBe(output);
		}
	});

	test("URL Schemaの時にparamを追加できる", () => {
		const baseURL = new URL("app://");
		const uri = "/";
		const validatedUrl = validateRedirectUrl(baseURL, uri);
		validatedUrl?.searchParams.set("test", "test");
		expect(validatedUrl?.toString().replace(/\/\/\//g, "//")).toEqual("app://?test=test");
	});
});
