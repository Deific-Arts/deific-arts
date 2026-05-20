export function repeat<T>(times: number, fn: (i: number) => T): T[] {
  return Array.from({ length: times }).map((_, i) => fn(i));
}
