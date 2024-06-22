# `@mona-ca/argon2id`

## What's this Package?

This package is a library for fast hashing of argon2id in edge environments such as Cloudflare.

Under `Cloudflare` environment, there are no optimized hashing functions per runtime such as `Bun` and `Node`.

However, the library implemented in Vanilla.js (Ex: [`@noble/hashes`](https://github.com/paulmillr/noble-hashes)) also takes too much processing time.

Therefore, `WASM` (WebAssembly) is used to enable fast hashing with `argon2id`.

## What's inside?

```
.
├── bin // Files transpiled in wasm
│   ├── wasm_argon2.d.ts
│   ├── wasm_argon2.js
│   ├── wasm_argon2_bg.wasm
│   └── wasm_argon2_bg.wasm.d.ts
│
├── src // Source Code
│   ├── index.test.ts // Test file
│   ├── index.ts // Js Module file
│   └── lib.rs // Argon2Id implementation file
```

## How to use?

This Package is Typescript Module

```ts

const argon2id = new Argon2id(); // create instance.

await argon2id.initialize(); // initialize

// Hash
const hashedPassword = await argon2id.hash("password");
// -> $argon2id$v=19$m=19456,t=2,p=1$ejLtLa+1TkAACZVQFL8UlQ$mtg13w2XPqJ5ezzVqusc8zjgdAMS58+jmyzXA+Yg+g0

// Verify
const isValid = await argon2id.verify(hashedPassword, "password");
// -> true/false

```

## Reference Articles

* [`@auth70/argon2-wasi`](https://github.com/auth70/argon2-wasi)
* [`@magicalpuffin/tutorial-cloudflare-lucia-argon2`](https://github.com/magicalpuffin/tutorial-cloudflare-lucia-argon2)
