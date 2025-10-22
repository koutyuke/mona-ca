import type { NewType } from "@mona-ca/core/utils";
import { StringEnum } from "../../lib/types";

export type ClientType = NewType<"clientType", "web" | "mobile">;

export const newClientType = (rawClientType: "web" | "mobile") => {
	return rawClientType as ClientType;
};

export const clientTypeSchema = StringEnum(["web", "mobile"]);
