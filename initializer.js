(function() {
  function initialize() {
    var canvas = document.createElement('canvas');
    var app = new App(canvas);
    var container = document.querySelector('body > .container');
    container.appendChild(canvas);
    app.run();
  }

  window.addEventListener('load', initialize);
})();
