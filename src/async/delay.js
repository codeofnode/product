
/**
 * @module delayBoy
 */

class DelayBoy {
  /**
   * Pause the execution in async way
   * @param {Number} interval - the interval in seconds
   * @return {Promise} the promise that resolves after `intv` seconds
   */
  static delay(interval) {
    return new Promise((res) => {
      setTimeout(res, interval);
    });
  }
}

export default DelayBoy.delay;
export { DelayBoy };
