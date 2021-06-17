export interface Task {
  added_by_uid: number|null,
  assigned_by_uid: number,
  checked: number,
  child_order: number,
  collapsed: number,
  content: string,
  date_added: string,
  date_completed: string|null,
  day_order: number,
  description: string,
  due: TaskDue|null,
  id: number,
  in_history: number,
  is_deleted: number,
  labels: number[],
  parent_id: number|null,
  priority: 1,
  project_id: number,
  responsible_uid: number|null,
  section_id: number,
  sync_id: number|null,
  user_id: number
}

export interface TaskDue {
  date: string,
  is_recurring: boolean,
  lang: string,
  string: string,
  timezone: unknown|null
}

export interface Project {
  child_order: number,
  collapsed: number,
  color: 48,
  id: number,
  inbox_project: boolean,
  is_archived: number,
  is_deleted: number,
  is_favorite: number,
  name: string,
  parent_id: number,
  shared: boolean
}
