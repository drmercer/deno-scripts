console.log("Extension starting")

console.log("Extension origin is " + location.origin);

const appname = 'deno_http_gateway_' + location.hostname.toLowerCase().substr(-10);
console.log("Connecting to native app", appname);
const port = chrome.runtime.connectNative(appname);

// Echo listener
let messageCount = 0;
port.onMessage.addListener((message) => {
  console.log("Received", message);
  port.postMessage({
    youAreVisitorNumber: ++messageCount,
    message,
  });
});

port.onDisconnect.addListener(function () {
  if (chrome.runtime.lastError) {
    console.warn("Disconnected with error:", chrome.runtime.lastError.message);
  } else {
    console.log("Disconnected nicely");
  }
});

console.log("Extension started!")
