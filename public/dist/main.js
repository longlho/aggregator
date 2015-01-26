(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var TIMEOUT = 300;

exports.search = function (query, opts) {
  opts || (opts = {});

  var request = new XMLHttpRequest()
    , params
    , cb = opts.cb || Function.prototype
    , url = '/search?';

  params = {
    q: query,
    offset: opts.offset,
    limit: opts.limit
  };

  url += Object.keys(params)
    .map(function (k) {
      return k + '=' + encodeURIComponent(params[k]);
    })
    .join('&');

  request.open('GET', url, true);

  request.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status >= 200 && this.status < 400) {
        // Success!
        return cb(null, JSON.parse(this.responseText));
      } else {
        return cb(new Error('Non-200 response from server'));
      }
    }
  };

  request.send();
  request = null;
};

exports.debouncedSearch = (function () {

  var timeoutId;

  return function () {
    var args = Array.prototype.slice.call(arguments);

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    timeoutId = setTimeout(function () {
      exports.search.apply(null, args);
    }, TIMEOUT);
  };
})();

},{}],2:[function(require,module,exports){
'use strict';

var utils = require('./utils')
  , renderer = require('./renderer')
  , driver = require('./driver');

var $searchInput = document.getElementById('search')
  , $searchArea  = document.getElementById('search-results');

utils.addEventListener($searchInput, 'keyup', function (e) {
  var query = e.target.value;

  if (!query) {
    $searchArea.innerHTML = '';
    return;
  }

  $searchArea.innerHTML = 'Searching...';

  driver.debouncedSearch(query, {
    cb: function (err, data) {
      $searchArea.innerHTML = renderer.render(data);
    }
  });
});



},{"./driver":1,"./renderer":3,"./utils":4}],3:[function(require,module,exports){
'use strict';

var ROW_TMPL = " \
  <li> \
    <a href=\"{{ url }}\">{{ title }}</a> \
    <p>{{ url }}</p> \
    <p>{{ description }}</p> \
    <p>Powered By: {{ poweredBy }}</p> \
  </li> \
  ";

var RESULTS_TMPL = " \
  <ul>{{ results }}</ul> \
  ";

var TMPL_REGEX = /\{\{\s*([\w\.]+)\s*\}\}/gi;

/**
 * Get the value from an object given a nested key
 * @example
 * getValue({ test: { foo: 1 }}, 'test.foo') -> 1
 * @param  {Object} data
 * @param  {String} key
 * @return {}
 */
function getValue(data, key) {
  try {
    // Get the 1st key
    var subKey = key.substr(0, key.indexOf('.'));

    // No? that means we only have 1 key
    if (!subKey) {
      return data[key];
    }

    // Otherwise recursively split keys & look in subobject until we find it
    return getValue(data[subKey], key.substr(subKey.length + 1));
  } catch (e) {
    // Ignore
  }
}

/**
 * Render a template string with data object
 * @param  {String} tmpl template string
 * @param  {Object} data data object
 * @return {String}      rendered template
 */
exports.renderTemplate = function (tmpl, data) {
  return tmpl.replace(TMPL_REGEX, function (match, key) {
    var val = getValue(data, key) || '';
    if (typeof val === 'object') {
      val = JSON.stringify(val) || '';
    }
    return val;
  });
};

/**
 * Render search result set
 * @param  {Object[]} results List of results
 * @return {String}         rendered string
 */
exports.render = function (results) {
  var rows = results.map(function (r) {
    return exports.renderTemplate(ROW_TMPL, r);
  });

  return exports.renderTemplate(RESULTS_TMPL, {
    results: rows.join('')
  });
};

},{}],4:[function(require,module,exports){
'use strict';

module.exports = {
  removeEventListener: function (el, eventName, handler) {
    if (el.removeEventListener) {
      el.removeEventListener(eventName, handler);
    } else {
      el.detachEvent('on' + eventName, handler);
    }
  },
  addEventListener: function (el, eventName, handler) {
    if (el.addEventListener) {
      el.addEventListener(eventName, handler);
    } else {
      el.attachEvent('on' + eventName, handler);
    }
  },
  stopPropagation: function (e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  }
};

},{}]},{},[2]);
