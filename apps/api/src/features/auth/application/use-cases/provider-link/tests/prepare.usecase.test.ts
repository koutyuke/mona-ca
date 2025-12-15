import { assert, beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import {
	ProviderLinkRequestRepositoryMock,
	createProviderLinkRequestMap,
} from "../../../../testing/mocks/repositories";
import { ProviderLinkPrepareUseCase } from "../prepare.usecase";

const providerLinkRequestMap = createProviderLinkRequestMap();
const tokenSecretService = new TokenSecretServiceMock();

const providerLinkRequestRepository = new ProviderLinkRequestRepositoryMock({
	providerLinkRequestMap,
});
const providerLinkPrepareUseCase = new ProviderLinkPrepareUseCase(providerLinkRequestRepository, tokenSecretService);

describe("ProviderLinkPrepareUseCase", () => {
	beforeEach(() => {
		providerLinkRequestMap.clear();
	});

	it("Success: should create provider link request with valid user ID", async () => {
		const userId = newUserId(ulid());

		const result = await providerLinkPrepareUseCase.execute(userId);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { providerLinkRequest, providerLinkRequestToken } = result.value;

		// check request
		expect(providerLinkRequest.id).toBeDefined();
		expect(providerLinkRequest.userId).toBe(userId);
		expect(providerLinkRequest.expiresAt).toBeInstanceOf(Date);
		expect(providerLinkRequest.expiresAt.getTime()).toBeGreaterThan(Date.now());

		// Mockの固定値を確認: TokenSecretServiceMockは `"token-secret"` を返す
		expect(providerLinkRequest.secretHash).toStrictEqual(
			new TextEncoder().encode("__token-secret-hashed:token-secret"),
		);
		expect(providerLinkRequestToken).toBe(`${providerLinkRequest.id}.token-secret`);

		// check request is saved
		expect(providerLinkRequestMap.size).toBe(1);
		const savedRequest = providerLinkRequestMap.get(providerLinkRequest.id);
		expect(savedRequest).toStrictEqual(providerLinkRequest);
	});

	it("Success: should delete existing request for the same user before creating new one", async () => {
		const userId = newUserId(ulid());

		// First request creation
		const firstResult = await providerLinkPrepareUseCase.execute(userId);
		assert(firstResult.isOk);
		expect(providerLinkRequestMap.size).toBe(1);

		const firstRequestId = firstResult.value.providerLinkRequest.id;

		// Second request creation for the same user
		const result = await providerLinkPrepareUseCase.execute(userId);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		// セキュリティ: 既存のリクエストが削除され、新しいリクエストが作成されていること（再利用防止）
		expect(providerLinkRequestMap.has(firstRequestId)).toBe(false);
		expect(providerLinkRequestMap.size).toBe(1);
		expect(result.value.providerLinkRequest.id).not.toBe(firstRequestId);
	});

	it("Success: should create different requests for different users", async () => {
		const userId1 = newUserId(ulid());
		const userId2 = newUserId(ulid());

		const result1 = await providerLinkPrepareUseCase.execute(userId1);
		const result2 = await providerLinkPrepareUseCase.execute(userId2);

		expect(result1.isErr).toBe(false);
		expect(result2.isErr).toBe(false);
		assert(result1.isOk);
		assert(result2.isOk);

		// 異なるユーザーに対して異なるリクエストが作成されること
		expect(result1.value.providerLinkRequest.id).not.toBe(result2.value.providerLinkRequest.id);
		expect(result1.value.providerLinkRequest.userId).toBe(userId1);
		expect(result2.value.providerLinkRequest.userId).toBe(userId2);
		expect(result1.value.providerLinkRequestToken).not.toBe(result2.value.providerLinkRequestToken);
		expect(providerLinkRequestMap.size).toBe(2);
	});
});
