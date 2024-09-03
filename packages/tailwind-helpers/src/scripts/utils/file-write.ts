import fs from "node:fs";
const fileWrite = (path: string, content: string) => {
	fs.writeFileSync(path, content, "utf-8");
};

export { fileWrite };
