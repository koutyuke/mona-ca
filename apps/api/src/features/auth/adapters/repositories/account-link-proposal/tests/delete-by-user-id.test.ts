import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
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

describe("AccountLinkProposalRepository.deleteByUserId", () => {
	beforeEach(async () => {
		await accountLinkProposalTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete a proposals for a user", async () => {
		const { accountLinkProposal } = createAccountLinkProposalFixture({
			accountLinkProposal: {
				userId: userRegistration.id,
			},
		});
		await accountLinkProposalTableDriver.save(convertAccountLinkProposalToRaw(accountLinkProposal));

		await accountLinkProposalRepository.deleteByUserId(accountLinkProposal.userId);

		const databaseProposals = await accountLinkProposalTableDriver.findByUserId(userRegistration.id);
		expect(databaseProposals).toHaveLength(0);
	});

	test("should not throw error when deleting for a user with no proposals", async () => {
		const userId = newUserId("nonExistentUser");

		// Should not throw an error
		await expect(accountLinkProposalRepository.deleteByUserId(userId)).resolves.not.toThrow();
	});
});
