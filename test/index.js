/* eslint-env node, mocha */

/* eslint no-console: "off", newline-per-chained-call: "off" */

import assert from 'assert';
import 'should';
import Log from '../src/index.js';

describe('new Log() to data array', function(){
    
    it('should have an empty data array', function(){   
        let L = new Log();
        L.should.have.property('data');
        assert.ok(Array.isArray(L.data));
        L.data.length.should.equal(0);
    });
    it('should have .useFS false', function(){
        let L = new Log();
        assert.ok(!L.useFS);
    });
    it('should have .fd undefined', function(){
        let L = new Log();
        assert.ok(typeof(L.fd)==='undefined');
    });
});


describe('Log.write([1,2,3,4,5]) to data array ', function(){
    
    let L = new Log();
    L.data.length.should.equal(0);
    L.write([1,2,3,4,5]);

    it('should add the array [1,2,3,4,5] to the data array', function(){
        L.data.length.should.equal(1);
        L.data.should.deepEqual([[1,2,3,4,5]]);
    });
    it('should set .last to [1,2,3,4,5]', function(){
        L.last.should.deepEqual([1,2,3,4,5]);
    });
});

describe('Log.write(23) to data array', function(){
    
    let L = new Log();
    L.data.length.should.equal(0);
    L.write(23);

    it('should add the number 23 to the data array', function(){
        L.data.length.should.equal(1);
        L.data.should.deepEqual([23]);
    });
    
    it('should set .last to 23', function(){
        L.last.should.equal(23);
    });
});

describe('Log.write({a:23}) to data array', function(){
    
    it('should add the object {a:23} to the data array', function(){
        let L = new Log();
        L.data.length.should.equal(0);
        L.write({a:23});
        L.last.should.deepEqual({a:23});
        L.data.length.should.equal(1);
        L.data.should.deepEqual([{a:23}]);
    });
});

describe('Log.write(undefined) to data array', function(){
    
    it('should leave the data array unchanged', function(){
        let L = new Log();
        L.data.length.should.equal(0);
        L.write();
        L.write(undefined);
        L.data.length.should.equal(0);
        assert.ok(typeof(L.last)==='undefined');
    });
});

describe('new Log() to file', function(){

    global.fs = require('fs');  // eslint-disable-line global-require
    
    it('should have an empty data array', function(){   
        let L = new Log("/tmp/test1", true);
        L.should.not.have.property('data');
    });
    it('should have .useFS true', function(){
        let L = new Log("/tmp/test1",true);
        assert.ok(L.useFS);
    });
    it('should have .fd defined', function(){
        let L = new Log("/tmp/test1",true);
        assert.ok(typeof(L.fd)==='number');
    });
});
