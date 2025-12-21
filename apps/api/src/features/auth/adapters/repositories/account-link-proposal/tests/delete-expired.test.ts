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
const { userRegistration: userRegistration2 } = createAuthUserFixture({
	userRegistration: {
		email: "user2@example.com",
	},
});

describe("AccountLinkProposalRepository.deleteExpiredProposals", () => {
	beforeEach(async () => {
		await accountLinkProposalTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration2));
	});

	test("should delete expired proposals but keep valid ones", async () => {
		const expiredProposal = createAccountLinkProposalFixture({
			accountLinkProposal: {
				userId: userRegistration.id,
				expiresAt: new Date(0),
			},
		});

		const validProposal = createAccountLinkProposalFixture({
			accountLinkProposal: {
				userId: userRegistration2.id,
			},
		});

		await accountLinkProposalTableDriver.save(convertAccountLinkProposalToRaw(expiredProposal.accountLinkProposal));
		await accountLinkProposalTableDriver.save(convertAccountLinkProposalToRaw(validProposal.accountLinkProposal));

		await accountLinkProposalRepository.deleteExpiredProposals();

		const expiredProposalAfterDelete = await accountLinkProposalTableDriver.findById(
			expiredProposal.accountLinkProposal.id,
		);
		expect(expiredProposalAfterDelete).toHaveLength(0);

		const validProposalAfterDelete = await accountLinkProposalTableDriver.findById(
			validProposal.accountLinkProposal.id,
		);

		expect(validProposalAfterDelete).toHaveLength(1);
		expect(validProposalAfterDelete[0]).toStrictEqual(
			convertAccountLinkProposalToRaw(validProposal.accountLinkProposal),
		);
	});

	test("should do nothing when there are no expired proposals", async () => {
		const validProposal = createAccountLinkProposalFixture({
			accountLinkProposal: {
				userId: userRegistration2.id,
			},
		});

		await accountLinkProposalTableDriver.save(convertAccountLinkProposalToRaw(validProposal.accountLinkProposal));

		await accountLinkProposalRepository.deleteExpiredProposals();

		const validProposalAfterDelete = await accountLinkProposalTableDriver.findById(
			validProposal.accountLinkProposal.id,
		);

		expect(validProposalAfterDelete).toHaveLength(1);
		expect(validProposalAfterDelete[0]).toStrictEqual(
			convertAccountLinkProposalToRaw(validProposal.accountLinkProposal),
		);
	});
});
