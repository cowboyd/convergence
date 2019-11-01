import { describe, beforeEach, afterEach, it } from 'mocha';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { when } from '../src/index';

use(chaiAsPromised);

describe('BigTest Convergence - when', () => {
  let total, test, timeout;

  beforeEach(() => {
    total = 0;
    test = (num) => when(() => {
      expect(total).to.equal(num);
    }, 50);
  });

  afterEach(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  it('resolves when the assertion passes within the timeout', async () => {
    timeout = setTimeout(() => total = 5, 30);

    let start = Date.now();
    await expect(test(5)).to.be.fulfilled;
    expect(Date.now() - start).to.be.within(30, 50);
  });

  it('rejects when the assertion does not pass within the timeout', async () => {
    let start = Date.now();
    await expect(test(5)).to.be.rejectedWith('expected 0 to equal 5');
    expect(Date.now() - start).to.be.within(50, 70);
  });

  it('rejects with an error when using an async function', async () => {
    await expect(when(async () => {})).to.be.rejectedWith(/async/);
  });

  it('rejects with an error when returning a promise', async () => {
    await expect(when(() => Promise.resolve())).to.be.rejectedWith(/promise/);
  });

  describe('when the assertion returns `false`', () => {
    beforeEach(() => {
      test = (num) => when(() => total >= num, 50);
    });

    it('rejects if `false` was continually returned', () => {
      return expect(test(10)).to.be.rejectedWith('TimeoutError');
    });

    it('resolves when `false` is not returned', () => {
      timeout = setTimeout(() => total = 10, 30);
      return expect(test(10)).to.be.fulfilled;
    });
  });

  describe('with a slight latency', () => {
    // exploits `while` to block the current event loop
    let latency = (ms) => {
      let start = Date.now();
      let end = start;

      while (end < start + ms) {
        end = Date.now();
      }
    };

    it('rejects as soon as it can after the timeout', async () => {
      let start = Date.now();

      await expect(
        // 5-10ms latencies start causing an increasing amount of
        // flakiness, anything higher fails more often than not
        when(() => !!latency(20), 50)
      ).to.be.rejected;

      // 10ms loop interval + 20ms latency = ~+30ms final latency
      expect(Date.now() - start).to.be.within(50, 80);
    });
  });

  describe('with a mocked date object', () => {
    beforeEach(() => {
      global.Date = { _og: global.Date };
    });

    afterEach(() => {
      global.Date = global.Date._og;
    });

    it('resolves when the assertion passes', async () => {
      await expect(test(0)).to.be.fulfilled;
    });
  });
});
