<div align="center">

  <img src="./assets/social-header.png" alt="mona-ca: Share period information with your partner" width="100%" height="auto"/>

  # mona-ca

  <p align="center">
    <a href="https://skillicons.dev"><img src="https://skillicons.dev/icons?i=ts,nextjs,react,tailwind,elysia,bun,cloudflare,github,docker,vscode,githubactions" /></a>
  </p>

  <p align="center">
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-blue" alt="License Badge" /></a>
    <img src="https://img.shields.io/badge/storybook-available-brightgreen" alt="Storybook Badge" />
  </p>

  [OpenAPI](https://api.mona-ca.com/docs)

</div>

## What is mona-ca?

mona-ca is an Application that shares information about a girl's period with her partner.

With customizable UI and messages, users can manage their menstrual cycles and share them with their partners.

## Project Structure

The project uses a mono-repo structure, with the main functions and modules organized in the following directories

### `📱 apps`

The directory that manages the source code of the application.

- `🌐 web` - Web application
  - Next.js and React are used for the frontend implementation.
- `📱 mobile` - Mobile application
  - React Native is used for the cross-platform app.
- `🖥️ api` - API server
  - Elysia and Bun are used for the backend implementation.

### `📦 packages`

The directory that manages reusable packages for the project.

- `⚙️ core` - Core package
  - Common functions related to business logic and data processing.
- `🎨 ui` - UI package
  - Common functions related to React components and styling.

### `🛠️ tools`

The directory that manages tools and settings related to development and operation.

## Setup the Development Environment

### 1. clone git repository

```sh
git clone https://github.com/koutyuke/mona-ca.git && cd mona-ca
```

### 2. install runtime & package manager

We use [mise](https://mise.jdx.dev/) as a version control tool.

```sh
mise install
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
docker compose up -d

# down
docker compose down
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
act --container-architecture linux/amd64 --secret-file ./.github/act/.secrets --env-file ./.github/act/.env --defaultbranch main -W "target-flow"
```

## Note

> [!NOTE]
> Since Biome's VSCode extension does not support workspaces, all settings are rolled up and configured in root's `biome.json`.
