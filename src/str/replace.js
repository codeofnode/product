import objwalk from '../obj/walk';
import assign from '../obj/assign';
import hasProp from '../obj/has';
import noop from '../func/noop';

/**
 * generate var regex
 * @param {String} startVar - start variable
 * @param {String} endVar - end variable
 * @return {RegExp} the regex generated
 */
const generateVarRegex = (startVar, endVar) =>
  new RegExp(`(${startVar}[a-zA-Z0-9\\$\\._]+${endVar})+`, 'g');

/**
 * generate method regex
 * @param {String} startVar - start variable
 * @param {String} endVar - end variable
 * @return {RegExp} the regex generated
 */
const generateMethodRegex = (startVar, endVar) =>
  new RegExp(`(${startVar}[a-zA-Z0-9_]+\\(.*?\\)${endVar})+`, 'g');


/**
 * @module templist
 */

/**
  * The Templist class
  * @class
  */
class Templist {
  /* the start variable pattern
   * @member {String}
   * @static
   */
  static startVar = '{{';

  /* the end variable pattern
   * @member {String}
   * @static
   */
  static endVar = '}}';

  /* the function key, that will ask to call the linked method
   * @member {String}
   * @static
   */
  static funcKey = '@';

  /* the debug function, helpful to debug if something went wrong with method call
   * @member {Function}
   * @static
   */
  static debugFunc = noop;

  /* what data to be sent in case of any error
   * @member {String}
   * @static
   */
  static valOnMethodError = 'METHOD_ERROR';

  /**
   * initialize an instance of Templist class
   * @param {Object} opts - object that accepts properties to that will act as config for templist
   * @param {String} opts.startVar - the start variable
   * @param {String} opts.envVar - the end variable
   * @param {String} opts.funcKey - the function key
   * @param {RegExp} opts.varRegex - the variable regex
   * @param {RegExp} opts.functionRegex - the function regex
   * @param {Function} opts.debugFunc - the debug function
   * @param {String} opts.valOnMethodError - what value to be resolved in case of method failure
   */
  constructor(opts) {
    Object.assign(this, {
      startVar: Templist.startVar,
      endVar: Templist.endVar,
      funcKey: Templist.funcKey,
      varRegex: Templist.varRegex,
      functionRegex: Templist.functionRegex,
      debugFunc: Templist.debugFunc,
      valOnMethodError: Templist.valOnMethodError,
    }, opts);
    /** @member {Number} */
    this.svarLen = this.startVar.length;
    /** @member {Number} */
    this.evarLen = this.endVar.length;
    /** @member {RegEx} */
    this.varRegex = generateVarRegex(this.startVar, this.endVar);
    /** @member {RegEx} */
    this.functionRegex = generateMethodRegex(this.startVar, this.endVar);
  }

  /**
   * return if a string is alpha numeric
   * @param {String} st - the input string
   * @return {Boolean} if the input string is alpha numeric
   */
  static isAlphaNum(st) {
    return Boolean(!(/[^A-Za-z0-9]/).test(st));
  }

  /**
   * return if a string contains a variable syntax
   * @param {String} st - the input string
   * @return {Boolean} if the string having a variable
   */
  isWithVars(st) {
    if (st && typeof st === 'string' && st.length > (this.evarLen + this.svarLen)) {
      const f = st.indexOf(this.startVar);
      const l = st.indexOf(this.endVar);
      return (f !== -1 && l !== -1) ? [f, l] : false;
    } return false;
  }

  /**
   * handles function part of object
   * @param {Object} inp - the input object
   * @param {Object} vars - the variables object
   * @param {Object} methods - the methods object
   * @return {Object} the modified input object
   */
  handleFunction(inp, vars, methods) {
    if (typeof inp === 'object' && inp && this.funcKey) {
      if (typeof methods === 'object' && (typeof inp[this.funcKey] === 'string') &&
        Templist.isAlphaNum(inp[this.funcKey]) && (typeof methods[inp[this.funcKey]] === 'function')) {
        const pms = (typeof inp.params === 'object' && inp.params !== null) ? assign(null, inp.params) : inp.params;
        let params = this.replace(pms, vars, methods);
        if (!(Array.isArray(params))) {
          params = [params];
        }
        params.unshift(vars, methods);
        return methods[inp[this.funcKey]].apply(null, params);
      }
    }
    return inp;
  }

  /**
   * Deal with undefined value, substitute a default
   * @param {*} st - input
   * @param {*} def - the default value
   * @return {*} `def` if undefined else st
   */
  static noUndefined(st, def) {
    return st === undefined ? def : st;
  }

  /**
   * get variable value again a variable name from variablesMap. Handles nested property as well
   * @param {*} varVal - input variable value
   * @param {String} varName - variable name
   * @param {Object} variablesMap - the variables map
   * @return {*} the resolved value
   */
  getVarVal(varVal, varName, variablesMap) {
    if (typeof variablesMap !== 'object' || variablesMap === null) return varVal;
    if (hasProp(variablesMap, varName)) {
      return variablesMap[varName];
    }
    if (varName.indexOf('.') !== -1) {
      const spls = varName.split('.');
      const ln = spls.length;
      let valFound = true;
      if (ln) {
        let base = this.getVarVal(spls[0], spls[0], variablesMap);
        for (let j = 1; j < ln; j++) {
          if (spls[j].length) {
            if (typeof base === 'object') {
              const curVal = (spls[j] === '$' && Array.isArray(base))
                ? this.getVarVal(spls[j], spls[j], variablesMap) : spls[j];
              try {
                base = base[curVal];
              } catch (er) {
                valFound = false;
              }
            } else {
              valFound = false;
            }
          }
        }
        if (valFound) {
          return Templist.noUndefined(base, varVal);
        }
      }
    }
    return hasProp(variablesMap, varName)
      ? variablesMap[varName]
      : this.noUndefined(varVal);
  }

  /**
   * core replacement function, to replace the variable with its value
   * @param {String} str - input string
   * @param {String} varName - variable name
   * @param {*} varValue - the variable value
   * @return {String} the resolved string value
   */
  replaceVariable(str, varName, varValue) {
    if (str === varName) return varValue;
    const strType = typeof varValue === 'string';
    const ln = str.length;
    const patt = (strType ||
      (str.indexOf(this.startVar) !== 0 ||
        str.indexOf(this.endVar) !== (ln - this.evarLen)))
      ? varName : `"${varName}"`;
    const rValue = strType ? varValue : JSON.stringify(varValue);
    return str.replace(patt, () => rValue);
  }

  /**
   * extacts variable name
   * @param {String} variable - the variable string
   * @return {String} the extracted variable
   */
  extractVarName(variable) {
    return variable.substring(this.evarLen, variable.length - this.evarLen);
  }

  /**
   * replace a string with a array of variables
   * @param {String} strg - the input string
   * @param {String[]} vars - the array of variables
   * @param {Object} variablesMap - the variables map which contains value of variables
   * @param {Object} methodsMap - the methods map which contains corresponding functions,
   *                              if a variable in method format
   * @return {String} the replaced final string
   */
  replaceVariables(strg, vars, variablesMap, methodsMap) {
    let str = strg;
    let varName;
    let replaced;
    let wasString;
    for (let i = 0; i < vars.length; i++) {
      varName = this.extractVarName(vars[i]);
      replaced = this.getVarVal(vars[i], varName, variablesMap, methodsMap);
      if (replaced !== vars[i]) {
        wasString = typeof replaced === 'string';
        replaced = this.replace(replaced, variablesMap, methodsMap);
        if (wasString && typeof replaced !== 'string') replaced = JSON.stringify(replaced);
      }
      str = this.replaceVariable(str, vars[i], replaced);
    }
    return str;
  }

  /**
   * extracts variables from a string
   * @param {String} str - the input string
   * @return {String[]} the array of variables extracted
   */
  extractVars(str) {
    const ar = str.match(this.varRegex) || [];
    let ln = ar.length;
    for (let zi = 0, sps, sl; zi < ln; zi++) {
      if (ar[zi].indexOf(this.endVar + this.startVar) !== -1) {
        sps = ar[zi].split(this.endVar + this.startVar);
        sl = sps.length;
        for (let zj = 0; zj < sl; zj++) {
          if (zj) {
            if (zj === sl - 1) {
              sps[zj] = this.startVar + sps[zj];
            } else {
              sps[zj] = this.startVar + sps[zj] + this.endVar;
            }
          } else {
            sps[zj] += this.endVar;
          }
        }
        ar.splice.bind(ar, zi, 1).apply(ar, sps);
        ln += sl - 1;
        zi += sl - 1;
      }
    }
    return ar;
  }

  /**
   * extracts methods from a string
   * @param {String} str - the input string
   * @return {String[]} the array of methods variables extracted
   */
  extractMethods(str) {
    return str.match(this.functionRegex) || [];
  }

  /**
   * extract method name from function description
   * @param {String} methodDec - then method description
   * @return {String} method name extracted
   */
  extractMethodName(methodDec) {
    return methodDec.substring(this.svarLen, methodDec.indexOf('('));
  }

  /**
   * store the extracted paramaeters into an array
   * @param {String[]} strs - the array of string values
   * @param {Number} n - index of input of which parameters to extract
   * @param {String[]} ar - the array to store
   */
  static pushInto(strs, n, ar) {
    const chars = strs;
    chars[n] = chars[n].trim();
    const len = chars[n].length;
    if (len >= 2 && ((chars[n].charAt(0) === '\'' && chars[n].charAt(len - 1) === '\'') ||
          (chars[n].charAt(0) === '"' && chars[n].charAt(len - 1) === '"'))) {
      chars[n] = `"${chars[n].substring(1, len - 1).replace(/"/g, '\\"')}"`;
    }
    try {
      ar.push(JSON.parse(chars[n]));
    } catch (er) {
      ar.push(undefined);
    }
  }

  /**
   * extract parameters from method call variable
   * @param {String} str - the input string containing method call
   * @return {*} array of parameters extracted
   */
  static extractParameters(str) {
    const ar = [];
    if (typeof str === 'string' && str.length) {
      const chars = str.split(',');
      let cl = chars.length;
      for (let di, si, eg, fg, n = 0; n < cl; n++) {
        eg = chars[n].charAt(0);
        fg = chars[n].charAt(chars[n].length - 1);
        if (!(eg === fg && (eg === '"' || eg === '\''))) {
          chars[n] = chars[n].trim();
          eg = chars[n].charAt(0);
          fg = chars[n].charAt(chars[n].length - 1);
        }
        di = chars[n].indexOf('"');
        si = chars[n].indexOf('\'');
        if (((si === -1) && (di === -1)) || (eg === fg && (eg === '"' || eg === '\'')) ||
          (chars[n].charAt(0) === '{' && chars[n].charAt(chars[n].length - 1) === '}' &&
          (chars[n].match(/\{/g).length === chars[n].match(/\}/g).length)) ||
          (chars[n].charAt(0) === '[' && chars[n].charAt(chars[n].length - 1) === ']' &&
          (chars[n].match(/\[/g).length === chars[n].match(/\]/g).length))) {
          Templist.pushInto(chars, n, ar);
        } else if (n < (cl - 1)) {
          chars[n] = `${chars[n]},${chars[n + 1]}`;
          chars.splice(n + 1, 1);
          n -= 1;
          cl -= 1;
          continue; // eslint-disable-line no-continue
        }
      }
    }
    return ar;
  }

  /**
   * Extacts base description and pass to extract parameters engine
   * @param {String} methodDec - the method description
   * @param {String} methodName - the method name linked
   * @return {*} array of parameters extracted
   */
  extractMethodParams(methodDec, methodName) {
    const baseDec = methodDec.substring(
      methodName.length + this.svarLen + 1,
      methodDec.length - (this.evarLen + 1),
    ).trim();
    return Templist.extractParameters(baseDec, methodName);
  }

  /**
   * Invokes a method for the function call in method variable
   * @param {Function} method - the function to be called
   * @param {*} params - array of parameters
   * @param {String} methodName - the method name to be found in methods map
   * @param {Object} methodsMap - the methods map used to find the method name
   * @return {*} the value found from method call
   */
  invokeMethod(method, params, methodName, methodsMap) {
    try {
      return method.apply(methodsMap, params);
    } catch (eri) {
      this.debugFunc(eri);
      return this.valOnMethodError;
    }
  }

  /**
   * the function to be called to find method value of method variable
   * @param {String} methodDec - the method description string
   * @param {String} methodName - the method name to be found in methods map
   * @param {Function} method - the function to be called
   * @param {Object} methodsMap - the methods map used to find the method name
   * @return {*} the value found from method call
   */
  getMethodValue(methodDec, methodName, method, methodsMap) {
    const methodParams = this.extractMethodParams(methodDec, methodName);
    return this.invokeMethod(method, methodParams, methodName, methodsMap);
  }

  /**
   * the function to be called to find method value of method variable
   * @param {String} str - the input string which contains the method call variables
   * @param {String} methodDec - the method description string
   * @param {String} methodName - the method name to be found in methods map
   * @param {Function} method - the function to be called
   * @param {Object} methodsMap - the methods map used to find the method name
   * @return {String} the replaced string out of method invoking
   */
  replaceMethod(str, methodDec, methodName, method, methodsMap) {
    const methodValue = this.getMethodValue(methodDec, methodName, method, methodsMap);
    if (str === methodDec) return methodValue;
    return str.replace(methodDec, () => methodValue);
  }

  /**
   * replace string from a list of methods
   * @param {String} strg - the input string which contains the method call variables
   * @param {String[]} methods - array containing methods name and their parameters, description
   * @param {Object} methodsMap - the methods map used to find the method name
   * @return {String} the replaced string out of method replacement
   */
  replaceMethods(strg, methods, methodsMap) {
    let methodName = '';
    let str = strg;
    for (let i = 0; i < methods.length; i++) {
      methodName = this.extractMethodName(methods[i]);
      if (methodsMap && typeof methodsMap[methodName] === 'function') {
        str = this.replaceMethod(
          str, methods[i], methodName,
          methodsMap[methodName], methodsMap,
        );
      }
    }
    return str;
  }

  /**
   * replace string from a list of variables and methods
   * @param {String} inp - the input string which contains the variables and methods
   * @param {Object} vars - the variables map
   * @param {Object} methods - the methods map
   * @return {String} the replaced string out of variable and method replacement
   */
  replaceString(inp, vars, methods) {
    let input = inp;
    let str;
    while (typeof input === 'string' && str !== input) {
      str = input;
      input = this.replaceVariables(input, this.extractVars(input), vars, methods);
    }
    if (typeof input !== 'string') return input;
    return this.replaceMethods(input, this.extractMethods(input), methods);
  }

  /**
   * visit a value while walking into object
   *
   * @param {Object} vars - the variables map
   * @param {Object} methods - the methods map
   * @param {*} valn - the value found
   * @param {String} key - the key against which value is found
   * @param {Object} par - the parent object
   */
  visitValue(vars, methods, valn, key, par) {
    const rt = par;
    if (hasProp(rt, key)) {
      let val = rt[key];
      let tmpKy = null;
      let isth = this.isWithVars(key);
      if (isth) {
        tmpKy = this.replaceString(key, vars, methods);
        if (tmpKy !== key) {
          val = rt[key];
          rt[tmpKy] = val;
          delete rt[key];
        }
      }
      if (typeof val === 'string' && val) {
        isth = this.isWithVars(val);
        if (isth) {
          rt[tmpKy || key] = this.replaceString(val, vars, methods);
        }
      } else {
        rt[tmpKy || key] = this.handleFunction(val, vars, methods);
      }
    }
  }

  /**
   * the main replace api that accepts any type input, be it string, or object,
   *    and returns the in-place replaced value
   *
   * @param {*} inp - the input string or object or just anything
   * @param {Object} vars - the variables map
   * @param {Object} methods - the methods map
   * @return {*} the replaced value out of variable and method replacement
   */
  replace(inp, vars, methods) {
    let input = inp;
    if (typeof input !== 'object' || !input) {
      return this.replaceString(input, vars, methods);
    }
    input = this.handleFunction(input, vars, methods);
    objwalk(this.visitValue.bind(undefined, vars, methods), null, input);
    return input;
  }
}

const templist = new Templist();
export default templist.replace.bind(templist);
export { Templist };
