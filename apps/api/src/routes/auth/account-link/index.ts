import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { AccountLinkCallback } from "./account-link-callback";
import { AccountLinkRequest } from "./account-link-request";

export const AccountLink = new ElysiaWithEnv().use(AccountLinkRequest).use(AccountLinkCallback);
