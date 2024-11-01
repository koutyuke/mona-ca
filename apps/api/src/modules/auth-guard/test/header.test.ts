import { env } from "cloudflare:test";
import { AuthUseCase } from "@/application/use-cases/auth";
import { Argon2idService } from "@/infrastructure/argon2id";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionRepository } from "@/interface-adapter/repositories/session";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { SessionTableHelper, UserTableHelper } from "@/tests/helpers";
import { beforeAll, describe, expect, test } from "vitest";
import { authGuard } from "../auth-guard.plugin";

const { DB } = env;

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const drizzleService = new DrizzleService(DB);
const argon2idService = new Argon2idService();

const sessionRepository = new SessionRepository(drizzleService);

const authUseCase = new AuthUseCase(false, sessionRepository, argon2idService);

const sessionToken1 = "sessionId1";
const sessionToken2 = "sessionId2";

describe("AuthGuard Authorization Header Test", () => {
	beforeAll(async () => {
		await userTableHelper.create({
			...userTableHelper.baseDatabaseUser,
			id: "user1Id",
			email_verified: 0,
			email: "test1.email@example.com",
		});

		await userTableHelper.create({
			...userTableHelper.baseDatabaseUser,
			id: "user2Id",
			email_verified: 1,
			email: "test2.email@example.com",
		});

		await sessionTableHelper.create({
			id: authUseCase.hashToken(sessionToken1),
			user_id: "user1Id",
			expires_at: Date.now(),
		});

		await sessionTableHelper.create({
			id: authUseCase.hashToken(sessionToken2),
			user_id: "user2Id",
			expires_at: Date.now(),
		});
	});

	test("Pass with valid authorization header that email verification is not required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ emailVerificationRequired: false }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: `Bearer ${sessionToken1}`,
				},
			}),
		);
		const text = await res.text();

		expect(res.status).toBe(200);
		expect(text).toBe("Test");
	});

	test("Pass with valid authorization header that email verification is required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ emailVerificationRequired: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: `Bearer ${sessionToken2}`,
				},
			}),
		);
		const text = await res.text();

		expect(res.status).toBe(200);
		expect(text).toBe("Test");
	});

	test("Fail with not email verified yet", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ emailVerificationRequired: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: `Bearer ${sessionToken1}`,
				},
			}),
		);

		expect(res.status).toBe(401);
	});

	test("Fail with invalid authorization header that email verification is not required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ emailVerificationRequired: false }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: "Bearer invalidSessionId1",
				},
			}),
		);

		expect(res.status).toBe(401);
	});

	test("Fail with invalid authorization header that email verification is not required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ emailVerificationRequired: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: "Bearer invalidSessionId2",
				},
			}),
		);

		expect(res.status).toBe(401);
	});
});
