import { serve } from "https://deno.land/std@0.99.0/http/server.ts";
import { readAll } from 'https://deno.land/std@0.99.0/io/util.ts';
import { green, bold, cyan, dim, white, bgGreen, yellow } from 'https://deno.land/std@0.99.0/fmt/colors.ts';
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

async function install([extensionOrigin, portStr = '8081', browserPath = 'google-chrome']: string[]) {
  const port = Number(portStr);
  if (!extensionOrigin?.trim() || !Number(portStr)) {
    throw new Error("Usage: install <extension-origin> [port=8081] [browser=google-chrome]");
  }
  const id = extensionOrigin.replace('chrome-extension', '').replace(/\W/g, '').substr(-10);
  const appname = 'deno_http_gateway_' + id;
  console.log(cyan(`Installing gateway for extension '${extensionOrigin}'. App name is '${appname}'`));

  const hostWithPort = hostname + ':' + port;

  const manifestPathTemplate = `<home>/.config/${browserPath}/NativeMessagingHosts/${appname}.json`
  console.log(`${bold(yellow('Info:'))} Will write gateway manifest to '${manifestPathTemplate}'.`);
  const manifestPath = manifestPathTemplate.replace('<home>', Deno.env.get('HOME') || '~');

  const hostFilename = `_http_gateway_${id}.sh`;
  console.log(`${bold(yellow('Info:'))} Will write gateway executable to '<deno binary dir>/${hostFilename}'.`);
  const denoExecPath = Deno.execPath();
  const hostPath = `${denoExecPath.replace(/\w+$/, '')}${hostFilename}`;

  const manifest = {
    name: appname,
    description: "Deno Native Messaging Http Gateway",
    path: hostPath,
    type: "stdio",
    allowed_origins: [
      extensionOrigin,
    ]
  };

  const hostScript = `
#!/bin/sh

${denoExecPath} run --allow-net=${hostWithPort} ${import.meta.url} serve ${port} 2>/tmp/${appname}.log
`;

  await Deno.writeTextFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`${green(bold('Success:'))} gateway manifest written to '${manifestPath}'`);

  await Deno.writeTextFile(hostPath, hostScript);
  console.log(`${green(bold('Success:'))} gateway executable written to '${hostPath}'`);
  await Deno.chmod(hostPath, 0o755);

  console.log(bgGreen(white(bold("Installed!"))));

  console.log("To use this in your extension, do this:")
  console.log(dim(white(`
\`\`\`
  const port = chrome.runtime.connectNative('${appname}');
  port.onMessage.addListener(function(msg) {
    console.log("Received", msg);
    // TODO process msg
    const result = { text: "Hello, world!" };
    port.postMessage(result);
  });
  port.onDisconnect.addListener(function() {
    console.log("Disconnected");
  });
\`\`\`
`.trim())));
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
