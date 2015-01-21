'use strict';

var BaseParser = require('./Base')
  , util = require('util');

function Google () {
  BaseParser.call(this, 'google', 'http://www.google.com/search?q=%s');
}

util.inherits(Google, BaseParser);

Google.prototype.RESULT_SELECTOR = '#search li.g';
Google.prototype.TITLE_SELECTOR = 'h3.r';
Google.prototype.URL_SELECTOR = '.kv > cite';
Google.prototype.DESC_SELECTOR = '.st';

module.exports = Google;
