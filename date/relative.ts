export function endOfDay(date?: Date): Date {
  const eod = date ? new Date(date) : new Date();
  eod.setMilliseconds(0);
  eod.setSeconds(0);
  eod.setMinutes(0);
  eod.setHours(24 - eod.getTimezoneOffset() / 60);
  return eod;
}
