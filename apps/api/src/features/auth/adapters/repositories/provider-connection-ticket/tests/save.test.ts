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

describe("ProviderConnectionTicketRepository.save", () => {
	beforeEach(async () => {
		await providerConnectionTicketTableHelper.deleteAll();
		await userTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create data in database", async () => {
		const { ticket } = createProviderConnectionTicketFixture({
			ticket: {
				userId: userRegistration.id,
			},
		});

		await providerConnectionTicketRepository.save(ticket);

		const results = await providerConnectionTicketTableHelper.findById(ticket.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertProviderConnectionTicketToRaw(ticket));
	});
});
