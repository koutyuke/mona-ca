import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ProviderConnectionTicketsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { createAuthUserFixture, createProviderConnectionTicketFixture } from "../../../../testing/fixtures";
import { convertProviderConnectionTicketToRaw, convertUserRegistrationToRaw } from "../../../../testing/libs";
import { ProviderConnectionTicketRepository } from "../provider-connection-ticket.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const providerConnectionTicketRepository = new ProviderConnectionTicketRepository(drizzleService);

const userTableHelper = new UsersTableDriver(DB);
const providerConnectionTicketTableHelper = new ProviderConnectionTicketsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("ProviderConnectionTicketRepository.findById", () => {
	beforeEach(async () => {
		await providerConnectionTicketTableHelper.deleteAll();
		await userTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should find data in database", async () => {
		const { ticket } = createProviderConnectionTicketFixture({
			ticket: {
				userId: userRegistration.id,
			},
		});

		await providerConnectionTicketTableHelper.save(convertProviderConnectionTicketToRaw(ticket));

		const result = await providerConnectionTicketRepository.findById(ticket.id);

		expect(result).not.toBeNull();
		expect(result?.id).toBe(ticket.id);
		expect(result?.userId).toBe(ticket.userId);
		expect(result?.expiresAt.getTime()).toBe(ticket.expiresAt.getTime());
	});

	test("should return null when not found", async () => {
		const { ticket } = createProviderConnectionTicketFixture({
			ticket: {
				userId: userRegistration.id,
			},
		});

		const result = await providerConnectionTicketRepository.findById(ticket.id);

		expect(result).toBeNull();
	});
});
