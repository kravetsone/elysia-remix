import { join } from "node:path";
import { join as joinPosix } from "node:path/posix";
import { type AppLoadContext, createRequestHandler } from "@remix-run/node";
import { Elysia, type InferContext } from "elysia";
import type { Context } from "elysia/context";
import type { InlineConfig, ViteDevServer } from "vite";

export type GetLoadContext = (
	context: Context,
) => AppLoadContext | Promise<AppLoadContext>;

export interface RemixOptions {
	/**
	 * in `development` mode it starts `vite` and in `production` it just served like static.
	 *
	 * @default process.env.NODE_ENV || "development"
	 */
	mode?: "development" | "production";
	/**
	 * The base path for the Remix app.
	 * This should match the `basename` in your `vite` config.
	 *
	 * @default "/"
	 */
	basename?: string;
	/**
	 * The directory where the Remix app is built.
	 * This should match the `buildDirectory` directory in your `vite` config.
	 *
	 * @default "build"
	 */
	buildDirectory?: string;
	/**
	 * The Remix server output filename.
	 * This should match the `serverBuildFile` filename in your `vite` config.
	 *
	 * @default "index.js"
	 */
	serverBuildFile?: string;
	/**
	 * Configure `vite` server in `development` mode
	 */
	vite?: InlineConfig;

	/**
	 * A function that returns the value to use as `context` in route `loader` and
	 * `action` functions.
	 *
	 * You can use declaration merging for type it correctly https://www.typescriptlang.org/docs/handbook/declaration-merging.html
	 */
	getLoadContext?: GetLoadContext;
}

export async function remix(options?: RemixOptions) {
	const cwd = process.env.REMIX_ROOT ?? process.cwd();
	const mode = options?.mode ?? process.env.NODE_ENV ?? "development";
	const buildDirectory = join(cwd, options?.buildDirectory ?? "build");
	const serverBuildPath = join(
		buildDirectory,
		"server",
		options?.serverBuildFile ?? "index.js",
	);

	const elysia = new Elysia({
		name: "elysia-remix",
		seed: options,
	});

	let vite: ViteDevServer | undefined;

	if (mode !== "production") {
		vite = await import("vite").then((vite) => {
			return vite.createServer({
				...options?.vite,
				server: {
					...options?.vite?.server,
					middlewareMode: true,
				},
			});
		});
	}

	let hooks = {};
	
	if (vite) {
    	const { connectToWeb } = await import("connect-to-web");
        hooks = {
            beforeHandle: ({ request }: InferContext<typeof elysia>) => {
                return connectToWeb((req, res, next) => {
                    vite.middlewares(req, res, next);
                })(request.clone());
            },
        };
	} else {
		const clientDirectory = join(buildDirectory, "client");
		const glob = new Bun.Glob(`${clientDirectory}/**`);
		for (const path of glob.scanSync()) {
			elysia.get(
				joinPosix(path.substring(clientDirectory.length)),
				() => new Response(Bun.file(path)),
			);
		}
	}

	elysia.all(
		"*",
		async function processRemixSSR(context) {
			const handler = createRequestHandler(
				vite
					? await vite.ssrLoadModule("virtual:remix/server-build")
					: await import(serverBuildPath),
				mode,
			);

			const loadContext = await options?.getLoadContext?.(context);

			return handler(context.request, loadContext);
		},
		hooks,
	);

	return elysia;
}
