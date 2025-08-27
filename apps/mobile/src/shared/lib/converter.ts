export const bytesToHex = (bytes: Uint8Array) => {
	return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
};
