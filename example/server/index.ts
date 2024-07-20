import { Elysia } from "elysia";
import { remix } from "elysia-remix";

const port = Number(process.env.PORT) || 3000;

new Elysia()
	.use(await remix())
	.get("/some", "Hello")
	.listen(port, console.log);
