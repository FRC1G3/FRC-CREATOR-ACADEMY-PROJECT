// Opt-in, local profiling only. Never record SQL, parameters or user identifiers.
const counters = globalThis as unknown as { academySql?: { count: number; ms: number } };
export function recordQuery(duration: number) {
  const stats = counters.academySql ??= { count: 0, ms: 0 };
  stats.count++; stats.ms += duration;
}
export async function timed<T>(label: string, work: () => T | PromiseLike<T>): Promise<T> {
  if (process.env.PROFILE_PERFORMANCE !== "1") return await work();
  const start = performance.now();
  const before = { ...(counters.academySql ?? { count: 0, ms: 0 }) };
  try { return await work(); }
  finally {
    const after = counters.academySql ?? before;
    console.log("ACADEMY_PERF " + JSON.stringify({ label, ms: Math.round(performance.now() - start), queries: after.count - before.count, queryMs: after.ms - before.ms }));
  }
}
