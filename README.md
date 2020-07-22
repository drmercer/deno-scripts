# Dan's Miscellaneous Deno Scripts

Deno is great. :heart:

## Todoist API

Example:

```typescript
import { Todoist } from 'https://danmercer.net/deno/todoist/api.ts';

const td = new Todoist('<YOUR API TOKEN>');
let tasks = await td.getTasks();

console.log(tasks?.length + ' tasks found');
```
