# mona-ca Component Catalog

Component catalog and design system for mona-ca using Storybook.

## 📖 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Development](#development)
- [Building](#building)

## Overview

mona-ca Component Catalog is a Storybook-based UI component library showcase.
This catalog provides interactive documentation and testing environment for all UI components used in mona-ca applications.

It supports both web and mobile (React Native) environments, allowing developers to browse and test components in isolation.

## Tech Stack

It is made by these:

__Storybook__ 📚: Frontend workshop for UI development

__Expo__ 📱: The fastest way to build an app

__React Native__ ⚛️: Framework for building native apps

__NativeWind__ 🎨: Tailwind CSS for React Native

__React Native Web__ 🌐: React Native for Web

## Setup

### Installation

```sh
# Install dependencies
bun install
```

### Prebuild

Generate native projects for iOS and Android.

```sh
bun run prebuild
```

## Development

### Start Storybook (Web)

Start Storybook server for web browsers.

```sh
bun run sb
```

The Storybook UI will be available at `http://localhost:6006`.

### Start Storybook (Mobile)

Start Expo development server with Storybook enabled.

```sh
# Start with development build
bun run sb:mobile

# Start iOS
bun run sb:ios
```

### Generate Storybook Stories

Generate story list for React Native Storybook.

```sh
bun run sb:gen
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

## Building

### Build Storybook (Web)

Build static Storybook site for deployment.

```sh
bun run sb:build
```

The static site will be generated in `./.storybook/static`.

### Build Native Apps

```sh
# Build iOS
bun run ios

# Build Android
bun run android
```
