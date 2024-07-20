import process from "node:process";
import { Elysia } from "elysia";
import { remix } from "../../../src";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
	.use(await remix())
	.get("/some", "Hello")
	.listen(port, console.log);
