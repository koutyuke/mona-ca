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

describe("ProviderConnectionTicketRepository.save", () => {
	beforeEach(async () => {
		await providerConnectionTicketTableDriver.deleteAll();
		await userTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create data in database", async () => {
		const { providerConnectionTicket: ticket } = createProviderConnectionTicketFixture({
			providerConnectionTicket: {
				userId: userRegistration.id,
			},
		});

		await providerConnectionTicketRepository.save(ticket);

		const results = await providerConnectionTicketTableDriver.findById(ticket.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertProviderConnectionTicketToRaw(ticket));
	});
});
