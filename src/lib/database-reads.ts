// An interactive transaction shares one connection. A root client has a pool.
export async function databaseReads<T extends readonly unknown[]>(
  db: object,
  reads: { [K in keyof T]: () => PromiseLike<T[K]> },
): Promise<T> {
  if ("$transaction" in db) return Promise.all(reads.map(read => read())) as unknown as Promise<T>;
  const results: unknown[] = [];
  for (const read of reads) results.push(await read());
  return results as unknown as T;
}
