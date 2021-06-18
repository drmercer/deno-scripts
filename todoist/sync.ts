import { Project, Task } from './api/types.ts';
import { SyncResponse, Todoist } from './api/api.ts';

export interface SyncState {
  syncToken: string;
  tasks: Task[];
  projects: Project[];
}

export async function doSync(accessToken: string, oldState?: SyncState): Promise<SyncState> {
  const result = await Todoist(accessToken).sync({
    resourceTypes: ['items', 'projects'],
    syncToken: oldState?.syncToken,
  });
  if (!result.success) {
    throw new Error("Failed sync. " + JSON.stringify(result));
  }
  const changes = resultToState(result.data);
  return oldState ? mergeState(oldState, changes) : changes;
}

export function resultToState(result: SyncResponse): SyncState {
  return {
    syncToken: result.sync_token,
    tasks: result.items ?? [],
    projects: result.projects ?? [],
  };
}

export function mergeState(oldState: SyncState, changes: SyncState): SyncState {
  return {
    syncToken: changes.syncToken || oldState.syncToken,
    tasks: mergeTasks(oldState.tasks, changes.tasks),
    projects: mergeProjects(oldState.projects, changes.projects),
  }
}

export function mergeTasks(oldTasks: Task[], newTasks: Task[]): Task[] {
  console.log("Changed tasks:", newTasks.map(t => t.content));
  const merged = oldTasks
    .filter(t => !newTasks.find(t2 => t2.id === t.id))
    .concat(newTasks)
    .filter(shouldKeepTask)
  return merged;
}

function shouldKeepTask(t: Task): boolean {
  return !t.is_deleted && !t.checked;
}

export function mergeProjects(oldProjects: Project[], newProjects: Project[]): Project[] {
  // TODO merge projects
  return oldProjects.concat(newProjects);
}
