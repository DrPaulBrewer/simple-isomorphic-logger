// Copyright 2016 Paul Brewer, Economic and Financial Technology Consulting LLC                             
// This is open source software. The MIT License applies to this software.                                  
// see https://opensource.org/licenses/MIT or included License.md file

/* eslint no-sync:"off" */

/* global fs */

/**
 * Isomorphic javascript logger, logs data rows to memory for browser and test simulations, logs data rows to .csv disk files for node server-based simulations
 */

/**
 * Log stores tabular (array-of-array) data in JS memory on the browser, but streams it to disk using fs.appendFileSync() in nodejs server apps.
 * .last is used to cache the last log row As a kind of limited guarantee of history on both platforms
 */


export default class Log {

    /** 
     * Create Log with suggested file name in browser memory or on-disk in nodejs
     *
     * @param {string} fname Suggested file name
     * @param {boolean} force true forces filesystem mode, false forces memory mode, undefined tests for 'fs' module
     */

    constructor(fname, force){

        /**
         * if true, uses nodejs fs calls
         * @type {boolean} this.useFS
         */
        
        this.useFS = false;
        try {
            if (typeof(force)==='undefined'){
                this.useFS = ( (typeof(fname)==='string') &&
                               (typeof(fs)==='object') &&
                               (typeof(fs.openSync)==='function') &&
                               (typeof(fs.appendFileSync)==='function') &&
                               !(fs.should) );
            } else {
                this.useFS = force;
            }
        } catch(e){} // eslint-disable-line no-empty

        if (this.useFS){
                
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

    write(x){
        if (x===undefined) return;

        /**
         * last item written to log
         * @type {Object} this.last
         */
        
        this.last = x;

        if (this.useFS){
            if (Array.isArray(x)){
                fs.appendFileSync(this.fd, x.join(",")+"\n");
            } else if ((typeof(x)==='number') || (typeof(x)==='string')){
                fs.appendFileSync(this.fd, x+"\n");
            } else {
                fs.appendFileSync(this.fd, JSON.stringify(x)+"\n");
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

   setHeader(x){ 
        if (Array.isArray(x)){

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
    
    lastByKey(k){
        if (this.header && this.header.length && this.last && this.last.length){
            return this.last[this.header.indexOf(k)];
        }
    }

    
}

