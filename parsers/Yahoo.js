'use strict';

var BaseParser = require('./Base')
  , util = require('util');

function Yahoo () {
  BaseParser.call(this, 'yahoo', 'http://search.yahoo.com/search?q=%s');
}

util.inherits(Yahoo, BaseParser);

Yahoo.prototype.RESULT_SELECTOR = '#web .res';
Yahoo.prototype.TITLE_SELECTOR = '.yschttl';
Yahoo.prototype.URL_SELECTOR = '.url';
Yahoo.prototype.DESC_SELECTOR = '.abstr';

module.exports = Yahoo;
