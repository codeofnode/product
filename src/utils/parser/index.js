import querystring from 'querystring';
import { config } from '../../package.json';
import appImport from '../../appImport';

const { fillToLast, lastValue } = appImport('petu/obj/lastValue').LastMan;
const { warn } = appImport('petu/logger').default;

/**
  * The payload parser class
  * @class
  */
class PayloadParser {
  /**
   * Create an instance of payload parser
   * @param {IncommingMessage} req - the incoming request
   */
  static parse(args) {
    return (new PayloadParser(...args)).parse();
  }

  /**
   * Create an instance of payload parser
   * @param {IncommingMessage} req - the incoming request
   * @param {String} ky - the key to store variables
   * @param {Function} [parser=JSON.parse] - the parser function
   * @param {String} [ev=req-payload-parsed] - the parser function
   */
  constructor(req, ky, parser = JSON.parse, ev = 'req-payload-parsed') {
    this.vars = fillToLast(req, ky, 'params');
    this.eventUponOver = ev;
    this.parser = parser;
    if (typeof parser !== 'function' &&
        lastValue(req, 'headers', 'content-type').toLowerCase().indexOf('form-urlencoded') !== -1) {
      this.parser = querystring;
    }
    this.req = req;
  }

  /**
   * upon parsing is completed
   * @param {Function} resolve - the function which get called with parsed payload
   */
  uponOver(resolve) {
    try {
      this.vars.body = this.parser(this.payloadc);
    } catch (er) {
      warn(er);
      this.vars.body = this.payloadc;
    }
    this.req.emit(this.eventUponOver);
    resolve(this.vars.body);
  }

  /**
   * parse function of payload parser
   */
  parse() {
    if (this.vars.body !== undefined) {
      return new Promise(res => res(this.vars.body));
    }
    this.payloadc = '';
    this.req.on('data', (chk) => {
      this.payloadc += chk;
    });
    return new Promise((resolve) => {
      const onceOver = this.onceOver.bind(this, resolve);
      this.req.once('end', onceOver);
      this.req.once('error', onceOver);
    });
  }
}

export default PayloadParser.parse;
export { PayloadParser };
