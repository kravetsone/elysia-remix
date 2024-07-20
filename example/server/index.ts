import { Elysia } from "elysia";
import { remix } from "../../src";

const port = Number(process.env.PORT) || 3000;

new Elysia()
	.use(
		await remix({
			getLoadContext: () => ({ hotPostName: "some post title" }),
		}),
	)
	.get("/some", "Hello")
	.listen(port, console.log);

declare module "@remix-run/server-runtime" {
	interface AppLoadContext {
		hotPostName: string;
	}
}
