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
