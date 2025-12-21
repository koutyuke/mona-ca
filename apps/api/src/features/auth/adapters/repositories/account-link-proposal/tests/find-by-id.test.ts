import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { AccountLinkProposalsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { newAccountLinkProposalId } from "../../../../domain/value-objects/ids";
import { convertAccountLinkProposalToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAccountLinkProposalFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { AccountLinkProposalRepository } from "../account-link-proposal.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountLinkProposalRepository = new AccountLinkProposalRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const accountLinkProposalTableDriver = new AccountLinkProposalsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("AccountLinkProposalRepository.findById", () => {
	beforeEach(async () => {
		await accountLinkProposalTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should return proposal from proposalId", async () => {
		const { accountLinkProposal } = createAccountLinkProposalFixture({
			accountLinkProposal: {
				userId: userRegistration.id,
			},
		});
		await accountLinkProposalTableDriver.save(convertAccountLinkProposalToRaw(accountLinkProposal));

		const foundProposal = await accountLinkProposalRepository.findById(accountLinkProposal.id);
		const expectedProposal = convertAccountLinkProposalToRaw(accountLinkProposal);

		expect(foundProposal).toBeDefined();
		expect(expectedProposal).toStrictEqual(convertAccountLinkProposalToRaw(foundProposal!));
	});

	test("should return null if proposal not found", async () => {
		const foundProposal = await accountLinkProposalRepository.findById(newAccountLinkProposalId("wrongProposalId"));
		expect(foundProposal).toBeNull();
	});
});
