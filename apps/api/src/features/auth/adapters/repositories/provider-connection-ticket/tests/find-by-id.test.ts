import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ProviderConnectionTicketsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertProviderConnectionTicketToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createProviderConnectionTicketFixture } from "../../../../testing/fixtures";
import { ProviderConnectionTicketRepository } from "../provider-connection-ticket.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const providerConnectionTicketRepository = new ProviderConnectionTicketRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const providerConnectionTicketTableDriver = new ProviderConnectionTicketsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("ProviderConnectionTicketRepository.findById", () => {
	beforeEach(async () => {
		await providerConnectionTicketTableDriver.deleteAll();
		await userTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should find data in database", async () => {
		const { providerConnectionTicket: ticket } = createProviderConnectionTicketFixture({
			providerConnectionTicket: {
				userId: userRegistration.id,
			},
		});

		await providerConnectionTicketTableDriver.save(convertProviderConnectionTicketToRaw(ticket));

		const result = await providerConnectionTicketRepository.findById(ticket.id);

		expect(result).not.toBeNull();
		expect(result?.id).toBe(ticket.id);
		expect(result?.userId).toBe(ticket.userId);
		expect(result?.expiresAt.getTime()).toBe(ticket.expiresAt.getTime());
	});

	test("should return null when not found", async () => {
		const { providerConnectionTicket: ticket } = createProviderConnectionTicketFixture({
			providerConnectionTicket: {
				userId: userRegistration.id,
			},
		});

		const result = await providerConnectionTicketRepository.findById(ticket.id);

		expect(result).toBeNull();
	});
});
