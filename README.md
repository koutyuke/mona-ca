<img src="https://github.com/user-attachments/assets/dd71116e-4799-47e5-a3de-73384f564ef2"  width="100%" height="auto"  />

# mona-ca

mona-ca is an Application that shares information about a girl's period with her partner.

## What's inside?

The project uses a mono-repo structure, with the main functions and modules organized in the following directories

### `📱 apps` - application directory

- `🌐 web`: It contains the source code associated with the web application.
- `📱 mobile`: It contains the source code associated with the mobile application.
- `🖥️ api`: It contains the source code associated with the API server.

### `📦 packages` - package directory

It includes packages and libraries that will be reused throughout the project.

- `⚙️ core`: It includes common packages related to business logic and data processing.
- `🎨 ui`: It includes common packages related to UI components and styling.

### `🛠️ tools` - tool directory

It includes tools and settings related to development and operation.


## Setup the Development Environment

### 1. clone git repository

```sh
git clone https://github.com/koutyuke/mona-ca.git && cd mona-ca
```

### 2. install runtime & package manager

We use [proto](https://moonrepo.dev/proto) as a version control tool.

```sh
proto use
```

### 3. set environment variables

See `.env.example` for each application

### 4. install dependencies

```sh
bun i
```

### 5. set git hook

```sh
bunx lefthook install
```

## Docker Compose

```sh
# up
docker compose -f ./docker/docker-compose.development.yaml up -d

# down
docker compose -f ./docker/docker-compose.development.yaml down
```

## Development Tool Commands

Perform various checks on all files.

```sh
# build
bun run build

# static code check(lint, fmt, imports)
bun run check

# static code check(lint, fmt, imports) & fix
bun run check:fix

# type check
bun run typecheck

# test
bun run test

# Other
# See `scripts` field in `package.json`
```

## CI in the local environment

Perform CI performed by Github Action in a local environment

Install [`act`](https://github.com/nektos/act) and Start `Docker`

```sh
# all CI
act --container-architecture linux/amd64 --secret-file ./.github/act/.secrets --env-file ./.github/act/.env --defaultbranch main

# app-build
act --container-architecture linux/amd64 --secret-file ./.github/act/.secrets --env-file ./.github/act/.env --defaultbranch main -W ./.github/workflows/app-build.yaml

# app-test
act --container-architecture linux/amd64 --secret-file ./.github/act/.secrets --env-file ./.github/act/.env --defaultbranch main -W ./.github/workflows/app-test.yaml

# app-static-check
act --container-architecture linux/amd64 --secret-file ./.github/act/.secrets --env-file ./.github/act/.env --defaultbranch main -W ./.github/workflows/app-static-check.yaml

# api-deploy-cloudflare
act --container-architecture linux/amd64 --secret-file ./.github/act/.secrets --env-file ./.github/act/.env --defaultbranch main -W ./.github/workflows/api-deploy-cloudflare.yaml

# catalog-build
act --container-architecture linux/amd64 --secret-file ./.github/act/.secrets --env-file ./.github/act/.env --defaultbranch main -W ./.github/workflows/catalog-build.yaml
```

## Note

> [!NOTE]
> Since Biome's VSCode extension does not support workspaces, all settings are rolled up and configured in root's `biome.json`.
