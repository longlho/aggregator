'use strict';

var express = require("express")
  , Promise = require('bluebird')
  , _ = require('underscore')._
  , PORT = 3000
  , parserTypes = ['Google', 'Bing', 'Yahoo']
  , parsers = [];

// Create parsers
parsers = parserTypes.map(function (type) {
  return new (require('./parsers/' + type))();
});

var app = express();

/**
 * Search across 3 services using certain keyword `kw`
 * @param  {String} kw keyword
 * @return {Promise[]}    Array of promises
 */
function search (kw) {
  return parsers.map(function (parser) {
    return parser.fetch(kw);
  });
}

app.get('/search', function (req, res) {
  var kw = req.query.q;
  return Promise.all(search(kw))
    .then(function (results) {
      return res.json(

        // Since it's ordered, group the top results together
        _.zip.apply(_, results)

        // Then combine them altogether
        .reduce(function (r1, r2) {
          return r1.concat(r2);
        })

        // null-filter because some services might return less results than others
        .filter(function (r) {
          return !!r;
        })
      );
    });
});

app.listen(PORT);
console.log('Server running at', PORT);
