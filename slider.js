function Slider(label, min, max, value) {
  var labelElement = document.createElement('div');
  labelElement.innerHTML = label;

  var inputElement = document.createElement('input');
  inputElement.type = "range";
  inputElement.min = min;
  inputElement.max = max;
  inputElement.step = 0.05;
  inputElement.value = value;
  inputElement.oninput = function() {
    this.onChange(inputElement.value);
  }.bind(this);

  var container = document.createElement('div');
  container.appendChild(labelElement);
  container.appendChild(inputElement);

  this.element = container;
}
