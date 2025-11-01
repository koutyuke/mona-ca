import Elysia from "elysia";
import { AccountAssociationChallenge } from "./account-association-challenge";
import { AccountAssociationConfirm } from "./account-association-confirm";
import { AccountAssociationPreview } from "./account-association-preview";

export const AccountAssociationRoutes = new Elysia({
	prefix: "/association",
})
	.use(AccountAssociationChallenge)
	.use(AccountAssociationConfirm)
	.use(AccountAssociationPreview);
