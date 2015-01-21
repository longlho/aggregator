'use strict';

var BaseParser = require('./Base')
  , util = require('util');

function Bing () {
  BaseParser.call(this, 'bing', 'http://www.bing.com/search?q=%s');
}

util.inherits(Bing, BaseParser);

Bing.prototype.RESULT_SELECTOR = '#b_results .b_algo';
Bing.prototype.TITLE_SELECTOR = 'h2';
Bing.prototype.URL_SELECTOR = '.b_attribution > cite';
Bing.prototype.DESC_SELECTOR = '.b_caption > p, .b_snippet';

module.exports = Bing;
