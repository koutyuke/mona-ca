/* tslint:disable */
/* eslint-disable */
/**
* @param {string} password
* @param {HashOptions | undefined} [options]
* @returns {string}
*/
export function hash(password: string, options?: HashOptions): string;
/**
* @param {string} password
* @param {string} hash
* @returns {boolean}
*/
export function verify(password: string, hash: string): boolean;
/**
*/
export class HashOptions {
  free(): void;
/**
*/
  memory_cost: number;
/**
*/
  parallelism: number;
/**
*/
  time_cost: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_hashoptions_free: (a: number) => void;
  readonly __wbg_get_hashoptions_time_cost: (a: number) => number;
  readonly __wbg_set_hashoptions_time_cost: (a: number, b: number) => void;
  readonly __wbg_get_hashoptions_memory_cost: (a: number) => number;
  readonly __wbg_set_hashoptions_memory_cost: (a: number, b: number) => void;
  readonly __wbg_get_hashoptions_parallelism: (a: number) => number;
  readonly __wbg_set_hashoptions_parallelism: (a: number, b: number) => void;
  readonly hash: (a: number, b: number, c: number, d: number) => void;
  readonly verify: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
