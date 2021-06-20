import { assert, assertEquals } from 'https://deno.land/std@0.93.0/testing/asserts.ts';
import { endOfDay, endOfDayUTC } from "./relative.ts";

Deno.test("endOfDay should work with current date", () => {
  const eod = endOfDay();

  const a = new Date();
  a.setHours(11);
  a.setMinutes(59);
  a.setSeconds(59);
  a.setMilliseconds(59);

  assert(a < eod);

  const b = new Date();
  b.setDate(b.getDate() + 1);
  b.setHours(0);
  b.setMinutes(0);
  b.setSeconds(0);
  b.setMilliseconds(0);

  assert(b >= eod);
})

Deno.test("endOfDay should work with fixed dates", () => {
  assertEquals(
    endOfDay(new Date("2021-06-19T12:00:00")),
    new Date("2021-06-20T00:00:00"),
  );
});

Deno.test("endOfDayUTC should work with fixed dates", () => {
  assertEquals(
    endOfDayUTC(new Date("2021-06-19T12:00:00Z")),
    new Date("2021-06-20T00:00:00Z"),
  );
});
