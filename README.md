# Dan's Miscellaneous Deno Scripts

Deno is great. :heart:

## Todoist CLI

Example:

```typescript
// example.ts
import * as commands from "https://raw.githubusercontent.com/drmercer/deno-scripts/master/todoist/cli/commands.ts";
import { commandHandler } from "https://raw.githubusercontent.com/drmercer/deno-scripts/master/cli-utils/command.ts";

const handler = commandHandler({
  commands,
  parentCommandName: "td",
});

const success = await handler(Deno.args);

Deno.exit(success ? 0 : 1);
```

Usage:

```sh
$ deno install --name=td --unstable --location=https://any.origin.example --allow-net=api.todoist.com ./example.ts

$ td init
Enter your Todoist API token: <token>
Access token saved under origin https://any.origin.example

$ td sync
Syncing...
State saved: { tasks: 85, projects: 6 }

$ td add 'This is a task'
Adding 'This is a task'...
```

## Todoist API

Example:

```typescript
import { Todoist } from "https://raw.githubusercontent.com/drmercer/deno-scripts/master/todoist/api/api.ts";

const td = Todoist("<YOUR API TOKEN>");
let sync = await td.sync();

if (sync.success) {
  console.log(sync.data.tasks?.length + " tasks found");
}
```
