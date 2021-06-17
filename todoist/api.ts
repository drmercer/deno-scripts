import { Project, Task } from "./types.ts";

export interface BodyParams {
  syncToken?: string;
  resourceTypes?: string[];
}

export interface SyncResult {
  success: true;
  sync_token: string;
  items: Task[] | undefined;
  projects: Project[] | undefined;
  // TODO add other resource types
}

export interface ErrorResult {
  success: false;
  error: string;
  error_code: number;
}

const baseUrl = "https://api.todoist.com/sync/v8/sync";

export interface TodoistApi {
  sync(params: BodyParams): Promise<SyncResult | ErrorResult>
}

/**
 * See https://developer.todoist.com/sync/v8/
 */
export function Todoist(token: string): TodoistApi {

  function buildBody(params: BodyParams) {
    const data = new URLSearchParams();
    data.append("token", token);
    if (params.resourceTypes) {
      data.append("resource_types", JSON.stringify(params.resourceTypes));
    }
    data.append("sync_token", params.syncToken ?? "*");
    return data;
  }

  async function sync(params: BodyParams): Promise<SyncResult|ErrorResult> {
    const body = buildBody(params);
    const response = await fetch(baseUrl, {
      body,
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
    });
    const result = await response.json();
    return {
      success: !('error' in result),
      ...result,
    };
  }

  return {
    sync,
  };
}
