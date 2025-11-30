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

describe("ProviderConnectionTicketRepository.deleteByUserId", () => {
	beforeEach(async () => {
		await providerConnectionTicketTableDriver.deleteAll();
		await userTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete data in database", async () => {
		const { providerConnectionTicket: ticket } = createProviderConnectionTicketFixture({
			providerConnectionTicket: {
				userId: userRegistration.id,
			},
		});
		await providerConnectionTicketTableDriver.save(convertProviderConnectionTicketToRaw(ticket));

		await providerConnectionTicketRepository.deleteByUserId(ticket.userId);

		const results = await providerConnectionTicketTableDriver.findByUserId(ticket.userId);

		expect(results.length).toBe(0);
	});
});
