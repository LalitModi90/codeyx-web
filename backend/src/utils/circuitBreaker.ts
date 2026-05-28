export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF-OPEN';

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private nextAttemptTime = 0;

  constructor(
    private readonly name: string,
    private readonly failureThreshold = 3,
    private readonly cooldownPeriodMs = 30000 // 30 seconds
  ) {}

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.updateState();

    if (this.state === 'OPEN') {
      throw new Error(`[CircuitBreaker: ${this.name}] Circuit is OPEN. Request blocked.`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private updateState(): void {
    if (this.state === 'OPEN' && Date.now() >= this.nextAttemptTime) {
      this.state = 'HALF-OPEN';
      console.log(`[CircuitBreaker: ${this.name}] Transitioned to HALF-OPEN. Testing service.`);
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF-OPEN' || this.state === 'OPEN') {
      console.log(`[CircuitBreaker: ${this.name}] Service recovered. Transitioned to CLOSED.`);
    }
    this.state = 'CLOSED';
    this.failureCount = 0;
  }

  private onFailure(): void {
    this.failureCount++;
    console.warn(`[CircuitBreaker: ${this.name}] Failure detected (${this.failureCount}/${this.failureThreshold})`);
    
    if (this.failureCount >= this.failureThreshold || this.state === 'HALF-OPEN') {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.cooldownPeriodMs;
      console.error(`[CircuitBreaker: ${this.name}] Transitioned to OPEN. Cooldown for ${this.cooldownPeriodMs / 1000}s`);
    }
  }

  public getState(): CircuitBreakerState {
    this.updateState();
    return this.state;
  }
}

// Global registry of circuit breakers per platform
const breakers: Record<string, CircuitBreaker> = {};

export function getCircuitBreaker(name: string, failureThreshold = 3, cooldown = 30000): CircuitBreaker {
  if (!breakers[name]) {
    breakers[name] = new CircuitBreaker(name, failureThreshold, cooldown);
  }
  return breakers[name];
}
