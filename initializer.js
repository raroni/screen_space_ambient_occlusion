(function() {
  function initialize() {
    var container = document.querySelector('body > .container');
    var app = new App();
    container.appendChild(app.element);
    app.run();
  }

  window.addEventListener('load', initialize);
})();
