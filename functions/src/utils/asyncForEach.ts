type AsyncForeachCallback<T> = (value: T, index: number, array: T[]) => Promise<void>

export const asyncForEach = async <T>(array: T[], callback: AsyncForeachCallback<T>) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
