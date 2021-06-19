import { BufReader } from 'https://deno.land/std@0.99.0/io/bufio.ts';
import { writeAll } from 'https://deno.land/std@0.99.0/io/util.ts';

/**
 * Utilities for handling WebExtension Native Messaging
 */

/**
 * Returns `true` if the program seems to be running as a WebExtension client (meaning stdin and stdout are TTYs,
 * and the first command line argument is the given extension origin).
 */
export function isRunningAsWebExtensionClient(extensionOrigin: string) {
  return Deno.args[0] === extensionOrigin &&
    !Deno.isatty(Deno.stdin.rid) &&
    !Deno.isatty(Deno.stdout.rid);
}

/**
 * A client for WebExtension Native Messaging. Implements the Native Messaging protocol over stdin and stdout.
 */
export interface WebExtensionClient {
  /**
   * Receive a message from the extension, or `null` if stdin reaches EOF.
   */
  receiveMessage(): Promise<unknown | null>;
  /**
   * Send a message to the extension.
   * @param message The message to send. Must be JSON-serializable.
   */
  sendMessage(message: unknown): Promise<void>;
}

/**
 * Builds a client for WebExtension Native Messaging.
 *
 * @see https://developer.chrome.com/docs/extensions/nativeMessaging/
 *
 * @param extensionOrigin The origin of the extension, such as `chrome-extension://<id>/`
 */
export function buildWebExtensionClient(extensionOrigin: string): WebExtensionClient {
  if (!isRunningAsWebExtensionClient(extensionOrigin)) {
    throw new Error("Not running as a native messaging host for extension " + extensionOrigin);
  }

  // For safety. We can't use stdout for logging because it's used for messaging.
  console.log = console.warn;

  const bufStdin = new BufReader(Deno.stdin, 512);

  async function receiveMessage(): Promise<unknown | null> {
    const sizeBuf = new Uint32Array(1);
    const readSize = await bufStdin.readFull(new Uint8Array(sizeBuf.buffer));
    if (readSize === null) {
      console.warn("EOF when looking for message.");
      return null;
    }
    const messageSize = sizeBuf[0];
    console.log("Message size", messageSize);

    const buf = new Uint8Array(messageSize);
    const read = await bufStdin.readFull(buf);
    if (read === null) {
      console.error("Unexpected EOF when reading message.");
      return null;
    }
    const text = new TextDecoder().decode(buf);
    try {
      return JSON.parse(text);
    } catch (err: unknown) {
      console.log(`Unable to parse JSON: '${text}'`, err);
      throw err;
    }
  }

  async function sendMessage(message: unknown): Promise<void> {
    const text = JSON.stringify(message);
    const buf = new TextEncoder().encode(text);
    const sizeBuf = new Uint32Array([buf.byteLength]);

    await writeAll(Deno.stdout, new Uint8Array(sizeBuf.buffer));
    await writeAll(Deno.stdout, buf);
  }

  return { sendMessage, receiveMessage };
}
