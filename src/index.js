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

    stringify(x){
        if (Array.isArray(x)){
            return x.join(",")+"\n";
        }
        if ((typeof(x)==='number') || (typeof(x)==='string')){
            return x+"\n";
        }
        return JSON.stringify(x)+"\n";
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

    submit(obj,filler){
        if (!Array.isArray(this.header))
            throw new Error("submit called, but this.header does not contain an array of properties to log");
        const row = this.header.map(function(prop){
            const val = obj[prop];
            return (val===undefined)? filler: val;
        });
        this.write(row);
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

    /**
     * get string of all data in the log.  If useFS is true, simply read the file.  If useFS is false, assemble from data. 
     *
     * @return string representing all log data
     *
     */

    toString(){
        if (this.useFS){
            return fs.readFileSync(this.fname, {encoding:'utf8'});
        }
        let s = '';
        let i,l;
        for(i=0,l=this.data.length;i<l;++i){
            s += this.stringify(this.data[i]);
        }
        return s;
    }

    /**
     * restore Log from string.  inverse of toString(). 
     *
     * @param string to convert to complete Log
     */
    
    fromString(s){
        function rowFromLine(line){
            const row = line.split(",");
            for(let i=0,rl=row.length;i<rl;++i){
                let v = row[i];
                if ((v) && (/^-?\d/.test(v))){
                    v = parseFloat(v);
                    if (!isNaN(v))
                        row[i] = v;
                }
            }
            return row;
        }
        const first = s.substring(0, s.indexOf("\n"));
        let start = 0;

        if (this.data){
            if (this.data.length > 1)
                throw new Error("forbidden: attempting fromString() on populated Log -- denied -- would cause data erasure");
            this.data.length = 0;
        }
        
        if (this.header){
            this.setHeader(first.split(","));
            start = first.length+1;
        }

        const l = s.length;

        while (start < l){
            const match =  s.indexOf("\n", start);
            const line = (match===-1)? (s.substring(start,s.length)): (s.substring(start,match));
            start += (line.length+1);
            const fchar = line[0];
            if ((fchar==='{') || (fchar==='"') || (fchar==='[')) {
                const obj = JSON.parse(line);
                this.write(obj);
            } else if (line.includes(",")){
                this.write(rowFromLine(line));
            } else
                this.write(line);
        }
        return this;
    }

    /**
     * get readable stream of string log data. This function requires a base class parameter Readable if using with in-memory data.
     * @param {Object} Readable base class for constructing readable streams (required only if log useFS=false)
     * @return {Object} readable stream of log data, in string form with newlines terminating records
     */

    createReadStream(Readable){
        if (this.useFS) {
            fs.fsyncSync(this.fd);
            return fs.createReadStream(this.fname,{encoding: 'utf8'});
        } 
        if (!Readable) throw new Error("missing base class for Readable stream as first parameter");
        class LogStream extends Readable {
            constructor(simlog, opt) {
                super(opt);
                this._log = simlog;
                this._index = 0;
            }

            _read() {
                let i, hungry;
                do {
                    i = this._index++;
                    if (i<this._log.data.length){
                        const str = this._log.stringify(this._log.data[i]);
                        if ((typeof(str)==='string') && (str.length>0))
                            hungry = this.push(str, 'utf8');
                    } else { 
                        hungry = this.push(null);
                    }
                } while ((i<this._max) && hungry);
            }
        }
        return new LogStream(this);    
    }
}

