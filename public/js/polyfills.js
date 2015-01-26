'use strict';
(function (window, document) {
  var SHIM_BASE_PATH = '//cdnjs.cloudflare.com/ajax/libs/';

  function importScript (src) {
    var sourcePath = SHIM_BASE_PATH + src;
    // IMPORTANT: Horrible, but this guarantees the shims got loaded first for older browsers
    document.write('<script type="text/javascript" src="' + sourcePath + '"></script>');
  }

  // Polyfill getElementsByClassName (IE8)
  if (!document.getElementsByClassName) {
    window.Element.prototype.getElementsByClassName = document.constructor.prototype.getElementsByClassName = function (classNames) {
      classNames || (classNames = '*');
      classNames = classNames.split(' ').join('.');

      if (classNames !== '*') {
        classNames = '.' + classNames;
      }

      return this.querySelectorAll(classNames);
    };
  }

  // Polyfill ES5 (<=IE8)
  if (!Array.prototype.forEach) {
    importScript('es5-shim/4.0.5/es5-shim.min.js');
    importScript('es5-shim/4.0.5/es5-sham.min.js');
  }

})(window, document);
