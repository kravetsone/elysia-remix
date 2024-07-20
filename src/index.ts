import { join } from "node:path";
import { createRequestHandler } from "@remix-run/node";
import { Elysia } from "elysia";
import type { InlineConfig, ViteDevServer } from "vite";

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
	 * Configure `vite` server in development
	 */
	vite?: InlineConfig;
}

export async function remix(options?: RemixOptions) {
	const cwd = process.env.REMIX_ROOT ?? process.cwd();
	const mode = options?.mode ?? process.env.NODE_ENV ?? "development";
	const serverBuildURL = join(
		cwd,
		options?.buildDirectory ?? "build",
		"server",
		options?.serverBuildFile ?? "index.js",
	);

	const elysia = new Elysia();

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

	if (vite) {
		elysia.use(
			(await import("elysia-connect-middleware")).connect(vite.middlewares),
		);
	}

	elysia.all("*", async ({ request }) => {
		const handler = createRequestHandler(
			vite
				? () => vite.ssrLoadModule("virtual:remix/server-build")
				: () => import(serverBuildURL),
			mode,
		);

		return handler(request);
	});

	return elysia;
}
