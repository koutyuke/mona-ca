import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { AccountAssociationChallenge } from "./account-association-challenge";
import { AccountAssociationConfirm } from "./account-association-confirm";
import { AccountAssociationPreview } from "./account-association-preview";

export const AccountAssociation = new ElysiaWithEnv()
	.use(AccountAssociationChallenge)
	.use(AccountAssociationConfirm)
	.use(AccountAssociationPreview);
