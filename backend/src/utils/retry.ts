export interface RetryOptions {
  retries?: number;
  initialDelayMs?: number;
  factor?: number;
  timeoutMs?: number;
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes a function with a timeout.
 */
export async function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
  });
  return Promise.race([fn(), timeoutPromise]);
}

/**
 * Executes a function with exponential backoff and absolute timeout.
 * Supports both new object options signature and legacy positional parameters for backwards compatibility.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  optionsOrRetries?: RetryOptions | number,
  legacyDelayMs?: number
): Promise<T> {
  let retries = 3;
  let initialDelayMs = 500;
  let factor = 2;
  let timeoutMs = 5000;

  if (typeof optionsOrRetries === 'number') {
    retries = optionsOrRetries;
    if (legacyDelayMs !== undefined) {
      initialDelayMs = legacyDelayMs;
    }
  } else if (optionsOrRetries && typeof optionsOrRetries === 'object') {
    retries = optionsOrRetries.retries ?? retries;
    initialDelayMs = optionsOrRetries.initialDelayMs ?? initialDelayMs;
    factor = optionsOrRetries.factor ?? factor;
    timeoutMs = optionsOrRetries.timeoutMs ?? timeoutMs;
  }

  let currentDelay = initialDelayMs;
  let lastError: any;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await withTimeout(fn, timeoutMs);
    } catch (error: any) {
      lastError = error;
      console.warn(`[Retry] Attempt ${attempt} failed: ${error.message}`);

      if (attempt > retries) {
        break;
      }

      await delay(currentDelay);
      currentDelay *= factor;
    }
  }

  throw new Error(`Failed after ${retries} retries. Last error: ${lastError.message}`);
}
