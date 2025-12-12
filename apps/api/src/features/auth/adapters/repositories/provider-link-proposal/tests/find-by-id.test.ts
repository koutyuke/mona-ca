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

describe("ProviderLinkProposalRepository.findById", () => {
	beforeEach(async () => {
		await providerLinkProposalTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should return proposal from proposalId", async () => {
		const { providerLinkProposal } = createProviderLinkProposalFixture({
			providerLinkProposal: {
				userId: userRegistration.id,
			},
		});
		await providerLinkProposalTableDriver.save(convertProviderLinkProposalToRaw(providerLinkProposal));

		const foundProposal = await providerLinkProposalRepository.findById(providerLinkProposal.id);
		const expectedProposal = convertProviderLinkProposalToRaw(providerLinkProposal);

		expect(foundProposal).toBeDefined();
		expect(expectedProposal).toStrictEqual(convertProviderLinkProposalToRaw(foundProposal!));
	});

	test("should return null if proposal not found", async () => {
		const foundProposal = await providerLinkProposalRepository.findById(newProviderLinkProposalId("wrongProposalId"));
		expect(foundProposal).toBeNull();
	});
});
