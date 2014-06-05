function Vector2() {
  this.components = new Float32Array(2);
  if(arguments.length == 2) {
    this.components[0] = arguments[0];
    this.components[1] = arguments[1];
  }
}

Vector2.prototype.get = function(index) {
  return this.components[index];
};
