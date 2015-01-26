'use strict';

var Promise = require("bluebird")
  , sprintf = require('sprintf')
  , cheerio = require('cheerio')
  , request = Promise.promisify(require("request"));

/**
 * Base Parser that fetches a remote URL based on a URL pattern
 * @param {String} id      Parser ID
 * @param {String} pattern URL Pattern
 */
function BaseParser (id, pattern) {
  this.id = id;
  this.pattern = pattern;
}

BaseParser.prototype.RESULT_SELECTOR = '';
BaseParser.prototype.URL_SELECTOR = '';
BaseParser.prototype.TITLE_SELECTOR = '';
BaseParser.prototype.DESC_SELECTOR = '';

/**
 * Fetch search result based on kw & pre-defined pattern, then parse it
 * @param  {String} kw Keywords
 * @return {Promise<Object[]>}    Promise containing the results
 */
BaseParser.prototype.fetch = function (kw, page) {
  var self = this
    , url = sprintf(this.pattern, encodeURIComponent(kw), page * 10);

  return request(url)
    .spread(function (resp, body) {
      return self._parse(body);
    });
};

/**
 * Parse body of the response
 * @param  {String} body Body of the response
 * @return {Object[]}      List of result objects
 */
BaseParser.prototype._parse = function (body) {
  var self = this
    , $ = cheerio.load(body)
    , $searchLis = $(this.RESULT_SELECTOR)
    , result = [];

  $searchLis
    .each(function () {
      var $li = $(this)
        , url = $li.find(self.URL_SELECTOR).text();

      // A search result w/o URL is pretty useless
      if (!url) {
        return null;
      }

      result.push({
        title: $li.find(self.TITLE_SELECTOR).text(),
        url: url,
        description: $li.find(self.DESC_SELECTOR).text(),
        poweredBy: self.id
      });
    });

  return result;
};

module.exports = BaseParser;
