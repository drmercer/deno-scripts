// https://developer.todoist.com/sync/v8/#due-dates
export const dateStringIncludesTime = (s: string) => s.includes(":");

// Need to ensure date string includes a time so JS will interpret it in local time instead of UTC.
export const dateStringToDate = (s: string, timeForDateOnlyDates = "00:00:00") =>
  dateStringIncludesTime(s) ? new Date(s) : new Date(s + "T" + timeForDateOnlyDates)

const pad = (width: number) => (n: number) => n.toString().padStart(width, '0');

const pad2 = pad(2);

export const dateToDateOnlyString = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

export const dateToTimeString = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`

export const dateToDateString = (d: Date) => dateToDateOnlyString(d) + 'T' + dateToTimeString(d)
