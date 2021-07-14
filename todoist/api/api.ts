import { Project, Task } from "./types.ts";

/**
 * https://developer.todoist.com/sync/v8/#read-resources
 */
export interface BodyParams {
  syncToken?: string;
  resourceTypes?: string[];
}

/**
 * https://developer.todoist.com/sync/v8/#read-resources
 */
export interface SyncResponse {
  sync_token: string;
  items: Task[] | undefined;
  projects: Project[] | undefined;
  // TODO(someday) add other resource types
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

export type Result<T> = SuccessResult<T> | ErrorResult;

function wrapResult(data: any, status: number): Result<any> {
  if ('error' in data) {
    return {
      success: false,
      error: data.error || '[no error in response]',
      error_code: data.error_code || status,
      ...data,
    };
  } else {
    return {
      success: true,
      data,
    };
  }
}

const baseUrl = "https://api.todoist.com/sync/v8";

/**
 * https://developer.todoist.com/sync/v8/#write-resources
 */
export interface SyncCommand {
  type: string;
  uuid: string;
  args: Record<string, unknown>;
  temp_id?: string;
}

export interface TodoistApi {
  sync(params: BodyParams): Promise<Result<SyncResponse>>;
  quickAdd(text: string, note?: string, autoReminder?: boolean, reminder?: string): Promise<Result<Task>>;
  complete(taskId: number): Promise<Result<unknown>>;
  doCommands(commands: SyncCommand[]): Promise<Result<unknown>>;
}

/**
 * See https://developer.todoist.com/sync/v8/
 */
export function Todoist(token: string): TodoistApi {

  /**
   * See https://developer.todoist.com/sync/v8/#sync
   */
  async function sync(params: BodyParams): Promise<Result<SyncResponse>> {
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
  async function quickAdd(text: string, note = '', autoReminder = true, reminder = ''): Promise<Result<Task>> {
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

  /**
   * https://developer.todoist.com/sync/v8/#close-item
   */
  async function complete(taskId: number): Promise<Result<unknown>> {
    const command = {
      type: 'item_close',
      uuid: crypto.randomUUID(),
      args: {
        id: taskId,
      },
    };
    return doCommands([command]);
  }

  async function doCommands(commands: SyncCommand[]): Promise<Result<any>> {
    const body = new URLSearchParams({
      commands: JSON.stringify(commands)
    });
    const response = await fetch(baseUrl + '/sync', {
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
    complete,
    doCommands,
  };
}
