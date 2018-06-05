import { config.reqVarsKey as reqVarsKey } from '../../package.json';
import querystring from 'querystring';
import logger from '../logger';

const stringify = AppImport('petu/str/stringify');
const { fillToLast, lastValue } = AppImport('petu/obj/lastValue').LastMan;

/**
  * The payload parser class
  * @class
  */
class PayloadParser {
  /**
   * Create an instance of payload parser
   * @param {IncommingMessage} req - the incoming request
   * @param {Function} [parser] - the parser function
   * @param {String} [ky] - the key to store variables
   */
  constructor(req, parser, ky = reqVarsKey) {
    this.vars = fillToLast(req, ky);
    if (typeof parser !== 'function' &&
        lastValue(req, 'headers', 'content-type').toLowerCase().indexOf('form-urlencoded') !== -1) {
      parser = querystring;
    }
    this.parser = parser;
    this.req = req;
  }

  /**
   * upon parsing is completed
   */
  uponOver(resolve, reject) {
    try {
      this.vars.body =
    }
    this.body = data ? PARSE(data,GLOBAL_METHODS.lastValue(req, 'headers', 'content-type')) : {};
    this.vars.payloadParsed = true;
    this.req.emit('body-parsed');
  }

  /**
   * parse function of payload parser
   */
  parse() {
    if (this.vars.body !== undefined) return
    this.payloadc = '';
    this.req.on('data', chk => this.payloadc += chk);
    return new Promise((resolve, reject) => {
      const onceOver = this.onceOver.bind(this, resolve, reject);
      this.req.once('end', onceOver);
      this.req.once('error',onceOver);
    });
  }
}
