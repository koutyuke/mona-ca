# mona-ca Server-Side API

## 📜 What's this ?

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

## 🛠️ Development

### Start Development Server

To start the development server run:
```sh
# install
bun i

# dev server start
bun dev
```

### OpenAPI

After starting the server, Go to [`localhost:8787/swagger`](http://localhost:8787/swagger)

### Development Tool Commands

__Lint__

static code syntax check

```sh
# not fixed
bun lint

# force fix
bun lint:fix
```

__Format__

static code format check

```sh
# not fixed
bun fmt

# force fix
bun fmt:fix
```

__Test__

do test command.

```sh
# run test
bun run test # not `bun test`

# run test (watch mode)
bun run test:watch
```

__Type Check__

code type check command.

```sh
bun type-check
```

__Other__

See `scripts` field in [`package.json`](https://github.com/koutyuke/mona-ca/blob/main/apps/api/package.json)
