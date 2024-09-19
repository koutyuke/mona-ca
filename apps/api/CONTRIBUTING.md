# Welcome to the CONTRIBUTING guide

This is a mona-ca Server-Side API CONTRIBUTING guide.

Follow the rules below to create your code.

## Folder Structure

This project is built around `clean architecture` + `repository pattern`(maybe...).

Therefore, the folder is also structured accordingly.

```
./src/
├── app
│
├── application
│   └── use-cases
│
├── domain
│
├── infrastructure
│
├── interface-adapter
│   └── repositories
│
├── modules
│
└── types
```

__app__

This folder will be the `controller` part of the application. This is also in a path-dir format like Next.js to make the path easier to read.

If there are children, create a folder instead of a file and write route in `index.ts`

If there are no children, create `route-name.ts` in the parent directory.

__application/use-case__

This folder will be the `use-case` part of the application. 

__domain__

This folder will be the `entity(domain)` part of the application. 

__infrastructure__

This folder will be the `infrastructure` part of the application. 

In particular, place classes such as external libraries and DBs, external API adapter.

__interface-adapter__

This folder will be the `interface-adapter` part of the application. 

__interface-adapter/repositories__

This folder will be the `repositories` part of the application. 

This folder specifically places classes for DB abstraction.

__modules__

This folder is a unique folder not found in the architecture.

In this folder, place the plugins and middleware used by the controller.

__types__

In this folder, place the types used in global.

## APP(controller) Dir Rule

Describe detailed rules for code in the `/src/app` directory.

This directory will be the controller portion of the project.

It was created with particular reference to Next.js.

Therefore, the directory structure is configured to be the same as __PATH__.

When creating a new file, create a new directory if there are any children of path.

```diff
~/new/dir/
+ children.ts
+ index.ts
```

When creating a new file, if there are no children in the path, the file is created in the parent directory.

```diff
~/parent/dir/
index.ts
brother.ts
+ path-name.ts
```

## APP(controller) File & Code Rule

This file is limited to one route of the same path per file.
Also, the prefix of the route must be the same as the filename.

```ts
// src/app/~/route/index.ts
// or
// src/app/~/route.ts

const route = new Elysia({
	prefix: "/route",
})
  // ✅
  .get("/", async () => {
    return "Hello, mona-ca!";
  })
  .post("/", async () => {
    return "Hello, mona-ca!";
  })

  // ❌
  .get("/other", async () => {
    return "Hello, mona-ca!";
  })

```

When adding or using `plugins`, `middleware`, or `other routes`, the following sequence should be followed.

```
HIGHT
↑
├── Global Middleware & Plugin
│
├── Other Route
│
├── Local Middleware & Plugin
│
├── Route
↓
LOW
```

And to comment on the layers.

__Example__

```ts
// src/app/~/route/index.ts

const Route = new Elysia({
  prefix: "/route",
})
  // Global Middleware & Plugin
  .use(GlobalPlugin)

  // Other Route
  .use(OtherRoute)

  // Local Middleware & Plugin
  .use(LocalPlugin)

  // Route
  .get("/", async () => {
    return "Hello, mona-ca!";
  });
```