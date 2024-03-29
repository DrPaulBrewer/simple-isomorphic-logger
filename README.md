simple-isomorphic-logger
========


[![Build Status](https://travis-ci.org/DrPaulBrewer/simple-isomorphic-logger.svg?branch=master)](https://travis-ci.org/DrPaulBrewer/simple-isomorphic-logger)
[![Coverage Status](https://coveralls.io/repos/github/DrPaulBrewer/simple-isomorphic-logger/badge.svg?branch=master)](https://coveralls.io/github/DrPaulBrewer/simple-isomorphic-logger?branch=master)

Flexibly log data to an in-memory browser array or to stream with writeSync to a .csv file on nodeJS

## Programmer's Documentation on ESDoc

The [ESDoc site for simple-isomorphic-logger](https://doc.esdoc.org/github.com/DrPaulBrewer/simple-isomorphic-logger/) contains documentation prepared from source code of this module.

## Breaking Changes for v5

### Module changes
v5 is ESM whereas versions 4 and earlier were commonjs.

### removing babel dependencies
v5 is not compiled with Babel

### Log constructor
specify writing to the filesystem in node by passing it as the 2nd parameter

## Tests

    npm test

will run the tests, if you have node 6 or later and mocha installed.  You can also click on the build or coverage badges to view public test reports.

## Copyright

Copyright 2016,2017,2022- Paul Brewer, Economic and Financial Technology Consulting LLC

## License:

[The MIT License](./LICENSE.md)
