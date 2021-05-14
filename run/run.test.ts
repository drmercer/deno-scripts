import { run } from "./run.ts";

Deno.test({
  name: "run should work",
  async fn() {
    const { stdout } = await run(["echo", "foo", "bar"]);
    console.assert(stdout === "foo bar");
  },
});
