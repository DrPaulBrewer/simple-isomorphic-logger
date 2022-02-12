/* eslint-env node, mocha */

/* eslint no-console: "off", newline-per-chained-call: "off", no-sync: "off" */

import {Log} from '../src/index.mjs';
import assert from 'assert';
import Should from 'should'; // eslint-disable-line no-unused-vars
import Readable from 'readable-stream';
import concat from 'concat-stream';
import fs from 'fs';

describe('new Log() to data array', function () {

  it('should have an empty data array', function () {
    let L = new Log();
    L.should.have.property('data');
    assert.ok(Array.isArray(L.data));
    L.data.length.should.equal(0);
  });
  it('should have .useFS false', function () {
    let L = new Log();
    assert.ok(!L.useFS);
  });
  it('should have .fd undefined', function () {
    let L = new Log();
    assert.ok(typeof(L.fd) === 'undefined');
  });
});


describe('Log.write([1,2,3,4,5]) to data array ', function () {

  let L;

  before(function () {
    L = new Log();
    L.data.length.should.equal(0);
    L.write([1, 2, 3, 4, 5]);
  });

  it('should add the array [1,2,3,4,5] to the data array', function () {
    L.data.length.should.equal(1);
    L.data.should.deepEqual([
      [1, 2, 3, 4, 5]
    ]);
  });
  it('should set .last to [1,2,3,4,5]', function () {
    L.last.should.deepEqual([1, 2, 3, 4, 5]);
  });
  it('L.data[0] is frozen', function(){
    assert(Object.isFrozen(L.data[0]));
  });
  it('L.last is frozen', function(){
    assert(Object.isFrozen(L.last));
  });
  it('modifying data row element throws /read only property/', function(){
    function bad(){
      L.data[0][0]=99;
    }
    bad.should.throw(/read only property/);
    L.data.should.deepEqual([[1,2,3,4,5]]);
  });
  it('modifying element of .last element throws /read only property/', function(){
    function bad(){
      L.last[0]=99;
    }
    bad.should.throw(/read only property/);
    L.last.should.deepEqual([1,2,3,4,5]);
  });
});

describe('Log.write(23) to data array', function () {

  let L = new Log();
  L.data.length.should.equal(0);

  function bad() {
    L.write(23);
  }

  it('should throw', function () {
    bad.should.throw();
  });

  it('should not add the number 23 to the data array', function () {
    L.data.length.should.equal(0);
    L.data.should.deepEqual([]);
  });

  it('should not set .last to 23', function () {
    assert(L.last === undefined);
  });
});

describe('Log.write({a:23,b:9}) to data array', function () {

  let L = new Log();
  L.data.length.should.equal(0);
  function bad(){
    L.write({ a: 23, b: 9 });
  }

  it('should throw', function () {
    bad.should.throw();
  });

  it('should not add to the data array', function () {
    L.data.length.should.equal(0);
    L.data.should.deepEqual([]);
  });

});

describe('Log.write(undefined) to data array', function () {
  let L = new Log();

  function bad(){
    L.write();
  }

  it('should throw', function(){
    bad.should.throw();
  });

  it('should leave the data array unchanged', function () {
    L.data.length.should.equal(0);
  });

});

describe('selectAscending', function(){
  let L;
  before(function(){
    L = new Log();
    L.setHeader(['x','y']);
    for(let i=0;i<=100;++i){
      L.write([i,i*i]);
    }
  });
  function inclusiveXSubset(_f,_t){
    const f = Math.max(_f,0);
    const t = Math.min(_t,100);
    if ((f>100) || (t<0)) return [];
    const result = [['x','y']];
    for(let i=f;i<=t;++i)
      result.push([i,i*i]);
    return result;
  }
  function inclusiveYSubset(_f,_t){
    if (_t<0) return [];
    const f = Math.max(_f,0);
    const t = Math.min(_t,100*100);
    const xf = Math.ceil(Math.sqrt(f));
    const xt = Math.floor(Math.sqrt(t));
    if (xf===(xt+1)) return [];
    return inclusiveXSubset(xf,xt);
  }
  it('should return the expected item for a search on x for each of 0 to 100', function(){
    for(let j=0;j<=100;++j){
      L.selectAscending('x',j).should.deepEqual([['x','y'],[j,j*j]]);
    }
  });
  it('should return the expected item for a search on y for each square of 0 to 100', function(){
    for(let j=0;j<=100;++j){
      L.selectAscending('y',j*j).should.deepEqual([['x','y'],[j,j*j]]);
    }
  });
  it('should return the expected subset for a search on x for each [f,t] in [-5,105]',function(){
    for(let f=-5;f<=105;f++)
      for(let t=f;t<=105;t++)
        L.selectAscending('x',f,t).should.deepEqual(inclusiveXSubset(f,t));
  });
  it('should return the expected subset for a search on y for each [f,t] in [-5,200]', function(){
    for(let f=-5;f<=205;f++)
      for(let t=f;t<=205;t++)
        L.selectAscending('y',f,t).should.deepEqual(inclusiveYSubset(f,t));
  });
  it('should throw on improper prop', function(){
    function bad1(){
      L.selectAscending(undefined,10,100);
    }
    function bad2(){
      L.selectAscending(['x'],10,100);
    }
    bad1.should.throw(/requires string prop/);
    bad2.should.throw(/requires string prop/);
  });
  it('should throw on nonexistant prop', function(){
    function bad(){
      L.selectAscending('z',10,100);
    }
    bad.should.throw(/prop not found/);
  });
  it('should throw on improper fromValue', function(){
    function bad1(){
      L.selectAscending('x','10',20);
    }
    function bad2(){
      L.selectAscending('x',undefined,20);
    }
    bad1.should.throw(/requires numeric fromValue/);
    bad2.should.throw(/requires numeric fromValue/);
  });
  it('should throw on improper toValue', function(){
    function bad1(){
      L.selectAscending('x',10,'20');
    }
    function bad2(){
      L.selectAscending('x',10,null);
    }
    bad1.should.throw(/requires numeric toValue/);
    bad2.should.throw(/requires numeric toValue/);
  });
  it('should throw for a search on x for each [f,t] with f>t', function(){
    function testThrows(f,t){
      (()=>(L.selectAscending('x',f,t))).should.throw(/toValue>=fromValue/);
    }
    for(let f=-5;f<=105;f++)
      for(let t=-6;t<f;t++)
        testThrows(f,t);
  });

});

describe('new Log() to file', function () {

  it('should not have a data array', function () {
    let L = new Log("/tmp/test1", fs);
    L.should.not.have.property('data');
  });
  it('should define .fs', function () {
    let L = new Log("/tmp/test1", fs);
    assert.ok(L.fs===fs);
  });
  it('should have .fd defined', function () {
    let L = new Log("/tmp/test1", fs);
    assert.ok(typeof(L.fd) === 'number');
  });
});

describe('Log.write then read back -- in filesystem ', function () {
  let L = new Log("/tmp/test2", fs);
  L.setHeader(["a", "b", "c", "d", "e"]);
  L.write([1, 2, 3, 4, 5]);
  L.write([6, 7, 8, 9, 10]);
  it('/tmp/test2 should contain a,b,c,d,e  1,2,3,4,5  6,7,8,9,10  separated by newlines ', function () {
    const out = fs.readFileSync("/tmp/test2", { encoding: "utf-8" }); // eslint-disable-line no-sync
    out.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
  });
  it('toString() should contain same', function () {
    const out = L.toString();
    out.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
  });
  it('toString/fromString/toString should contain same', function () {
    const out1 = L.toString();
    const L2 = new Log("test", false).setHeader(["bullshit", "headings", "will", "be", "replaced"]).fromString(out1);
    const out2 = L2.toString();
    out2.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
  });
  it('using createReadStream and stream concat contains same', function (done) {
    (L
      .createReadStream(Readable)
      .pipe(concat(function (buf) {
        const out = buf.toString('utf8');
        out.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
        done();
      }))
    );
  });
  it('last should contain [6,7,8,9,10]', function () {
    L.last.should.deepEqual([6, 7, 8, 9, 10]);
  });
  it('lastByKey("d") should be 9', function () {
    L.lastByKey("d").should.eql(9);
  });
  it('lastByKey("unicorn") should throw (bad key)', function () {
    function badKey() { return L.lastByKey("unicorn"); }
    badKey.should.throw();
  });

});

describe('Log.write 1,2,3,4,5 and submit object with values 6,7,8,9,10 then read back -- in memory ', function () {
  let L = new Log("/tmp/test3");
  L.setHeader(["a", "b", "c", "d", "e"]);
  L.write([1, 2, 3, 4, 5]);
  const obj = {
    a: 6,
    b: 7,
    c: 8,
    d: 9,
    e: 10
  };
  L.submit(obj);
  it('/tmp/test3 shoud not exist', function () {
    assert.ok(fs.existsSync('/tmp/test3') === false); // eslint-disable-line no-sync
  });
  it('toString() should contain expected output', function () {
    const out = L.toString();
    out.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
  });
  it('toString/fromString/toString should contain same', function () {
    const out1 = L.toString();
    const L2 = new Log("test", false).setHeader(["bullshit", "headings", "will", "be", "replaced"]).fromString(out1);
    const out2 = L2.toString();
    out2.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
  });
  it('using createReadStream and stream concat contains same', function (done) {
    (L
      .createReadStream(Readable)
      .pipe(concat(function (buf) {
        const out = buf.toString('utf8');
        out.should.eql("a,b,c,d,e\n1,2,3,4,5\n6,7,8,9,10\n");
        done();
      }))
    );
  });
  it('last should contain [6,7,8,9,10]', function () {
    L.last.should.deepEqual([6, 7, 8, 9, 10]);
  });
  it('lastByKey("d") should be 9', function () {
    L.lastByKey("d").should.eql(9);
  });
  it('lastByKey("unicorn") should throw (bad key)', function () {
    function badKey() { return L.lastByKey("unicorn"); }
    badKey.should.throw();
  });
});

function cleanup() {
  [1, 2].forEach((n) => { try { fs.unlinkSync("/tmp/test" + n); } catch (e) { console.log(e); } });
}

setTimeout(cleanup, 10000);
