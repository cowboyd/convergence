const { now } = Date;

/**
 * A `Series` is comprised of several assertion checkpoints any of
 * which can pass or fail over a given time.  For example, in this
 * series, the assertion fails two times before finally passing:
 *
 *  .─.    .─.    .─.
 * ( F )─-( F )─-( T )
 *  `─'    `─'    `─'
 *
 * By expressing the series as a formal concept that can be iterated
 * over, we can reason about the set as a whole by asking questions
 * like:
 *  - Does *every* checkpoint pass?
 *  - Does *some* checkpoint pass?
 *  - Does _every_ checkpoint fail?
 *  - or really any `Set` operation.
 */
export async function * Series(test, duration) {
  for (let start = now(); now() - start < duration;) {
    yield new Checkpoint(test);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

/**
 * Represent a single instance of an assertion at a specific point in
 * time. It runs the provided `test` and records whether it passed or failed.
 */
class Checkpoint {
  constructor(test) {
    try {
      this.timestamp = now();
      this.result = test();
      this.passed = this.result !== false;
    } catch (error) {
      this.error = error;
    }
    if (this.result && typeof this.result.then === 'function') {
      throw new Error(
        'convergent assertion encountered an async function or promise; ' +
          'since convergent assertions can run multiple times, you should ' +
          'avoid introducing side-effects inside of them'
      );
    }
  }

  throw(message) {
    throw this.error || new Error(message);
  }
}
