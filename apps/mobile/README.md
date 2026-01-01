# mona-ca Mobile Application

Mobile application for mona-ca.

## 📖 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup](#setup)
- [Development](#development)
- [Building](#building)

## Overview

mona-ca Mobile Application is a cross-platform mobile app built with React Native and Expo.
This app allows users to manage their menstrual cycles and share information with their partners.

## Tech Stack

It is made by these:

__Expo__ 📱: The fastest way to build an app

__React Native__ ⚛️: Framework for building native apps

__NativeWind__ 🎨: Tailwind CSS for React Native

__Jotai__ ⚛️: Primitive and flexible state management

__TanStack Query__ 🔄: Powerful data synchronization

__React Hook Form__ 📝: Performant forms with validation

__Valibot__ ✅: Schema validation

## Architecture

Built on **Feature-Sliced Design (FSD)** with Presenter/Container Pattern.

### Architecture Principles

- **Feature-Sliced Design**: Structure code by business domains and technical purpose
- **Presenter/Container Pattern**: Separate UI logic from business logic
- **Composition Pattern**: Inject handlers and components into Presenter
- **SOLID Principles**: Design principles for maintainability and extensibility
- **Dependency Injection**: Improve testability

### Layer Structure

```text
┌─────────────────────────────────────┐
│         App Layer                   │  app/
│      (Expo Router)                  │
├─────────────────────────────────────┤
│         Layers                      │
│  ┌───────────────────────────────┐  │
│  │  Pages     (Routes)           │  │  layers/pages/
│  ├───────────────────────────────┤  │
│  │  Widgets   (Complex UI)       │  │  layers/widgets/
│  ├───────────────────────────────┤  │
│  │  Features  (Business Logic)   │  │  layers/features/
│  ├───────────────────────────────┤  │
│  │  Entities  (Business Models)  │  │  layers/entities/
│  ├───────────────────────────────┤  │
│  │  Shared    (Common Code)      │  │  layers/shared/
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

See [Architecture Documentation](./docs/architecture.md) for details.

### Directory Structure

```text
apps/mobile/
├── src/
│   ├── app/                 # Expo Router routes
│   └── layers/              # FSD layers
│       ├── pages/           # Page components
│       ├── widgets/         # Complex UI components
│       ├── features/        # Business logic features
│       ├── entities/        # Business entities
│       └── shared/          # Shared utilities
├── assets/                  # Static assets
├── docs/                    # Documentation
├── types/                   # Type definitions
├── ios/                     # iOS native code
├── android/                 # Android native code
├── package.json
├── tsconfig.json
├── app.json                 # Expo configuration
├── babel.config.js
└── metro.config.js
```

## Setup

### Installation

```sh
# Install dependencies
bun install
```

### Environment Variables

Create environment variables as needed.

### Prebuild

Generate native projects for iOS and Android.

```sh
bun run prebuild
```

## Development

### Start Development Server

```sh
# Start with development build
bun run dev

# Start iOS
bun run dev:ios

# Start Android
bun run dev:android
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

## Building

### Build for iOS

```sh
bun run ios
```

### Build for Android

```sh
bun run android
```
