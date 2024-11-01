# mona-ca Backend API Server

## What's this ?

This is the code for the Server-Side API of mona-ca.

It is made by these:

* __Bun__ 🥟: All-in-one JavaScript runtime
* __Wrangler__ ☁️: The Cloudflare Developer Platform
* __ElysiaJS__ 🦊: Ergonomic web framework
* __Drizzle ORM__ 🌦️: Headless TypeScript ORM
* __Lucia__ 🔐: Auth library
* __Oslo__ 🔒: Many auth utilities
* __Arctic__ 🔏: Collection of OAuth 2.0 clients
* __Resend__ ✉️: Library for the Resend API.

Project Architecture:

* __Clean Architecture__ 📚: to ensure independence
* __Repository Pattern__ 🗄️: Abstraction of data access
* __SOLID Principles__ 🔄: Programming Principles

## Start Development Server

To start the development server run:

```sh
# install
bun i

# dev server start
bun dev
```

## OpenAPI

```sh
open http://localhost:8787/swagger
```

## Development Tool Commands

### Check

static code check about syntax, format, import

```sh
# not fixed
bun check

# force fix
bun check:fix
```

### Test

```sh
# run test
bun run test # not `bun test`

# run test (watch mode)
bun run test:watch
```

### Type Check

```sh
bun type-check
```

### Database

```sh
# generate migration files
db:gen

# migration
db:mig

# start Drizzle studio(local)
db:std

# start Drizzle studio(remote)
db:std:remote
```

### Other

See `scripts` field in [`package.json`](https://github.com/koutyuke/mona-ca/blob/main/apps/api/package.json)
