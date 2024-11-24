export default function diff<T>(objA: T, objB: T): Partial<T> {
  const diff: Partial<T> = {};

  for (const key in objA) {
    if (objA[key] !== objB[key]) {
      diff[key] = objB[key];
    }
  }

  return diff;
}
