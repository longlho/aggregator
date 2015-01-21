'use strict';

// Full server test, cause Node is awesome
var app = require('../index')
  , assert = require('assert')
  , Promise = require('bluebird')
  , request = Promise.promisify(require('request'));

describe('Aggregator', function () {

  it ('should decode/encode stuff properly', function () {
    return request('http://localhost:3000/search?q=' + encodeURIComponent("blank space")).spread(function (resp, body) {
      assert.equal(resp.statusCode, 200);
      body = JSON.parse(body);
      assert(body.length);
      assert(body.filter(function (el) {
        return el.title.toLowerCase().indexOf('taylor swift') > -1;
      })[0]);
    });
  });

  it('should get some google, bing and yahoo results for wiki', function () {
    var includes = {
      google: 0,
      yahoo: 0,
      bing: 0
    };
    return request('http://localhost:3000/search?q=wiki').spread(function (resp, body) {
      assert.equal(resp.statusCode, 200);
      body = JSON.parse(body);
      body.forEach(function (r) {
        includes.google += +(r.poweredBy === 'google');
        includes.yahoo += +(r.poweredBy === 'yahoo');
        includes.bing += +(r.poweredBy === 'bing');
      });

      assert(includes.google);
      assert(includes.yahoo);
      assert(includes.bing);
    });
  });

  it('should group top results together', function () {
    var includes = {
      google: 0,
      yahoo: 0,
      bing: 0
    };
    return request('http://localhost:3000/search?q=snowden').spread(function (resp, body) {
      assert.equal(resp.statusCode, 200);
      body = JSON.parse(body);
      body.slice(0, 3).forEach(function (r) {
        includes.google += +(r.poweredBy === 'google');
        includes.yahoo += +(r.poweredBy === 'yahoo');
        includes.bing += +(r.poweredBy === 'bing');
      });

      assert(includes.google);
      assert(includes.yahoo);
      assert(includes.bing);
    });
  });
});
