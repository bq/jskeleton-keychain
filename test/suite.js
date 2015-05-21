/* global describe, it, should, before  */

var should = require('should');
'use strict';

describe('Foo test', function(){
    
    before(function(){
        this.foo = 'bar';
    });

    it('foo bar test', function(){
        should(this.foo).be.exactly('bar');
    });

});
