import { assert, beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import {
	ProviderConnectionTicketRepositoryMock,
	createProviderConnectionTicketsMap,
} from "../../../../testing/mocks/repositories";
import { ProviderConnectionPrepareUseCase } from "../prepare.usecase";

const providerConnectionTicketMap = createProviderConnectionTicketsMap();
const tokenSecretService = new TokenSecretServiceMock();

const providerConnectionTicketRepository = new ProviderConnectionTicketRepositoryMock({
	providerConnectionTicketMap,
});
const providerConnectionPrepareUseCase = new ProviderConnectionPrepareUseCase(
	providerConnectionTicketRepository,
	tokenSecretService,
);

describe("ProviderConnectionPrepareUseCase", () => {
	beforeEach(() => {
		providerConnectionTicketMap.clear();
	});

	it("Success: should create provider connection ticket with valid user ID", async () => {
		const userId = newUserId(ulid());

		const result = await providerConnectionPrepareUseCase.execute(userId);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { providerConnectionTicket, providerConnectionTicketToken } = result.value;

		// check ticket
		expect(providerConnectionTicket.id).toBeDefined();
		expect(providerConnectionTicket.userId).toBe(userId);
		expect(providerConnectionTicket.expiresAt).toBeInstanceOf(Date);
		expect(providerConnectionTicket.expiresAt.getTime()).toBeGreaterThan(Date.now());

		// Mockの固定値を確認: TokenSecretServiceMockは `"token-secret"` を返す
		expect(providerConnectionTicket.secretHash).toStrictEqual(
			new TextEncoder().encode("__token-secret-hashed:token-secret"),
		);
		expect(providerConnectionTicketToken).toBe(`${providerConnectionTicket.id}.token-secret`);

		// check ticket is saved
		expect(providerConnectionTicketMap.size).toBe(1);
		const savedTicket = providerConnectionTicketMap.get(providerConnectionTicket.id);
		expect(savedTicket).toStrictEqual(providerConnectionTicket);
	});

	it("Success: should delete existing ticket for the same user before creating new one", async () => {
		const userId = newUserId(ulid());

		// First ticket creation
		const firstResult = await providerConnectionPrepareUseCase.execute(userId);
		assert(firstResult.isOk);
		expect(providerConnectionTicketMap.size).toBe(1);

		const firstTicketId = firstResult.value.providerConnectionTicket.id;

		// Second ticket creation for the same user
		const result = await providerConnectionPrepareUseCase.execute(userId);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		// セキュリティ: 既存のチケットが削除され、新しいチケットが作成されていること（再利用防止）
		expect(providerConnectionTicketMap.has(firstTicketId)).toBe(false);
		expect(providerConnectionTicketMap.size).toBe(1);
		expect(result.value.providerConnectionTicket.id).not.toBe(firstTicketId);
	});

	it("Success: should create different tickets for different users", async () => {
		const userId1 = newUserId(ulid());
		const userId2 = newUserId(ulid());

		const result1 = await providerConnectionPrepareUseCase.execute(userId1);
		const result2 = await providerConnectionPrepareUseCase.execute(userId2);

		expect(result1.isErr).toBe(false);
		expect(result2.isErr).toBe(false);
		assert(result1.isOk);
		assert(result2.isOk);

		// 異なるユーザーに対して異なるチケットが作成されること
		expect(result1.value.providerConnectionTicket.id).not.toBe(result2.value.providerConnectionTicket.id);
		expect(result1.value.providerConnectionTicket.userId).toBe(userId1);
		expect(result2.value.providerConnectionTicket.userId).toBe(userId2);
		expect(result1.value.providerConnectionTicketToken).not.toBe(result2.value.providerConnectionTicketToken);
		expect(providerConnectionTicketMap.size).toBe(2);
	});
});
