import { createHmac } from "node:crypto";
import { constantTimeCompare } from "./constant-time-compare";

export const generateHMAC = (
	data: string,
	secret: string,
	encoding: "base64" | "hex" | "base64url" = "hex",
): string => {
	const mac = createHmac("sha256", secret);
	mac.update(data);
	return mac.digest(encoding);
};

export const verifyHMAC = (
	data: string,
	secret: string,
	mac: string,
	encoding: "base64" | "hex" | "base64url" = "hex",
): boolean => {
	const generatedHmac = generateHMAC(data, secret, encoding);
	return constantTimeCompare(generatedHmac, mac);
};
