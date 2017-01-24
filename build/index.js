'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright 2016 Paul Brewer, Economic and Financial Technology Consulting LLC                             
// This is open source software. The MIT License applies to this software.                                  
// see https://opensource.org/licenses/MIT or included License.md file

/* eslint no-sync:"off" */

/* globals fs */

/**
 * Isomorphic javascript logger, logs data rows to memory for browser and test simulations, logs data rows to .csv disk files for node server-based simulations
 */

/**
 * Log stores tabular (array-of-array) data in JS memory on the browser, but streams it to disk using fs.writeSync() in nodejs server apps.
 * .last is used to cache the last log row As a kind of limited guarantee of history on both platforms
 */

var Log = function () {

    /** 
     * Create Log with suggested file name in browser memory or on-disk in nodejs
     *
     * @param {string} fname Suggested file name
     */

    function Log(fname) {
        _classCallCheck(this, Log);

        /**
         * if true, uses nodejs fs calls
         * @type {boolean} this.useFS
         */

        this.useFS = false;
        try {
            this.useFS = typeof fname === 'string' && fs && fs.openSync && fs.writeSync && !fs.should;
        } catch (e) {} // eslint-disable-line no-empty
        if (this.useFS) {

            /**
             * log file descriptor from open call
             * @type {number} this.fd
             */

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
     * writes data to Log and sets .last
     * @param {Array|number|string} x data to write to Log's log file or memory
     * @return {Object} returns Log object, chainable
     */

    _createClass(Log, [{
        key: 'write',
        value: function write(x) {
            if (x === undefined) return;

            /**
             * last item written to log
             * @type {Object} this.last
             */

            this.last = x;

            if (this.useFS) {
                if (Array.isArray(x)) {
                    fs.writeSync(this.fd, x.join(",") + "\n");
                } else if (typeof x === 'number' || typeof x === 'string') {
                    fs.writeSync(this.fd, x + "\n");
                } else {
                    fs.writeSync(this.fd, JSON.stringify(x) + "\n");
                }
            } else {
                this.data.push(x);
            }
            return this;
        }

        /**
         * sets header row and writes it to Log for csv-style Log. 
         * @param {string[]} x Header array giving names of columns for future writes
         * @return {Object} Returns this Log; chainable
         */

    }, {
        key: 'setHeader',
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
         * @return {number|string|undefined} value from last write at column position matching header for given key
         */

    }, {
        key: 'lastByKey',
        value: function lastByKey(k) {
            if (this.header && this.header.length && this.last && this.last.length) {
                return this.last[this.header.indexOf(k)];
            }
        }
    }]);

    return Log;
}();

exports.default = Log;
