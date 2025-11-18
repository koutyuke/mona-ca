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

describe("ProviderConnectionTicketRepository.deleteByUserId", () => {
	beforeEach(async () => {
		await providerConnectionTicketTableHelper.deleteAll();
		await userTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete data in database", async () => {
		const { providerConnectionTicket: ticket } = createProviderConnectionTicketFixture({
			providerConnectionTicket: {
				userId: userRegistration.id,
			},
		});
		await providerConnectionTicketTableHelper.save(convertProviderConnectionTicketToRaw(ticket));

		await providerConnectionTicketRepository.deleteByUserId(ticket.userId);

		const results = await providerConnectionTicketTableHelper.findByUserId(ticket.userId);

		expect(results.length).toBe(0);
	});
});
