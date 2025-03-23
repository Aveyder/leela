export default function diff<T>(objA: T, objB: T): Partial<T> | null {
  let diff = null as Partial<T> | null;

  for (const key in objA) {
    if (objA[key] !== objB[key]) {
      if (!diff) diff = {};

      diff[key] = objB[key];
    }
  }

  return diff;
}
