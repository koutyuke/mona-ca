import * as imports from "./wasm_argon2_bg.js";
import wasm from "./wasm_argon2_bg.wasm";
const instance = new WebAssembly.Instance(wasm, {
  "./wasm_argon2_bg.js": imports,
});
imports.__wbg_set_wasm(instance.exports);
export * from "./wasm_argon2_bg.js";
