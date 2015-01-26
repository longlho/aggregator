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

// Render default paginators
dom.$paginators.innerHTML = renderer.renderPaginators();

// Since `getElementsByClassName` does not return a real Array
dom.$pages = Array.prototype.slice.call(dom.$paginators.getElementsByClassName('page'));

// Attach event handler to paginator
dom.$pages.forEach(function (page) {
  utils.addEventListener(page, 'click', function (e) {
    state.page = +e.target.textContent || e.target.innerText;

    onStateChange();
  });
});


// Attach event handler to search input to re-search when a key is pressed
utils.addEventListener(dom.$searchInput, 'keyup', function (e) {
  var query = e.target.value;

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


