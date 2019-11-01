import { describe, beforeEach, afterEach, it } from 'mocha';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { always } from '../src/index';

use(chaiAsPromised);

describe('BigTest Convergence - always', () => {
  let total, test, timeout;

  beforeEach(() => {
    total = 5;
    test = (num) => always(() => {
      expect(total).to.equal(num);
    }, 50);
  });

  afterEach(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  it('resolves if the assertion does not fail throughout the timeout', async () => {
    let start = Date.now();
    await expect(test(5)).to.be.fulfilled;
    expect(Date.now() - start).to.be.within(50, 70);
  });

  it('rejects when the assertion fails within the timeout', async () => {
    timeout = setTimeout(() => total = 0, 30);

    let start = Date.now();
    await expect(test(5)).to.be.rejected;
    expect(Date.now() - start).to.be.within(30, 50);
  });

  it('rejects with an error when using an async function', async () => {
    await expect(always(async () => {})).to.be.rejectedWith(/async/);
  });

  it('rejects with an error when returning a promise', async () => {
    await expect(always(() => Promise.resolve())).to.be.rejectedWith(/promise/);
  });

  describe('when the assertion returns `false`', () => {
    beforeEach(() => {
      test = (num) => always(() => total < num, 50);
    });

    it('resolves if `false` was never returned', () => {
      return expect(test(10)).to.be.fulfilled;
    });

    it('rejects when `false` is returned', () => {
      timeout = setTimeout(() => total = 10, 30);
      return expect(test(10)).to.be.rejectedWith('TimeoutError');
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

    it('resolves as soon as it can after the timeout', async () => {
      let start = Date.now();

      await expect(
        always(() => latency(20), 50, true)
      ).to.be.fulfilled;

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
      await expect(test(5)).to.be.fulfilled;
    });
  });
});
