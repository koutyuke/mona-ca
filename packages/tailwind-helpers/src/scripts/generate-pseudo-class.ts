import path from "node:path";
import { baseConfig } from "@mona-ca/tailwind-config";
import { fileWrite } from "@tailwind-helpers/scripts/utils/fileWrite";
import { createContext } from "tailwindcss/lib/lib/setupContextUtils";
import resolveConfig from "tailwindcss/resolveConfig";

const context = createContext(resolveConfig(baseConfig));

const pseudoClassesTypes = [...context.variantMap.keys()].map(c => `"${c}"`).join("\n  | ");

// console.log(pseudoClassesTypes);

const exportContent = `export type PseudoClass = 
  | ${pseudoClassesTypes};
`;

fileWrite(`${path.resolve(__dirname, "../types/pseudo-class.type.ts")}`, exportContent);
