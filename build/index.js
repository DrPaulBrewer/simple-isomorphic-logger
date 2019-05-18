"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Copyright 2016 Paul Brewer, Economic and Financial Technology Consulting LLC
// This is open source software. The MIT License applies to this software.
// see https://opensource.org/licenses/MIT or included License.md file

/* eslint no-sync:"off", no-underscore-dangle:"off" */

/* global fs */

/**
 * Isomorphic javascript logger, logs data rows to memory for browser and test simulations, logs data rows to .csv disk files for node server-based simulations
 */

/**
 * Log stores tabular (array-of-array) data in JS memory on the browser, but streams it to disk using fs.appendFileSync() in nodejs server apps.
 * .last is used to cache the last log row As a kind of limited guarantee of history on both platforms
 */
var Log =
/*#__PURE__*/
function () {
  /**
   * Create Log with suggested file name in browser memory or on-disk in nodejs
   *
   * @param {string} fname Suggested file name
   * @param {boolean} force true forces filesystem mode, false forces memory mode, undefined tests for 'fs' module
   */
  function Log(fname, force) {
    _classCallCheck(this, Log);

    /**
     * if true, uses nodejs fs calls
     * @type {boolean} this.useFS
     */
    this.useFS = false;

    try {
      if (typeof force === 'undefined') {
        this.useFS = typeof fname === 'string' && (typeof fs === "undefined" ? "undefined" : _typeof(fs)) === 'object' && typeof fs.openSync === 'function' && typeof fs.appendFileSync === 'function' && !fs.should;
      } else {
        this.useFS = force;
      }
    } catch (e) {} // eslint-disable-line no-empty


    if (this.useFS) {
      /**
       * log file descriptor from open call
       * @type {number} this.fd
       */
      this.fname = fname;
      this.fd = fs.openSync(fname, 'w');
    } else {
      /**
       * data array for browser and test usage
       * @type {Array} this.data
       */
      this.data = [];
    }
  }
  /**
   * stringifies data for text file
   * @param {Array|number|string} x data fo write to a string output
   * @return {string} stringified x data
   */


  _createClass(Log, [{
    key: "stringify",
    value: function stringify(x) {
      if (Array.isArray(x)) {
        return x.join(",") + "\n";
      }

      if (typeof x === 'number' || typeof x === 'string') {
        return x + "\n";
      }

      return JSON.stringify(x) + "\n";
    }
    /**
     * writes data to Log and sets .last
     * @param {Array|number|string} x data to write to Log's log file or memory
     * @return {Object} returns Log object, chainable
     */

  }, {
    key: "write",
    value: function write(x) {
      if (x === undefined) return;
      /**
       * last item written to log
       * @type {Object} this.last
       */

      this.last = x;

      if (this.useFS) {
        fs.appendFileSync(this.fd, this.stringify(x));
      } else {
        this.data.push(x);
      }

      return this;
    }
    /**
     * submits obj for its properties to be logged in order found in this.header.
     * if a property in this.header is omitted, the elsevalue is used.
     * Extraneous properties in obj but not in this.header are ignored.
     * @param {Object} obj object with properties from this.header and values to be logged
     * @param {string} filler value to write for properties found in this.header but omitted from obj
     */

  }, {
    key: "submit",
    value: function submit(obj, filler) {
      var row = [],
          header = this.header,
          i = 0,
          l = 0;
      if (!Array.isArray(header)) throw new Error("submit called, but this.header does not contain an array of properties to log");

      for (i = 0, l = header.length; i < l; ++i) {
        var val = obj[header[i]];
        row[i] = val === undefined ? filler : val;
      }

      this.write(row);
    }
    /**
     * sets header row and writes it to Log for csv-style Log.
     * @param {string[]} x Header array giving names of columns for future writes
     * @return {Object} Returns this Log; chainable
     */

  }, {
    key: "setHeader",
    value: function setHeader(x) {
      if (Array.isArray(x)) {
        /**
         * header array for Log, as set by setHeader(header)
         * @type {string[]}
         */
        this.header = x;
        this.write(x);
      }

      return this;
    }
    /**
     * last value for some column recorded in Log
     * throws if log is missing header row or column key is undefined
     * @return {number|string|undefined} value from last write at column position matching header for given key
     */

  }, {
    key: "lastByKey",
    value: function lastByKey(k) {
      if (!this.header || !this.header.length) throw new Error("log is missing header row");
      var idx = this.header.indexOf(k);
      if (idx === -1) throw new Error("bad column key: " + k);
      if (!this.last || !this.last.length) return undefined;
      return this.last[idx];
    }
    /**
     * get string of all data in the log.  If useFS is true, simply read the file.  If useFS is false, assemble from data.
     *
     * @return string representing all log data
     *
     */

  }, {
    key: "toString",
    value: function toString() {
      if (this.useFS) {
        return fs.readFileSync(this.fname, {
          encoding: 'utf8'
        });
      }

      var s = '';
      var i, l;

      for (i = 0, l = this.data.length; i < l; ++i) {
        s += this.stringify(this.data[i]);
      }

      return s;
    }
    /**
     * restore Log from string.  inverse of toString().
     *
     * @param string to convert to complete Log
     */

  }, {
    key: "fromString",
    value: function fromString(s) {
      function rowFromLine(line) {
        var row = line.split(",");

        for (var i = 0, rl = row.length; i < rl; ++i) {
          var v = row[i];

          if (v && /^-?\d/.test(v)) {
            v = parseFloat(v);
            if (!isNaN(v)) row[i] = v;
          }
        }

        return row;
      }

      var first = s.substring(0, s.indexOf("\n"));
      var start = 0;

      if (this.data) {
        if (this.data.length > 1) throw new Error("forbidden: attempting fromString() on populated Log -- denied -- would cause data erasure");
        this.data.length = 0;
      }

      if (this.header) {
        this.setHeader(first.split(","));
        start = first.length + 1;
      }

      var l = s.length;

      while (start < l) {
        var match = s.indexOf("\n", start);
        var line = match === -1 ? s.substring(start, s.length) : s.substring(start, match);
        start += line.length + 1;
        var fchar = line[0];

        if (fchar === '{' || fchar === '"' || fchar === '[') {
          var obj = JSON.parse(line);
          this.write(obj);
        } else if (line.includes(",")) {
          this.write(rowFromLine(line));
        } else this.write(line);
      }

      return this;
    }
    /**
     * get readable stream of string log data. This function requires a base class parameter Readable if using with in-memory data.
     * @param {Object} Readable base class for constructing readable streams (required only if log useFS=false)
     * @return {Object} readable stream of log data, in string form with newlines terminating records
     */

  }, {
    key: "createReadStream",
    value: function createReadStream(Readable) {
      if (this.useFS) {
        fs.fsyncSync(this.fd);
        return fs.createReadStream(this.fname, {
          encoding: 'utf8'
        });
      }

      if (!Readable) throw new Error("missing base class for Readable stream as first parameter");

      var LogStream =
      /*#__PURE__*/
      function (_Readable) {
        _inherits(LogStream, _Readable);

        function LogStream(simlog, opt) {
          var _this;

          _classCallCheck(this, LogStream);

          _this = _possibleConstructorReturn(this, _getPrototypeOf(LogStream).call(this, opt));
          _this._log = simlog;
          _this._index = 0;
          return _this;
        }

        _createClass(LogStream, [{
          key: "_read",
          value: function _read() {
            var i, hungry;

            do {
              i = this._index++;

              if (i < this._log.data.length) {
                var str = this._log.stringify(this._log.data[i]);

                if (typeof str === 'string' && str.length > 0) hungry = this.push(str, 'utf8');
              } else {
                hungry = this.push(null);
              }
            } while (i < this._max && hungry);
          }
        }]);

        return LogStream;
      }(Readable);

      return new LogStream(this);
    }
  }]);

  return Log;
}();

exports["default"] = Log;
