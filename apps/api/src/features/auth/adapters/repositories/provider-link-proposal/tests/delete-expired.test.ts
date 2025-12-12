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
const { userRegistration: userRegistration2 } = createAuthUserFixture({
	userRegistration: {
		email: "user2@example.com",
	},
});

describe("ProviderLinkProposalRepository.deleteExpiredProposals", () => {
	beforeEach(async () => {
		await providerLinkProposalTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration2));
	});

	test("should delete expired proposals but keep valid ones", async () => {
		const expiredProposal = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
				expiresAt: new Date(0),
			},
		});

		const validProposal = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration2.id,
			},
		});

		await providerLinkProposalTableDriver.save(convertProviderLinkProposalToRaw(expiredProposal.providerLinkProposal));
		await providerLinkProposalTableDriver.save(convertProviderLinkProposalToRaw(validProposal.providerLinkProposal));

		await providerLinkProposalRepository.deleteExpiredProposals();

		const expiredProposalAfterDelete = await providerLinkProposalTableDriver.findById(
			expiredProposal.providerLinkProposal.id,
		);
		expect(expiredProposalAfterDelete).toHaveLength(0);

		const validProposalAfterDelete = await providerLinkProposalTableDriver.findById(
			validProposal.providerLinkProposal.id,
		);

		expect(validProposalAfterDelete).toHaveLength(1);
		expect(validProposalAfterDelete[0]).toStrictEqual(
			convertProviderLinkProposalToRaw(validProposal.providerLinkProposal),
		);
	});

	test("should do nothing when there are no expired proposals", async () => {
		const validProposal = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration2.id,
			},
		});

		await providerLinkProposalTableDriver.save(convertProviderLinkProposalToRaw(validProposal.providerLinkProposal));

		await providerLinkProposalRepository.deleteExpiredProposals();

		const validProposalAfterDelete = await providerLinkProposalTableDriver.findById(
			validProposal.providerLinkProposal.id,
		);

		expect(validProposalAfterDelete).toHaveLength(1);
		expect(validProposalAfterDelete[0]).toStrictEqual(
			convertProviderLinkProposalToRaw(validProposal.providerLinkProposal),
		);
	});
});
