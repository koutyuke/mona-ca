import path from "node:path";
import { baseConfig } from "@mona-ca/tailwind-config";
import { createContext } from "tailwindcss/lib/lib/setupContextUtils";
import resolveConfig from "tailwindcss/resolveConfig";
import { fileWrite } from "../scripts/utils/file-write";

const context = createContext(resolveConfig(baseConfig));

const pseudoClassesTypes = [...context.variantMap.keys()].map(c => `"${c}"`).join("\n  | ");

const exportContent = `export type PseudoClass = 
  | ${pseudoClassesTypes};
`;

fileWrite(`${path.resolve(__dirname, "../types/pseudo-class.type.ts")}`, exportContent);
