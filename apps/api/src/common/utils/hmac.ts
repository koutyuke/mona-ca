import { createHmac } from "node:crypto";
import { timingSafeStringEqual } from "./timing-safe-string-equal";

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
	return timingSafeStringEqual(generatedHmac, mac);
};
