# Remix Elysia

Use [Remix](https://remix.run/) with [Elysia](https://elysiajs.com/) with `HMR` support! Close a really long-standing elysia plugin request https://github.com/elysiajs/elysia/issues/12

### Usage

In `development` mode it use [`vite`](https://vitejs.dev/guide/api-javascript.html) under the hood and in `production` serve build directory and perform SSR requests

```ts
import { Elysia } from "elysia";
import { remix } from "elysia-remix";

new Elysia()
    .use(await remix())
    .get("/some", "Hello, world!")
    .listen(3000, console.log);
```

### Quick start

```bash
bun create remix@latest --template kravetsone/elysia-remix/example
```

### Options

| Key              | Type                                                 | Default                                 | Description                                                                                                         |
| ---------------- | ---------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| mode?            | "development" \| "production"                        | process.env.NODE_ENV \|\| "development" | In `development` mode it starts `vite` and in `production` it just served static and perform SSR requests.          |
| basename?        | string                                               | "/"                                     | The base path for the Remix app. This should match the `basename` in your `vite` config.                            |
| buildDirectory?  | string                                               | "build"                                 | The directory where the Remix app is built. This should match the `buildDirectory` directory in your `vite` config. |
| serverBuildFile? | string                                               | "index.js"                              | The Remix server output filename. This should match the `serverBuildFile` filename in your `vite` config.           |
| vite?            | InlineConfig                                         |                                         | Configure `vite` server in `development` mode.                                                                      |
| static?          | [StaticOptions](https://elysiajs.com/plugins/static) |                                         | Configure [static plugin](https://elysiajs.com/plugins/static) options in `production` mode                         |
