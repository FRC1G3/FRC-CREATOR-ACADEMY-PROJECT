import { expect, it } from "vitest";
import { databaseReads } from "../src/lib/database-reads";

it("does not start the next transaction read until the previous one finishes", async () => {
  const events: string[] = [];
  const result = await databaseReads({}, [
    async () => { events.push("start"); await Promise.resolve(); events.push("finish"); return 1; },
    async () => { events.push("next"); return "two"; },
  ]);
  expect(events).toEqual(["start", "finish", "next"]);
  expect(result).toEqual([1, "two"]);
});

it("keeps pool reads parallel", async () => {
  const events: string[] = [];
  await databaseReads({ $transaction: true }, [
    async () => { events.push("start"); await Promise.resolve(); events.push("finish"); },
    async () => { events.push("next"); },
  ]);
  expect(events).toEqual(["start", "next", "finish"]);
});
