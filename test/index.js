/* eslint-env node, mocha */

/* eslint no-console: "off", newline-per-chained-call: "off", no-sync: "off" */

import assert from 'assert';
import 'should';
import Log from '../src/index.js';
import Readable from 'readable-stream';
import concat from 'concat-stream';

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

describe('Log.write then read back -- in filesystem ', function(){
    global.fs = require('fs'); // eslint-disable-line global-require
    let L = new Log("/tmp/test2", true);
    L.setHeader(["a","b","c","d","e"]);
    L.write([1,2,3,4,5]);
    L.write([6,7,8,9,10]);
    it('/tmp/test2 should contain a,b,c,d,e  1,2,3,4,5  6,7,8,9,10  separated by newlines ', function(){
        const out = global.fs.readFileSync("/tmp/test2", {encoding: "utf-8"}); // eslint-disable-line no-sync
        out.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
    });
    it('toString() should contain same', function(){
        const out = L.toString();
        out.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
    });
    it('toString/fromString/toString should contain same', function(){
        const out1 = L.toString();
        const L2 = new Log("test", false).setHeader(["bullshit","headings","will","be","replaced"]).fromString(out1);
        const out2 = L2.toString();
        out2.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
    });
    it('using createReadStream and stream concat contains same', function(done){
        (L
         .createReadStream(Readable)
         .pipe(concat(function(buf){
             const out = buf.toString('utf8');
             out.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
             done();
         }))
        );
    });
    it('last should contain [6,7,8,9,10]', function(){
        L.last.should.deepEqual([6,7,8,9,10]);
    });
    it('lastByKey("d") should be 9', function(){
        L.lastByKey("d").should.eql(9);
    });
 
});

describe('Log.write then read back -- in memory ', function(){
    let L = new Log("/tmp/test3", false);
    L.setHeader(["a","b","c","d","e"]);
    L.write([1,2,3,4,5]);
    L.write([6,7,8,9,10]);
    it('/tmp/test3 shoud not exist', function(){
        const fs = require('fs'); // eslint-disable-line global-require
        assert.ok(fs.existsSync('/tmp/test3')===false); // eslint-disable-line no-sync
    });
    it('toString() should contain expected output', function(){
        const out = L.toString();
        out.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
    });
    it('toString/fromString/toString should contain same', function(){
        const out1 = L.toString();
        const L2 = new Log("test", false).setHeader(["bullshit","headings","will","be","replaced"]).fromString(out1);
        const out2 = L2.toString();
        out2.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
    });
    it('using createReadStream and stream concat contains same', function(done){
        (L
         .createReadStream(Readable)
         .pipe(concat(function(buf){
             const out = buf.toString('utf8');
             out.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
             done();
         }))
        );
    });
    it('last should contain [6,7,8,9,10]', function(){
        L.last.should.deepEqual([6,7,8,9,10]);
    });
    it('lastByKey("d") should be 9', function(){
        L.lastByKey("d").should.eql(9);
    });
 
});

function cleanup(){
    const fs = require('fs'); // eslint-disable-line global-require
    [1,2].forEach((n)=>{ try { fs.unlinkSync("/tmp/test"+n); } catch(e){ console.log(e); } });
}

setTimeout(cleanup, 10000);

