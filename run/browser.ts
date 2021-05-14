import { launch } from "./run.ts";

/**
 * Options for `openInBrowser()`.
 */
export interface OpenInBrowserOpts {
  /**
   * The browser command to run. Defaults to `'google-chrome'`.
   */
  browser?: string;
  /**
   * The URL is opened in a new window without browser chrome. Only supported by
   * Chromium-based browsers. Defaults to `false`.
   */
  appMode?: boolean;
}

const defaultBrowser = "google-chrome";

const browsersThatSupportAppMode = [
  "google-chrome",
  "brave-browser",
  "chromium",
];

/**
 * Tries to open the given URL in a new browser window/tab. Inherently a bit hacky, because the
 * new browser process will be tied to the Deno process, so Deno won't exit until the process
 * does, **unless** the browser happens to end the new process immediately and open the URL in
 * an existing browser session - Chromium-based browsers do this, for example.
 *
 * @param url
 * @param opts
 */
export function openInBrowser(url: string, opts: OpenInBrowserOpts = {}) {
  launch(
    opts.browser ?? defaultBrowser,
    ...getParams(url, opts),
  );
}

function getParams(url: string, opts: OpenInBrowserOpts): string[] {
  const browser = opts.browser ?? defaultBrowser;
  let urlParam = url;
  if (opts.appMode) {
    if (browsersThatSupportAppMode.includes(browser)) {
      urlParam = "--app=" + url;
    } else {
      console.warn(
        "Requested app mode but browser doesn't support it: " + browser,
      );
    }
  }
  return [urlParam];
}

if (import.meta.main) {
  console.log("Testing openInBrowser");
  openInBrowser("https://danmercer.net", {
    browser: "chromium",
    appMode: true,
  });
}
