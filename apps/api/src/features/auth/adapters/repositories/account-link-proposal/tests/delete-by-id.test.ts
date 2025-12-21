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

describe("AccountLinkProposalRepository.delete", () => {
	beforeEach(async () => {
		await accountLinkProposalTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete proposal by id", async () => {
		const { accountLinkProposal } = createAccountLinkProposalFixture({
			accountLinkProposal: {
				userId: userRegistration.id,
			},
		});
		await accountLinkProposalTableDriver.save(convertAccountLinkProposalToRaw(accountLinkProposal));

		await accountLinkProposalRepository.deleteById(accountLinkProposal.id);

		const databaseProposals = await accountLinkProposalTableDriver.findById(accountLinkProposal.id);
		expect(databaseProposals).toHaveLength(0);
	});

	test("should not throw error when deleting non-existent proposal", async () => {
		const nonExistentProposalId = newAccountLinkProposalId("nonExistentProposalId");

		await expect(accountLinkProposalRepository.deleteById(nonExistentProposalId)).resolves.not.toThrow();
	});
});
