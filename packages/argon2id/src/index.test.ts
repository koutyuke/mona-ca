import { describe, expect, test } from "bun:test";
import { Argon2id } from ".";

describe("Argon2id", async () => {
	const argon2id = new Argon2id();
	test("hash関数の返り値がstring型である", async () => {
		const hashedPassword = await argon2id.hash("password");

		expect(typeof hashedPassword).toBe("string");
	});

	test("verify関数の返り値がboolean型である", async () => {
		const hashedPassword = await argon2id.hash("password");
		const isValid = await argon2id.verify(hashedPassword, "password");

		expect(typeof isValid).toBe("boolean");
	});

	test("verify関数の返り値がtrueである", async () => {
		const hashedPassword = await argon2id.hash("password");
		const isValid = await argon2id.verify(hashedPassword, "password");

		expect(isValid).toBe(true);
	});

	test("verify関数の返り値がfalseである", async () => {
		const hashedPassword = await argon2id.hash("password");
		const isValid = await argon2id.verify(hashedPassword, "password2");

		expect(isValid).toBe(false);
	});

	test("hash化の時間が0.3秒以内で終了する", async () => {
		const start = performance.now();
		await argon2id.hash("password");
		const end = performance.now();

		expect(end - start).toBeLessThan(300);
	});
});
