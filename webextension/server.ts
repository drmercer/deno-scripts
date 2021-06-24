import { serve } from "https://deno.land/std@0.99.0/http/server.ts";
import { readAll } from 'https://deno.land/std@0.99.0/io/util.ts';
import { commandHandler } from '../cli-utils/command.ts';
import { buildWebExtensionClient } from "./nativemessaging.ts";

const hostname = '127.0.0.1';

const handler = commandHandler({
  commands: {
    install,
    serve: serveNativeMessaging,
  },
  parentCommandName: import.meta.url,
});

await handler(Deno.args);

async function install([appname, extensionOrigin]: string[]) {
  if (!appname?.trim() || !extensionOrigin?.trim()) {
    throw new Error("Usage: install <app-name> <extension-origin>");
  }
  appname = appname.toLowerCase().replace(/[^\w.]/g, '_');
  console.log(`Installing for app '${appname}' and extension '${extensionOrigin}'`)
  const port = 8081;
  const hostWithPort = hostname + ':' + port;

  const browserPath = 'BraveSoftware/Brave-Browser/';
  const manifestDir = `${Deno.env.get('HOME')}/.config/${browserPath}NativeMessagingHosts/`;
  const manifestPath = `${manifestDir}${appname}.json`;
  const denoExecPath = Deno.execPath();
  const hostPath = `${denoExecPath}-native-messaging-host-${appname}.sh`;

  const fi = await Deno.stat(manifestDir);
  if (!fi.isDirectory) {
    throw new Error(`'${manifestDir}' is not a directory`);
  }

  const manifest = {
    name: appname,
    description: "Deno Native Messaging Host",
    path: hostPath,
    type: "stdio",
    allowed_origins: [
      extensionOrigin,
    ]
  };

  const hostScript = `
#!/bin/sh

${denoExecPath} run --allow-net=${hostWithPort} ${import.meta.url} serve ${port} 2>/tmp/deno-native-client.log
`;

  await Deno.writeTextFile(hostPath, hostScript);
  console.log(`Host executable written to '${hostPath}'`);
  await Deno.chmod(hostPath, 0o755);

  await Deno.writeTextFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest written to '${manifestPath}'`);

  console.log("Installed");
}

async function serveNativeMessaging([portStr]: string[]) {
  const port = Number(portStr);
  if (!port) {
    throw new Error("Usage: serve <port>");
  }
  const client = buildWebExtensionClient();

  console.warn("Running at " + new Date());

  function buffered<T>(f: () => Promise<T>): () => Promise<T> {
    let onDeck: Promise<T> | undefined;

    setTimeout(() => {
      if (!onDeck) onDeck = f();
    });

    return () => {
      const result = onDeck || f();
      onDeck = result.then(() => f(), () => f());
      return result;
    }
  }


  const server = serve({ port, hostname });
  const origin = `http://${hostname}:${port}/`;
  console.log(`HTTP webserver running at: ${origin}`);

  // Pre-read the next message so we know when to shut down the server
  const receiveBufferedMessage = buffered<unknown>(async () => {
    console.log("Calling readMessage")
    const msg = await client.receiveMessage();
    if (msg === null) {
      // shut down server
      console.log("Shutting down server");
      // TODO kinda hacky, is there a cleaner way to shut down?
      Deno.exit(12);
    }
    return msg;
  });

  for await (const request of server) {
    const id = Math.random().toString(36).substr(2);
    console.log(id, 'Received request', request.method, request.url);
    const url = new URL(request.url, origin);

    try {
      if (url.pathname === '/denoNativeClientMessage' && request.method === 'POST') {
        console.log(id, "Parsing message");
        const message = JSON.parse(new TextDecoder().decode(await readAll(request.body)));

        // Communicate with extension
        let result: unknown;
        try {
          console.log(id, "Sending message");
          await client.sendMessage(message);
          console.log(id, "Waiting for message")
          result = await receiveBufferedMessage();
          console.log(id, "Received message", String(result));
        } catch (err: unknown) {
          console.error(id, "Caught error", err);
          result = { sadness: true };
        }

        // Return result
        console.log(id, "Returning result with " + Object.keys(result as any).length + " keys");
        const body = JSON.stringify(result);
        await request.respond({
          body,
          status: 200,
        });
      } else {
        await request.respond({
          body: 'Not Found',
          status: 404,
        });
      }
    } catch {
      await request.respond({
        body: 'Server Error',
        status: 500,
      });
    }
  }

  console.log("Server closed.");
}
