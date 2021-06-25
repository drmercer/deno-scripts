# WebExtension Native Messaging Http Gateway

An HTTP gateway for WebExtension Native Messaging, to enable scripts to easily
talk to a WebExtension.

[`gateway.ts`](./gateway.ts) allows you to install an HTTP gateway for the
[Native Messaging protocol for
WebExtensions](https://developer.chrome.com/docs/extensions/nativeMessaging/).
This allows you to POST a JSON message to a port on localhost (127.0.0.1) and
receive it in the extension, and then return a response from the extension and
receive it as a JSON response body from the server.

## Usage (installation)

```
deno run --prompt ./gateway.ts install <extension-origin> [port, defaults to 8081] [browser config path, defaults to 'google-chrome']
```

To receive messages from the gateway in your extension, do something like this,
where `<appname>` is the app name given in the output of `gateway.ts install`.

```js
const port = chrome.runtime.connectNative("<appname>");

port.onMessage.addListener((msg) => {
  console.log("Received", msg);
  // TODO process msg
  const result = { text: "Hello, world!" };
  port.postMessage(result);
});
port.onDisconnect.addListener(() => {
  console.log("Disconnected");
});
```

## Example usage

```sh
deno run --prompt ./gateway.ts install chrome-extension://abcdefghijklmnopqrstuvwxyzabcdef/ 1337 BraveSoftware/Brave-Browser
```
