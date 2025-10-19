import { env } from "cloudflare:test";
import { afterEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { SignupSessionTableHelper, toRawDate, toRawSessionSecretHash } from "../../../../../../shared/testing/helpers";
import { createSignupSessionFixture } from "../../../../testing/fixtures";
import { SignupSessionRepository } from "../signup-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const signupSessionRepository = new SignupSessionRepository(drizzleService);

const signupSessionTableHelper = new SignupSessionTableHelper(DB);

describe("SignupSessionRepository.save", () => {
	afterEach(async () => {
		await signupSessionTableHelper.deleteAll();
	});

	test("should create signup session in database", async () => {
		const { signupSession } = createSignupSessionFixture();

		await signupSessionRepository.save(signupSession);

		const results = await signupSessionTableHelper.findById(signupSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			id: signupSession.id,
			email: signupSession.email,
			email_verified: Number(signupSession.emailVerified) as 0 | 1,
			code: signupSession.code,
			secret_hash: toRawSessionSecretHash(signupSession.secretHash),
			expires_at: toRawDate(signupSession.expiresAt),
		});
	});

	test("should update signup session in database if already exists", async () => {
		const expiresAt = new Date(1704067200 * 1000 + 60_000);
		const { signupSession } = createSignupSessionFixture();
		await signupSessionRepository.save(signupSession);

		const updatedSignupSession = {
			...signupSession,
			emailVerified: true,
			expiresAt,
		};

		await signupSessionRepository.save(updatedSignupSession);

		const results = await signupSessionTableHelper.findById(signupSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			id: updatedSignupSession.id,
			email: updatedSignupSession.email,
			email_verified: 1,
			code: updatedSignupSession.code,
			secret_hash: toRawSessionSecretHash(updatedSignupSession.secretHash),
			expires_at: toRawDate(expiresAt),
		});
	});
});
