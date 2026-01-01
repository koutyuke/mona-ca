# mona-ca Backend API Server

Backend API server for mona-ca.

## 📖 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup](#setup)
- [Development](#development)
- [Testing](#testing)
- [Database](#database)
- [Deployment](#deployment)

## Overview

mona-ca Backend API is a serverless API server running on Cloudflare Workers.
Built with Clean Architecture principles to ensure high maintainability and extensibility.

## Tech Stack

It is made by these:

__Bun__ 🥟: All-in-one JavaScript runtime

__Wrangler__ ☁️: The Cloudflare Developer Platform

__ElysiaJS__ 🦊: Ergonomic web framework

__Drizzle ORM__ 🌦️: Headless TypeScript ORM

__Lucia__ 🔐: Auth library

__Oslo__ 🔒: Many auth utilities

__Arctic__ 🔏: Collection of OAuth 2.0 clients

__Resend__ ✉️: Library for the Resend API.

## Architecture

Built on Clean Architecture, DDD, and Onion Architecture with a layered architecture pattern.

### Architecture Principles

- **Clean Architecture**: Keep business logic independent from frameworks and infrastructure
- **DDD**: Domain-Driven Design
- **Onion Architecture**: Onion Architecture
- **Repository Pattern**: Abstract data access logic
- **SOLID Principles**: Design principles for maintainability and extensibility
- **Dependency Injection**: Improve testability
- **Feature-based Organization**: Organize code by domain features

### Layer Structure

```text
┌─────────────────────────────────────┐
│      Presentation Layer             │  routes/
│      (ElysiaJS Routes)              │
├─────────────────────────────────────┤
│      Adapter Layer                  │  features/*/adapters/
│  (Presenters, Repositories,         │
│   Gateways)                         │
├─────────────────────────────────────┤
│      Application Layer              │  features/*/application/
│      (Use Cases, Ports)             │
├─────────────────────────────────────┤
│      Domain Layer                   │  features/*/domain/
│  (Entities, Value Objects)          │
├─────────────────────────────────────┤
│      Infrastructure Layer           │  core/infra/
│  (Drizzle, Crypto, Config)          │
└─────────────────────────────────────┘
```

See [Architecture Documentation](./docs/architecture.md) for details.

### Directory Structure

```text
apps/api/
├── src/
│   ├── core/                 # Common infrastructure & libraries
│   │   ├── adapters/         # Common adapter implementations
│   │   ├── di/               # DI container
│   │   ├── domain/           # Common domain objects
│   │   ├── infra/            # Infrastructure implementations
│   │   ├── lib/              # Common libraries
│   │   ├── ports/            # Common interfaces
│   │   └── testing/          # Testing support
│   ├── features/             # Feature modules
│   │   └── [feature]/        # Each feature
│   │       ├── adapters/     # Adapter layer
│   │       ├── application/  # Application layer
│   │       ├── di/           # Feature DI container
│   │       ├── domain/       # Domain layer
│   │       └── testing/      # Testing support
│   ├── plugins/              # Elysia plugins
│   ├── routes/               # Route definitions
│   └── index.ts              # Entry point
├── tests/                    # E2E tests
├── drizzle/                  # DB migrations
├── docs/                     # Documentation
├── types/                    # Type definitions
├── package.json              # Package configuration
├── tsconfig.json
├── vitest.config.ts
├── wrangler.jsonc            # Cloudflare configuration
└── drizzle.config.ts         # Drizzle configuration
```

## Setup

### Installation

```sh
# Install dependencies
bun install
```

### Environment Variables

Create a `.dev.vars` file and set the required environment variables.

### Database Setup

```sh
# Generate migration files
bun run db:gen

# Apply migrations (local)
bun run db:mig
```

## Development

### Start Development Server

```sh
bun run dev
```

The development server starts at `http://localhost:8787`.

### OpenAPI/Swagger

API documentation is available at:

```sh
open http://localhost:8787/swagger
```

### Code Quality Checks

#### Static Code Analysis

Check syntax, format, and import order.

```sh
# Check only
bun run check

# Auto-fix
bun run check:fix
```

#### Type Checking

```sh
bun run typecheck
```

### Coding Guidelines

See [Implementation Guide](./docs/guides.md) for detailed implementation guidelines.

## Testing

### Run Tests

```sh
# Run all tests
bun run test

# Watch mode
bun run test:w
```

### Testing Strategy

- **Unit Test**: Test Use Cases and Repositories
- **Integration Test**: Test Plugins and Routes

Tests use Vitest and Cloudflare Workers Simulator.

See [Implementation Guide - Testing Strategy](./docs/guides.md#テスト戦略) for details.

## Database

### Migrations

```sh
# Generate migration files
bun run db:gen

# Apply migrations (local)
bun run db:mig
```

### Drizzle Studio

GUI tool for database management.

```sh
# Open local DB
bun run db:std

# Open remote DB (production)
bun run db:std:remote
```

Opens `https://local.drizzle.studio` in your browser.

## Deployment

### Build

```sh
# Build (dry-run)
bun run build
```

### Deploy

```sh
# Deploy to Cloudflare Workers
wrangler deploy

# Deploy to production
wrangler deploy --env production
```
