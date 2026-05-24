export const withRetry = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    delayMs: number = 1000
): Promise<T> => {
    let attempt = 0;
    while (attempt <= maxRetries) {
        try {
            return await fn();
        } catch (error: any) {
            attempt++;
            if (attempt > maxRetries) {
                throw error;
            }
            console.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
            await new Promise((res) => setTimeout(res, delayMs));
        }
    }
    throw new Error('Unreachable');
};
