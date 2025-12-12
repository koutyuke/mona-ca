import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
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

describe("ProviderLinkProposalRepository.deleteByUserId", () => {
	beforeEach(async () => {
		await providerLinkProposalTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete a proposals for a user", async () => {
		const { providerLinkProposal } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
			},
		});
		await providerLinkProposalTableDriver.save(convertProviderLinkProposalToRaw(providerLinkProposal));

		await providerLinkProposalRepository.deleteByUserId(providerLinkProposal.userId);

		const databaseProposals = await providerLinkProposalTableDriver.findByUserId(userRegistration.id);
		expect(databaseProposals).toHaveLength(0);
	});

	test("should not throw error when deleting for a user with no proposals", async () => {
		const userId = newUserId("nonExistentUser");

		// Should not throw an error
		await expect(providerLinkProposalRepository.deleteByUserId(userId)).resolves.not.toThrow();
	});
});
