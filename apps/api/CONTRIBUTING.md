# Welcome to the CONTRIBUTING guide

This is a mona-ca Server-Side API CONTRIBUTING guide.

Follow the rules below to create your code.

## Folder Structure

This project is built around `clean architecture` + `repository pattern`(maybe...).

Therefore, the folder is also structured accordingly.

```txt
./src/
├── common
│   ├── constants
│   ├── utils
│   └── schema
│
├── application
│   └── use-cases
│
├── domain
│   ├── entities
│   └── value-object
│
├── infrastructure
│
├── interface-adapter
│   ├── gateways
│   ├── repositories
│   └── presenter
│
├── modules
│
├── routes
│   ├── group
│   ├── ...
│
├── test
│
└── types
```

## Coding Rules

### Plugin & Middleware

When adding or using `plugins`, `middleware`, or `other routes`, the following sequence should be followed.

```txt
HIGHT
│
├── Global Middleware & Plugin
│
├── Other Route
│
├── Local Middleware & Plugin
│
├── Route
│
LOW
```

And to comment on the layers.

Example:

```ts
// src/routes/group/route.ts

const Route = new Elysia()

  // Global Middleware & Plugin
  .use(GlobalPlugin)

  // Other Route
  .use(OtherRoute)

  // Local Middleware & Plugin
  .use(LocalPlugin)

  // Route
  .get("path", async () => {
    return "Hello, mona-ca!";
  });
```

### Result Type

We use custom `Result` type to handle errors in the application.

[implementation](/apps/api/src/common/utils/result.ts)

```ts
type Success = {
  data: string;
}

type Error = Err<"ERROR_CODE">;

type FunctionResult = Result<Success, Error>;

const func = (): FunctionResult => {
  // if success
  return {
    data: "success"
  }

  // if error
  return err("ERROR_CODE");
}

const result = func();

if (isErr(result)) {
  // handle error
} else {
  // handle success
}
```

### Error Code

The error code should be consistent, short, and meaningful. So, the error code should be in the following format.

Format:

- **Suffix**: Add details if needed.
- **Prefix**: indicate the function or context.
- **Main**: indicate type of error.

```txt
PREFIX_MAIN_SUFFIX
```

Example:

```txt
SESSION_EXPIRED
```

### Error Response

Error responses should generally use [exceptions](/apps/api/src/modules/error/exceptions.ts) for the response.

```ts
throw new BadRequestException({
  code: "ERROR_CODE",
  message: "Error message",
  additional: {
    // additional data
  }
});
```

### Schema

We use Elysia that is a modern web framework for Bun. It has a built-in schema validation & type-safe response.

[Elysia Documentation](https://elysiajs.com/essential/validation.html)
