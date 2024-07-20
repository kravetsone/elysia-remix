import { createRequestHandler } from "@remix-run/node";
import { Elysia } from "elysia";
import type { ViteDevServer } from "vite";

export interface RemixOptions {
	/**
	 *
	 * @default process.env.NODE_ENV || "development"
	 */
	mode?: "development" | "production";
}

export async function remix(options?: RemixOptions) {
	const mode = options?.mode ?? process.env.NODE_ENV ?? "development";

	const elysia = new Elysia();

	let vite: ViteDevServer | undefined;

	if (mode !== "production") {
		vite = await import("vite").then((vite) => {
			return vite.createServer({
				server: {
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
				: () => import("./example/vite/build/server/index.js"),
			mode,
		);

		return handler(request);
	});

	return elysia;
}
