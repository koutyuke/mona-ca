import { describe, expect, test } from "vitest";
import { Argon2idService } from "./argon2id.service";

describe("Argon2idService", async () => {
	const argon2id = new Argon2idService();
	test("hash関数の返り値がstring型である", async () => {
		const hashedPassword = await argon2id.hash("password");

		expect(typeof hashedPassword).toBe("string");
	});

	test("verify関数の返り値がboolean型である", async () => {
		const hashedPassword = await argon2id.hash("password");
		const isValid = await argon2id.verify("password", hashedPassword);

		expect(typeof isValid).toBe("boolean");
	});

	test("verify関数の返り値がtrueである", async () => {
		const hashedPassword = await argon2id.hash("password");
		const isValid = await argon2id.verify("password", hashedPassword);

		expect(isValid).toBe(true);
	});

	test("verify関数の返り値がfalseである", async () => {
		const hashedPassword = await argon2id.hash("password");
		const isValid = await argon2id.verify("password2", hashedPassword);

		expect(isValid).toBe(false);
	});

	test("hash化の時間が0.3秒以内で終了する", async () => {
		const start = performance.now();
		await argon2id.hash("password");
		const end = performance.now();

		expect(end - start).toBeLessThan(300);
	});
});
