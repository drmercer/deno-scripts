export function endOfDay(date = new Date()): Date {
  const eod = new Date(date.getTime());
  eod.setMilliseconds(0);
  eod.setSeconds(0);
  eod.setMinutes(0);
  eod.setHours(24);
  return eod;
}

export function endOfDayUTC(date = new Date()): Date {
  const eod = new Date(date.getTime());
  eod.setUTCMilliseconds(0);
  eod.setUTCSeconds(0);
  eod.setUTCMinutes(0);
  eod.setUTCHours(24);
  return eod;
}
