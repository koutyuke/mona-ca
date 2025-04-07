import { StringEnum } from "../../common/schema";
import type { NewType } from "../../common/utils";

export type ClientType = NewType<"clientType", "web" | "mobile">;

export const newClientType = (rawClientType: "web" | "mobile") => {
	return rawClientType as ClientType;
};

export const clientTypeSchema = StringEnum(["web", "mobile"]);
