import { assert } from 'https://deno.land/std@0.93.0/testing/asserts.ts';
import { endOfDay } from "./relative.ts";

Deno.test("endOfDay should work", () => {
  const eod = endOfDay();

  const a = new Date();
  a.setHours(11);
  a.setMinutes(59);
  a.setSeconds(59);

  assert(a < eod);

  const b = new Date();
  b.setDate(b.getDate() + 1);
  b.setHours(0);
  b.setMinutes(0);
  b.setSeconds(0);

  assert(b > eod);
})
