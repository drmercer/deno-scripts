import { Project, Task } from "./types.ts";

export interface BodyParams {
  syncToken?: string;
  resourceTypes?: string[];
}

export interface SyncResponse {
  sync_token: string;
  items: Task[] | undefined;
  projects: Project[] | undefined;
  // TODO add other resource types
}

export interface SuccessResult<T> {
  success: true;
  data: T;
}
export interface ErrorResult {
  success: false;
  error: string;
  error_code: number;
}

const baseUrl = "https://api.todoist.com/sync/v8";

export interface TodoistApi {
  sync(params: BodyParams): Promise<SuccessResult<SyncResponse> | ErrorResult>;
  quickAdd(text: string, note?: string, autoReminder?: boolean, reminder?: string): Promise<SuccessResult<Task> | ErrorResult>;
}

/**
 * See https://developer.todoist.com/sync/v8/
 */
export function Todoist(token: string): TodoistApi {

  function wrapResult(data: any, status: number): SuccessResult<any>|ErrorResult {
    if ('error' in data) {
      return {
        success: false,
        error: data.error || '[no error in response]',
        error_code: data.error_code || status,
      };
    } else {
      return {
        success: true,
        data,
      };
    }
  }

  /**
   * See https://developer.todoist.com/sync/v8/#sync
   */
  async function sync(params: BodyParams): Promise<SuccessResult<SyncResponse> | ErrorResult> {
    const body = new URLSearchParams();
    body.append("token", token);
    if (params.resourceTypes) {
      body.append("resource_types", JSON.stringify(params.resourceTypes));
    }
    body.append("sync_token", params.syncToken ?? "*");
    const response = await fetch(baseUrl + '/sync', {
      body,
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
    });
    const data = await response.json();
    return wrapResult(data, response.status);
  }

  /**
   * See https://developer.todoist.com/sync/v8/#quick-add-an-item
   */
  async function quickAdd(text: string, note = '', autoReminder = true, reminder = ''): Promise<SuccessResult<Task> | ErrorResult> {
    const body = new URLSearchParams({
      text,
      "auto_reminder": String(autoReminder),
    });
    if (note) {
      body.append('note', note);
    }
    if (reminder) {
      body.append('reminder', reminder);
    }
    const response = await fetch(baseUrl + '/quick/add', {
      body,
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return wrapResult(data, response.status);
  }

  return {
    sync,
    quickAdd,
  };
}
