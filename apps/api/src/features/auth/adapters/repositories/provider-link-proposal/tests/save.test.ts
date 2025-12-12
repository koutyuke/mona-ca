import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ProviderLinkProposalsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertProviderLinkProposalToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createProviderLinkProposalFixture } from "../../../../testing/fixtures";
import { ProviderLinkProposalRepository } from "../provider-link-proposal.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const providerLinkProposalRepository = new ProviderLinkProposalRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const providerLinkProposalTableDriver = new ProviderLinkProposalsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("ProviderLinkProposalRepository.save", () => {
	beforeEach(async () => {
		await providerLinkProposalTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create a new proposal in the database", async () => {
		const { providerLinkProposal } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
			},
		});
		await providerLinkProposalRepository.save(providerLinkProposal);

		const databaseProposals = await providerLinkProposalTableDriver.findById(providerLinkProposal.id);

		expect(databaseProposals.length).toBe(1);
		expect(databaseProposals[0]).toStrictEqual(convertProviderLinkProposalToRaw(providerLinkProposal));
	});
});
