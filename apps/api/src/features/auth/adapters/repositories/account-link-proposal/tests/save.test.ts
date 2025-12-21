import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { AccountLinkProposalsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertAccountLinkProposalToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAccountLinkProposalFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { AccountLinkProposalRepository } from "../account-link-proposal.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountLinkProposalRepository = new AccountLinkProposalRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const accountLinkProposalTableDriver = new AccountLinkProposalsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("AccountLinkProposalRepository.save", () => {
	beforeEach(async () => {
		await accountLinkProposalTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create a new proposal in the database", async () => {
		const { accountLinkProposal } = createAccountLinkProposalFixture({
			accountLinkProposal: {
				userId: userRegistration.id,
			},
		});
		await accountLinkProposalRepository.save(accountLinkProposal);

		const databaseProposals = await accountLinkProposalTableDriver.findById(accountLinkProposal.id);

		expect(databaseProposals.length).toBe(1);
		expect(databaseProposals[0]).toStrictEqual(convertAccountLinkProposalToRaw(accountLinkProposal));
	});
});
