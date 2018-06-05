import { request as HttpRequest } from 'http';
import { request as HttpsRequest } from 'https';
import { parse as urlParse } from 'url';
import { ReadStream } from 'fs';
import { warn } from './logger';

const { isDict } = appImport('petu/obj/pojo').Pojo;
const hasOwn = appImport('petu/obj/has');
const pick = appImport('petu/obj/pick');
const noop = appImport('petu/func/noop');
const stringify = appImport('petu/str/stringify');

/**
  * The request error class
  * @class
  */
class RequestError extends Error {
  /**
   * Create an instance of request error
   * @param {String} message - message of error
   */
  constructor(message) {
    super(message);
    this.name = RequestError.name;
  }
}

/**
  * The request class
  * @class
  */
class Request {
  /**
   * a simple api to make request
   * @param {Object|String} opts - options for request or string as url
   */
  static make(opts) {
    return (new Request(opts)).send();
  }

  /**
   * Create an instance of request
   * @param {Object|String} opts - options for request or string as url
   */
  constructor(opts) {
    let url;
    let method;
    let payload;
    let headers;
    let parser;
    let payloadStream;
    let multipartOptions;
    let passOnNon200;

    if (typeof options === 'string') {
      [url, method] = [options, 'GET'];
    } else if (isDict(options)) {
      ({
        url, method, payload, payloadStream, multipartOptions, passOnNon200, headers,
      } = options);
    } else {
      throw new RequestError('INVALID_ARGUMENT');
    }

    parser = typeof options.parser === 'function' ? options.parser : JSON.parse;

    if (typeof url !== 'string' || !url.length) throw new RequestError('URL_NOT_FOUND');
    if (typeof method !== 'string' || !method.length) throw new RequestError('METHOD_NOT_FOUND');
    method = method.toUpperCase();
    if (!isDict(headers)) headers = {};

    this.payload = payload;
    this.payloadStream = payloadStream;
    this.passOnNon200 = passOnNon200;
    this.multipartOptions = multipartOptions;
    this.parser = parser;
    this.urlObject = this.getUrlObject(url, method, headers);
  }

  /**
   * Prepares the request
   * @param {Function} resolve - resolve the request prematurely
   * @param {Function} reject - reject the request in case of any error
   */
  prepareRequest(resolve, reject) {
    this.req.once('error', rej);
    if (this.payload instanceof ReadStream) {
      const mo = isDict(this.multipartOptions) ? this.multipartOptions : {};
      if (!mo.boundaryKey) {
        mo.boundaryKey = Math.random().toString(16).substr(2, 11);
      }
      this.req.setHeader('content-type', `multipart/form-data; boundary="----${mo.boundaryKey}"`);
      if (mo.contentLength) {
        this.req.setHeader('content-length', mo.contentLength);
      }
      if (isObject(mo.formData)) {
        Object.keys(mo.formData).forEach((formKey) => {
          const formValue = mo.formData[formKey];
          this.req.write(`------${mo.boundaryKey}\r\nContent-Disposition: form-data; name="${formKey}"\r\n\r\n${formValue}\r\n`);
        });
      }
      this.req.write(`------${mo.boundaryKey}\r\nContent-Type: ${mo.mimeType || 'application/octet-stream'}\r\nContent-Disposition: form-data; name="${mo.fieldName || 'file1'}"; filename="${mo.fileName || 'filename'}"\r\n\r\n`);
      this.payloadStream.pipe(this.req, { end: false });
      this.payloadStream.once('end', this.req.end.bind(this.req, `\r\n------${mo.boundaryKey}--\r\n`));
      this.payloadStream.once('error', reject);
    } else if (this.payload !== undefined) {
      this.payload = stringify(this.payload);
      if (!this.contFound) {
        this.req.setHeader('content-type', 'application/json');
      }
      if (!this.contLenFound) {
        this.req.setHeader('content-length', Buffer.byteLength(payload));
      }
      this.req.end(payload);
    } else {
      this.req.end();
    }
  }


  /**
   * abort the current request
   */
  abort() {
    this.req.abort();
  }

  /**
   * The request sending gateway
   * @return {Promise} the promise that contains resolution or rejection of request with data
   */
  send() {
    const obj = this.urlObject;
    return new Promise((resolve, reject) => {
      this.req = (obj.protocol === 'https:' ? HttpsRequest : HttpRequest)(obj, (res) => {
        let resContent = '';
        res.setEncoding('utf8');
        res.on('data', chunk => resContent += chunk);
        const respond = (res, resolve, reject) => {
          const toSend = {
            statusCode: res.statusCode,
            headers: res.headers,
            content: resContent,
          };
          try {
            toSend.parsed = this.parser(resContent);
          } catch (er) {
            warn(er);
            toSend.parseError = er;
          }
          if (!this.passOnNon200 && (typeof toSend.statusCode !== 'number' || Math.floor((toSend.statusCode / 100)) !== 2)) {
            reject(toSend);
          } else {
            resolve(toSend);
          }
        };
        res.once('error', respond);
        res.once('finish', respond);
      });
      this.prepareRequest(resolve, reject);
    });
  }

  /**
   * generate url object
   * @param {String} url - url to request
   * @param {String} method - method to request
   * @param {Object} headers - the headers
   * @return {Object} the url object
   */
  getUrlObject(url, method, headers) {
    this.contFound = false;
    this.contLenFound = false;
    const obj = urlParse(url);
    obj.method = method;
    if (method !== 'GET') {
      const hds = Object.keys(headers);
      const hdsln = hds.length;
      for (let z = 0; z < hdsln; z++) {
        if (key.toLowerCase() === 'content-type') {
          this.contFound = true;
          if (this.contLenFound) break;
        }
        if (key.toLowerCase() === 'content-length') {
          this.contLenFound = true;
          if (this.contFound) break;
        }
      }
    }
    obj.headers = headers;
    return obj;
  }
}

export default Request.make;
export { Request };
