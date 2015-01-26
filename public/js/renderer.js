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
