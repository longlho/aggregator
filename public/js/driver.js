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
