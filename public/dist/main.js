(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// Timeout to debounce
var TIMEOUT = 333;

/**
 * Fetch search result from server based on query
 * @param  {String} query Keywords to search for
 * @param  {Object} opts  Options
 * @param  {Number} opts.page Page (for pagination)
 * @param  {Function} opts.cb Callback function
 */
exports.search = function (query, opts) {
  opts || (opts = {});

  var request = new XMLHttpRequest()
    , params
    , cb = opts.cb || Function.prototype
    , url = '/search?';

  params = {
    q: query,
    page: (+opts.page - 1) || 0
  };

  // Serialized query string params
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
        // JSON parse this since we assume API provides JSON
        return cb(null, JSON.parse(this.responseText));
      } else {
        return cb(new Error('Non-200 response from server'));
      }
    }
  };

  request.send();
  request = null;
};

/**
 * Debounced search function that only fires every `TIMEOUT
 */
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

var utils        = require('./utils')
  , renderer     = require('./renderer')
  , driver       = require('./driver')
  , state        = window.state = {}
  , dom          = window.dom = {};

// Find our key DOM elements
dom.$searchInput = document.getElementById('search');
dom.$searchArea  = document.getElementById('search-results');
dom.$paginators  = document.getElementById('paginators');

/**
 * State change handler
 */
function onStateChange() {
  driver.debouncedSearch(state.query, {
    page: state.page,
    cb: function (err, data) {
      dom.$searchArea.innerHTML = renderer.renderSearchResults(data);
    }
  });
}

function getTarget(e) {
  e || (e = window.event);
  return e.target || e.srcElement;
}

// Render default paginators
dom.$paginators.innerHTML = renderer.renderPaginators();

// Since `getElementsByClassName` does not return a real Array
dom.$pages = dom.$paginators.getElementsByClassName('page');

// Attach event handler to paginator, can't use forEach on HTMLCollectionList
for (var i = 0; i < dom.$pages.length; i++) {
  var page = dom.$pages[i];
  utils.addEventListener(page, 'click', function (e) {
    var target = getTarget(e);
    state.page = +target.textContent || target.innerText;

    onStateChange();
  });
}

// Attach event handler to search input to re-search when a key is pressed
utils.addEventListener(dom.$searchInput, 'keyup', function (e) {
  var target = getTarget(e)
    , query = target.value;

  // Don't search if it's blank
  if (!query) {
    dom.$searchArea.innerHTML = '';
    return;
  }

  // Don't re-search if it's the same query
  if (state.query === query) {
    return;
  }

  state.query = query;

  dom.$searchArea.innerHTML = 'Searching...';

  onStateChange();
});



},{"./driver":1,"./renderer":3,"./utils":4}],3:[function(require,module,exports){
'use strict';

var ROW_TMPL = " \
  <li> \
    <a href=\"{{ link }}\" target=\"_blank\">{{ title }}</a> \
    <p>{{ url }}</p> \
    <p>{{ description }}</p> \
    <p>Powered By: {{ poweredBy }}</p> \
  </li> \
  ";

var RESULTS_TMPL = " \
  <ul>{{ results }}</ul> \
  ";

var PAGINATOR_TMPL = " \
  <a class=\"page\" href=\"javascript:void(0)\">{{ num }}</a> \
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
exports.renderSearchResults = function (results) {
  var rows = results.map(function (r) {
    // Normalize r.url since some services return w/ http(s)
    r.link = r.url;
    if (r.link.substr(0, 4) !== 'http') {
      r.link = '//' + r.url;
    }
    return exports.renderTemplate(ROW_TMPL, r);
  });

  return exports.renderTemplate(RESULTS_TMPL, {
    results: rows.join('')
  });
};

/**
 * Render paginators from page `start` to page `end`
 * @param  {Number} start Start page
 * @param  {Number} end   End page
 * @return {String} Rendered paginator
 */
exports.renderPaginators = function (start, end) {
  start || (start = 0);
  end || (end = 10);
  var paginator = [];
  for (var i = start; i < end; i++) {
    paginator.push(exports.renderTemplate(PAGINATOR_TMPL, { num: i + 1 }));
  }
  return paginator.join('');
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
