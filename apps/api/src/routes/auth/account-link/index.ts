import { Elysia } from "elysia";
import { AccountLinkCallback } from "./account-link-callback";
import { AccountLinkRequest } from "./account-link-request";

export const AccountLink = new Elysia().use(AccountLinkRequest).use(AccountLinkCallback);
