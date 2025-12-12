import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ProviderLinkProposalsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { newProviderLinkProposalId } from "../../../../domain/value-objects/ids";
import { convertProviderLinkProposalToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createProviderLinkProposalFixture } from "../../../../testing/fixtures";
import { ProviderLinkProposalRepository } from "../provider-link-proposal.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const providerLinkProposalRepository = new ProviderLinkProposalRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const providerLinkProposalTableDriver = new ProviderLinkProposalsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("ProviderLinkProposalRepository.delete", () => {
	beforeEach(async () => {
		await providerLinkProposalTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete proposal by id", async () => {
		const { providerLinkProposal } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
			},
		});
		await providerLinkProposalTableDriver.save(convertProviderLinkProposalToRaw(providerLinkProposal));

		await providerLinkProposalRepository.deleteById(providerLinkProposal.id);

		const databaseProposals = await providerLinkProposalTableDriver.findById(providerLinkProposal.id);
		expect(databaseProposals).toHaveLength(0);
	});

	test("should not throw error when deleting non-existent proposal", async () => {
		const nonExistentProposalId = newProviderLinkProposalId("nonExistentProposalId");

		await expect(providerLinkProposalRepository.deleteById(nonExistentProposalId)).resolves.not.toThrow();
	});
});
