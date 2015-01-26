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


