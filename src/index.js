import { Series } from './converge';

export async function when(test, duration = 2000) {
  let check;
  for await (check of Series(test, duration)) {
    if (check.passed) {
      return true;
    }
  }
  check.throw(`TimeoutError: expected ${test} to not return a false value within ${duration}, but it never did`);
}


export async function always(test, duration = 200) {
  for await (let check of Series(test, duration)) {
    if (!check.passed) {
      check.throw(`TimeoutError: ${test} was not true throughout the duration  of ${200}ms`);
    }
  }
}
