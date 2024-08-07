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
│   ├── wasm_argon2_bg.js
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

### Create Instance

```ts
const argon2id = new Argon2id(); // create instance.
// or
const argon2id = new Argon2id({
  memory_cost: 47104,
  time_cost: 1 ,
  parallelism: 1,
})

```

### Hash

```ts
const hashedPassword = await argon2id.hash("password");
// -> $argon2id$v=19$m=19456,t=2,p=1$ejLtLa+1TkAACZVQFL8UlQ$mtg13w2XPqJ5ezzVqusc8zjgdAMS58+jmyzXA+Yg+g0
```


### Verify

```ts
const isValid = await argon2id.verify(hashedPassword, "password");
// -> true/false

```

## Reference Articles

* [`@auth70/argon2-wasi`](https://github.com/auth70/argon2-wasi)
* [`@magicalpuffin/tutorial-cloudflare-lucia-argon2`](https://github.com/magicalpuffin/tutorial-cloudflare-lucia-argon2)


> [!WARNING]
>
> Since the wasm file is not loaded in the test with [@cloudflare/vitest-pool-workers](https://github.com/cloudflare/workers-sdk/tree/main/packages/vitest-pool-workers), I am currently using the one that is reimplemented in the api as `argon2idService`. (The implementation is all the same)