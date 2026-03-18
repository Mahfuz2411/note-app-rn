export async function guardedAsync<T>(
  action: () => Promise<T>,
  onError: (message: string) => void,
): Promise<T | null> {
  try {
    return await action();
  } catch {
    onError('Something went wrong. Please try again.');
    return null;
  }
}
